'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

interface LoginResponse {
  success: boolean
  data?: {
    user: { id: string; email: string; full_name: string }
    token: string
  }
  error?: string
  statusCode?: number
}

export async function login(formData: FormData): Promise<LoginResponse> {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // BUG #3 FIX: Validate empty credentials → return 400
    if (!email?.trim()) {
      return {
        success: false,
        error: 'البريد الإلكتروني مطلوب',
        statusCode: 400,
      }
    }

    if (!password?.trim()) {
      return {
        success: false,
        error: 'كلمة المرور مطلوبة',
        statusCode: 400,
      }
    }

    const supabase = await createClient()

    // BUG #1 & #2 FIX: Proper password validation and error handling
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    })

    // Handle authentication errors → return 401
    if (error) {
      // BUG #1: Wrong password
      // BUG #2: Non-existent email (both return "Invalid login credentials")
      if (error.message.includes('Invalid login credentials')) {
        return {
          success: false,
          error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
          statusCode: 401,
        }
      }

      return {
        success: false,
        error: 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى',
        statusCode: 401,
      }
    }

    if (!data.session || !data.user) {
      return {
        success: false,
        error: 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى',
        statusCode: 401,
      }
    }

    // BUG #4 FIX: Return proper JSON with token on success
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', data.user.id)
      .single()

    const response: LoginResponse = {
      success: true,
      data: {
        user: {
          id: data.user.id,
          email: data.user.email || '',
          full_name: profile?.full_name || 'مستخدم',
        },
        token: data.session.access_token,
      },
      statusCode: 200,
    }

    revalidatePath('/', 'layout')
    return response
  } catch (err) {
    console.error('Login error:', err)
    return {
      success: false,
      error: 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً',
      statusCode: 500,
    }
  }
}

interface RegisterResponse {
  success: boolean
  data?: {
    user: { id: string; email: string }
  }
  error?: string
  statusCode?: number
  message?: string
}

export async function register(formData: FormData): Promise<RegisterResponse> {
  try {
    const fullName = formData.get('fullName') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = (formData.get('role') as string) || 'founder'

    // BUG #7 FIX: Validate missing registration fields → return 400
    if (!email?.trim()) {
      return {
        success: false,
        error: 'البريد الإلكتروني مطلوب',
        statusCode: 400,
      }
    }

    if (!fullName?.trim()) {
      return {
        success: false,
        error: 'الاسم الكامل مطلوب',
        statusCode: 400,
      }
    }

    if (!password?.trim()) {
      return {
        success: false,
        error: 'كلمة المرور مطلوبة',
        statusCode: 400,
      }
    }

    if (!['investor', 'founder'].includes(role)) {
      return {
        success: false,
        error: 'نوع الحساب غير صحيح',
        statusCode: 400,
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return {
        success: false,
        error: 'البريد الإلكتروني غير صحيح',
        statusCode: 400,
      }
    }

    // Validate password strength
    if (password.length < 8) {
      return {
        success: false,
        error: 'يجب أن تكون كلمة المرور 8 أحرف على الأقل',
        statusCode: 400,
      }
    }

    const supabase = await createClient()

    // BUG #6 FIX: Check for duplicate email first → return 409 Conflict
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email.trim())
      .maybeSingle()

    if (existingUser) {
      return {
        success: false,
        error: 'هذا البريد الإلكتروني مسجل بالفعل',
        statusCode: 409,
      }
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
      options: {
        data: {
          full_name: fullName.trim(),
          role,
        },
      },
    })

    if (error) {
      // Handle duplicate email error from auth service
      if (error.message.includes('already registered')) {
        return {
          success: false,
          error: 'هذا البريد الإلكتروني مسجل بالفعل',
          statusCode: 409,
        }
      }

      return {
        success: false,
        error: 'فشل التسجيل. يرجى المحاولة مرة أخرى',
        statusCode: 400,
      }
    }

    if (!data.user) {
      return {
        success: false,
        error: 'فشل التسجيل. يرجى المحاولة مرة أخرى',
        statusCode: 400,
      }
    }

    // Create profile record
    await supabase.from('profiles').insert({
      id: data.user.id,
      email: email.trim(),
      full_name: fullName.trim(),
      role,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.id}`,
      created_at: new Date().toISOString(),
      kyc_status: 'pending',
    })

    // Auto-create notification preferences
    await supabase.from('notification_preferences').insert({
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
      created_at: new Date().toISOString(),
    })

    // If session is null, it means email confirmation is required
    if (!data.session) {
      return {
        success: true,
        data: {
          user: {
            id: data.user.id,
            email: data.user.email || '',
          },
        },
        message:
          'تم إنشاء الحساب بنجاً! يرجى التحقق من بريدك الإلكتروني لتنشيط الحساب قبل تسجيل الدخول.',
        statusCode: 201,
      }
    }

    revalidatePath('/', 'layout')
    return {
      success: true,
      data: {
        user: {
          id: data.user.id,
          email: data.user.email || '',
        },
      },
      statusCode: 201,
    }
  } catch (err) {
    console.error('Register error:', err)
    return {
      success: false,
      error: 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً',
      statusCode: 500,
    }
  }
}

/**
 * BUG #5 FIX: Verify session token is not expired
 * Returns 401 if expired or invalid
 */
interface SessionVerifyResponse {
  valid: boolean
  session?: { access_token: string; expires_at?: number }
  error?: string
  statusCode?: number
}

export async function verifySession(): Promise<SessionVerifyResponse> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getSession()

    if (error || !data.session) {
      return {
        valid: false,
        error: 'جلستك انتهت. يرجى تسجيل الدخول مرة أخرى',
        statusCode: 401,
      }
    }

    // Check if token is about to expire (expires in less than 5 minutes)
    const expiresAt = data.session.expires_at
    const now = Math.floor(Date.now() / 1000)
    const timeUntilExpiry = (expiresAt || 0) - now

    if (timeUntilExpiry < 300) {
      // Try to refresh token
      const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession()

      if (refreshError || !refreshed.session) {
        return {
          valid: false,
          error: 'فشل تحديث الجلسة. يرجى تسجيل الدخول مرة أخرى',
          statusCode: 401,
        }
      }

      return {
        valid: true,
        session: refreshed.session,
        statusCode: 200,
      }
    }

    return {
      valid: true,
      session: data.session,
      statusCode: 200,
    }
  } catch (err) {
    console.error('Session verification error:', err)
    return {
      valid: false,
      error: 'خطأ في التحقق من الجلسة',
      statusCode: 401,
    }
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function updateProfile(role: string, interests: string[]) {
  console.log('--- updateProfile called ---');
  console.log('Role:', role);
  console.log('Interests:', interests);

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    console.error('updateProfile error: No user session found');
    return { error: 'جلسة العمل انتهت، يرجى تسجيل الدخول مرة أخرى' };
  }

  console.log('Updating profile for user:', user.id);

  const { error } = await supabase
    .from('profiles')
    .update({ 
      role, 
      interests,
      // Ensure we mark them as having completed onboarding if we have a flag, 
      // but here we just update role and interests.
    })
    .eq('id', user.id)

  if (error) {
    console.error('Supabase update error:', error);
    return { error: `خطأ في تحديث البيانات: ${error.message}` };
  }
  
  console.log('Update profile success. Revalidating and redirecting...');
  
  // Revalidate the entire site to update dashboards and navbars
  revalidatePath('/', 'layout')
  
  // Construct destination
  const destination = `/dashboard/${role}`;
  console.log('Redirecting to:', destination);
  
  // Perform redirect
  redirect(destination)
}
