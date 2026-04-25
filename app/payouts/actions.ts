'use server'

import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { createNotification } from '@/lib/notifications'

interface PayoutRequest {
  founderUserId: string
  amount: number
  currency?: string
}

const STATUS_MAP: Record<string, string> = {
  succeeded: 'completed',
  failed: 'failed',
  in_transit: 'processing',
  paid: 'completed',
  canceled: 'cancelled',
}

export async function initiatePayout(request: PayoutRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'غير مصرح' }

  if (user.id !== request.founderUserId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return { error: 'غير مصرح بإجراء هذه العملية' }
    }
  }

  if (request.amount <= 0) {
    return { error: 'المبلغ يجب أن يكون أكثر من صفر' }
  }

  try {
    const { data: founderProfile } = await supabase
      .from('profiles')
      .select('kyc_data')
      .eq('id', request.founderUserId)
      .single()

    if (!founderProfile) return { error: 'المستخدم غير موجود' }

    const stripeAccountId = (founderProfile.kyc_data as { stripe_account_id?: string } | null)?.stripe_account_id

    if (!stripeAccountId) {
      return { error: 'لم يتم ربط حساب الدفع' }
    }

    const { data: payout, error: payoutError } = await supabase
      .from('payouts')
      .insert({
        founder_id: request.founderUserId,
        amount: request.amount,
        currency: request.currency ?? 'usd',
        status: 'pending',
      })
      .select('id')
      .single()

    if (payoutError || !payout) {
      return { error: 'فشل إنشاء طلب الدفع' }
    }

    const stripePayout = await stripe.payouts.create(
      {
        amount: Math.round(request.amount * 100),
        currency: request.currency ?? 'usd',
        description: `Payout to founder - ID: ${payout.id.slice(0, 8)}`,
        metadata: { payout_id: payout.id, founder_id: request.founderUserId },
      },
      { stripeAccount: stripeAccountId }
    )

    await supabase
      .from('payouts')
      .update({ stripe_payout_id: stripePayout.id, status: 'processing' })
      .eq('id', payout.id)

    await createNotification(
      request.founderUserId,
      'investment',
      'تم بدء تحويل الأموال',
      `تم بدء تحويل ${request.amount} ريال. قد يستغرق 1-3 أيام عمل.`,
      '/payouts'
    ).catch(() => {})

    return { success: true, payoutId: payout.id, status: stripePayout.status }
  } catch (error) {
    console.error('[initiatePayout]', error)
    return { error: error instanceof Error ? error.message : 'فشل إنشاء الدفع' }
  }
}

export async function handlePayoutStatusUpdate(payoutId: string, stripePayout: { status: string; arrival_date?: number; id: string }) {
  const supabase = await createClient()

  try {
    const status = STATUS_MAP[stripePayout.status] ?? stripePayout.status

    const { data: payout } = await supabase
      .from('payouts')
      .update({
        status,
        stripe_payout_id: stripePayout.id,
        arrival_date: stripePayout.arrival_date ? new Date(stripePayout.arrival_date * 1000).toISOString() : null,
      })
      .eq('id', payoutId)
      .select('founder_id')
      .single()

    if (!payout) return { success: true }

    const notificationTitle = status === 'completed' ? 'تم إيداع الأموال بنجاح' : status === 'failed' ? 'فشل التحويل' : 'تحديث حالة الدفع'

    const notificationMsg =
      status === 'completed'
        ? 'تم تحويل الأموال إلى حسابك البنكي بنجاح.'
        : status === 'failed'
          ? 'فشل تحويل الأموال. يرجى التحقق من بيانات حسابك.'
          : 'تم تحديث حالة دفعتك.'

    await createNotification(payout.founder_id, 'investment', notificationTitle, notificationMsg, '/payouts').catch(() => {})

    return { success: true }
  } catch (error) {
    console.error('[handlePayoutStatusUpdate]', error)
    return { error: 'فشل تحديث حالة الدفع' }
  }
}

export async function getFounderPayouts(founderId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || (user.id !== founderId && (await isAdmin(user.id)) === false)) {
    return { error: 'غير مصرح', payouts: [] }
  }

  try {
    const { data: payouts } = await supabase
      .from('payouts')
      .select('id, amount, currency, status, created_at, arrival_date')
      .eq('founder_id', founderId)
      .order('created_at', { ascending: false })

    return { payouts: payouts ?? [] }
  } catch (error) {
    console.error('[getFounderPayouts]', error)
    return { error: 'فشل تحميل سجل الدفع', payouts: [] }
  }
}

export async function requestPayout(projectId: string, amount: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'غير مصرح' }

  if (amount <= 0) return { error: 'المبلغ يجب أن يكون أكثر من صفر' }

  try {
    const { data: project } = await supabase
      .from('projects')
      .select('founder_id, amount_raised')
      .eq('id', projectId)
      .single()

    if (!project || project.founder_id !== user.id) {
      return { error: 'هذا المشروع لا يخصك' }
    }

    if ((project.amount_raised ?? 0) < amount) {
      return { error: `المبلغ المطلوب أكثر من الأموال المتاحة (${project.amount_raised} ريال)` }
    }

    return await initiatePayout({ founderUserId: user.id, amount, currency: 'usd' })
  } catch (error) {
    console.error('[requestPayout]', error)
    return { error: 'فشل طلب الدفع' }
  }
}

async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single()
  return profile?.role === 'admin'
}
