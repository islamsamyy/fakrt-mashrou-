'use server';

import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { createNotification } from '@/lib/notifications';

interface PayoutRequest {
  founderUserId: string;
  amount: number;
  currency?: string;
}

/**
 * Create a payout to a founder's connected Stripe account
 * Called when:
 * - Founder requests withdrawal
 * - Project reaches funding goal and has payout scheduled
 */
export async function initiatePayout(request: PayoutRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'غير مصرح' };
  }

  // Verify user is admin or the founder requesting payout
  if (user.id !== request.founderUserId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return { error: 'غير مصرح بإجراء هذه العملية' };
    }
  }

  try {
    // Get founder's Stripe account ID
    const { data: founderProfile } = await supabase
      .from('profiles')
      .select('id, kyc_data')
      .eq('id', request.founderUserId)
      .single();

    if (!founderProfile) {
      return { error: 'المستخدم غير موجود' };
    }

    // Check if founder has connected Stripe account
    const stripeAccountId = (founderProfile.kyc_data as any)?.stripe_account_id;
    if (!stripeAccountId) {
      return { error: 'لم يتم ربط حساب الدفع للمؤسس' };
    }

    // Create payout record first
    const { data: payout, error: payoutError } = await supabase
      .from('payouts')
      .insert({
        founder_id: request.founderUserId,
        amount: request.amount,
        currency: request.currency || 'usd',
        status: 'pending',
        stripe_payout_id: null,
      })
      .select('id')
      .single();

    if (payoutError || !payout) {
      return { error: 'فشل إنشاء طلب الدفع' };
    }

    // Create Stripe payout
    const stripePayout = await stripe.payouts.create(
      {
        amount: Math.round(request.amount * 100), // Convert to cents
        currency: request.currency || 'usd',
        description: `Payout to founder - ID: ${payout.id}`,
        metadata: {
          payout_id: payout.id,
          founder_id: request.founderUserId,
        },
      },
      { stripeAccount: stripeAccountId }
    );

    // Update payout record with Stripe payout ID
    await supabase
      .from('payouts')
      .update({
        stripe_payout_id: stripePayout.id,
        status: 'processing',
      })
      .eq('id', payout.id);

    // Notify founder
    await createNotification(
      request.founderUserId,
      'investment',
      'تم بدء تحويل الأموال',
      `تم بدء تحويل ${request.amount} ريال إلى حسابك البنكي. قد يستغرق 1-3 أيام عمل.`,
      '/payouts'
    );

    return {
      success: true,
      payoutId: payout.id,
      stripPayoutId: stripePayout.id,
      status: stripePayout.status,
    };
  } catch (error) {
    console.error('Payout error:', error);
    return {
      error: error instanceof Error ? error.message : 'فشل إنشاء الدفع',
    };
  }
}

/**
 * Handle Stripe payout status updates via webhook
 */
export async function handlePayoutStatusUpdate(
  payoutId: string,
  stripePayout: any
) {
  const supabase = await createClient();

  try {
    // Map Stripe payout status to our status
    const statusMap: Record<string, string> = {
      succeeded: 'completed',
      failed: 'failed',
      in_transit: 'processing',
      paid: 'completed',
      canceled: 'cancelled',
    };

    const status = statusMap[stripePayout.status] || stripePayout.status;

    // Update payout record
    const { data: payout } = await supabase
      .from('payouts')
      .update({
        status,
        stripe_payout_id: stripePayout.id,
        arrival_date: stripePayout.arrival_date
          ? new Date(stripePayout.arrival_date * 1000).toISOString()
          : null,
      })
      .eq('id', payoutId)
      .select('founder_id')
      .single();

    if (payout && status === 'completed') {
      // Notify founder of successful payout
      await createNotification(
        payout.founder_id,
        'investment',
        'تم إيداع الأموال بنجاح',
        'تم تحويل الأموال إلى حسابك البنكي بنجاح.',
        '/payouts'
      );
    } else if (payout && status === 'failed') {
      // Notify founder of failed payout
      await createNotification(
        payout.founder_id,
        'investment',
        'فشل التحويل',
        'فشل تحويل الأموال. يرجى التحقق من بيانات حسابك البنكي والمحاولة مجدداً.',
        '/payouts'
      );
    }

    return { success: true };
  } catch (error) {
    console.error('Handle payout status error:', error);
    return {
      error: error instanceof Error ? error.message : 'فشل تحديث حالة الدفع',
    };
  }
}

/**
 * Get founder's payout history
 */
export async function getFounderPayouts(founderId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || (user.id !== founderId && user.id !== 'admin')) {
    return { error: 'غير مصرح' };
  }

  try {
    const { data: payouts, error } = await supabase
      .from('payouts')
      .select('*')
      .eq('founder_id', founderId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { payouts };
  } catch (error) {
    console.error('Get payouts error:', error);
    return { error: 'فشل تحميل سجل الدفع' };
  }
}

/**
 * Request payout from founder dashboard
 */
export async function requestPayout(projectId: string, amount: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'غير مصرح' };

  try {
    // Verify project belongs to this founder
    const { data: project } = await supabase
      .from('projects')
      .select('founder_id, amount_raised')
      .eq('id', projectId)
      .single();

    if (!project || project.founder_id !== user.id) {
      return { error: 'هذا المشروع لا يخصك' };
    }

    if (project.amount_raised < amount) {
      return {
        error: `المبلغ المطلوب أكثر من الأموال المتاحة (${project.amount_raised} ريال)`,
      };
    }

    // Create payout request
    return await initiatePayout({
      founderUserId: user.id,
      amount,
      currency: 'usd',
    });
  } catch (error) {
    console.error('Request payout error:', error);
    return { error: 'فشل طلب الدفع' };
  }
}
