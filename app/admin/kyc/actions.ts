'use server'

import { createClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/notifications'
import { revalidatePath } from 'next/cache'

async function verifyAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()
  return profile?.role === 'admin'
}

export async function approveKyc(userId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !(await verifyAdmin(user.id))) {
    return { error: 'غير مصرح' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ kyc_status: 'verified', verified_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) {
    console.error('[approveKyc]', error)
    return { error: 'فشل تحديث الحالة' }
  }

  await createNotification(
    userId,
    'kyc_update',
    'تم التحقق من هويتك',
    'تهانينا! تم الموافقة على طلب التحقق من هويتك.',
    '/dashboard'
  ).catch((err) => console.error('[approveKyc notification]', err))

  revalidatePath('/admin/kyc')
  return { success: true }
}

export async function rejectKyc(userId: string, reason: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !(await verifyAdmin(user.id))) {
    return { error: 'غير مصرح' }
  }

  if (!reason || reason.trim().length === 0) {
    return { error: 'يجب تحديد سبب الرفض' }
  }

  const { error } = await supabase.from('profiles').update({
    kyc_status: 'rejected',
    kyc_rejection_reason: reason.trim(),
    rejected_at: new Date().toISOString(),
  }).eq('id', userId)

  if (error) {
    console.error('[rejectKyc]', error)
    return { error: 'فشل تحديث الحالة' }
  }

  await createNotification(
    userId,
    'kyc_update',
    'لم يتم قبول طلب التحقق',
    `السبب: ${reason}. يرجى المحاولة مجدداً.`,
    '/kyc'
  ).catch((err) => console.error('[rejectKyc notification]', err))

  revalidatePath('/admin/kyc')
  return { success: true }
}
