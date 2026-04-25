'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

const VALID_ROLES = ['investor', 'founder'] as const
type Role = typeof VALID_ROLES[number]

export async function login(formData: FormData) {
  const email = (formData.get('email') as string)?.trim()
  const password = (formData.get('password') as string)?.trim()

  if (!email) return { success: false, error: 'البريد الإلكتروني مطلوب' }
  if (!password) return { success: false, error: 'كلمة المرور مطلوبة' }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }
    }
    return { success: false, error: 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى' }
  }

  if (!data.session || !data.user) {
    return { success: false, error: 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', data.user.id)
    .single()

  revalidatePath('/', 'layout')
  redirect(`/dashboard/${profile?.role ?? 'investor'}`)
}

export async function register(formData: FormData) {
  const email = (formData.get('email') as string)?.trim()
  const fullName = (formData.get('fullName') as string)?.trim()
  const password = (formData.get('password') as string)?.trim()
  const role = ((formData.get('role') as string) ?? 'founder') as Role

  if (!email) return { success: false, error: 'البريد الإلكتروني مطلوب' }
  if (!fullName) return { success: false, error: 'الاسم الكامل مطلوب' }
  if (!password) return { success: false, error: 'كلمة المرور مطلوبة' }

  if (!VALID_ROLES.includes(role)) {
    return { success: false, error: 'نوع الحساب غير صحيح' }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: 'البريد الإلكتروني غير صحيح' }
  }

  if (password.length < 8) {
    return { success: false, error: 'يجب أن تكون كلمة المرور 8 أحرف على الأقل' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, role } },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { success: false, error: 'هذا البريد الإلكتروني مسجل بالفعل' }
    }
    return { success: false, error: 'فشل التسجيل. يرجى المحاولة مرة أخرى' }
  }

  if (!data.user) {
    return { success: false, error: 'فشل التسجيل. يرجى المحاولة مرة أخرى' }
  }

  await Promise.allSettled([
    supabase.from('profiles').insert({
      id: data.user.id,
      email,
      full_name: fullName,
      role,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.id}`,
      kyc_status: 'pending',
    }),
    supabase.from('notification_preferences').insert({
      user_id: data.user.id,
      email_on_investment: true,
      email_on_message: true,
      email_on_kyc_update: true,
      email_on_milestone: true,
      email_weekly_summary: false,
      push_on_investment: true,
      push_on_message: true,
      push_on_kyc_update: true,
      in_app_notifications: true,
    }),
  ])

  if (!data.session) {
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      return {
        success: true,
        message: 'تم إنشاء الحساب! يرجى تسجيل الدخول.',
      }
    }
  }

  revalidatePath('/', 'layout')
  redirect(`/dashboard/${role}`)
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function updateProfile(role: string, interests: string[]) {
  if (!VALID_ROLES.includes(role as Role)) {
    return { error: 'نوع الحساب غير صحيح' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'جلسة العمل انتهت، يرجى تسجيل الدخول مرة أخرى' }

  const { error } = await supabase
    .from('profiles')
    .update({ role, interests })
    .eq('id', user.id)

  if (error) return { error: 'خطأ في تحديث البيانات' }

  revalidatePath('/', 'layout')
  redirect(`/dashboard/${role}`)
}

export async function verifySession() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return { valid: false, error: 'جلستك انتهت. يرجى تسجيل الدخول مرة أخرى' }
  }

  return { valid: true }
}
