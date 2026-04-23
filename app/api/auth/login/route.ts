import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = body.email ?? ''
    const password = body.password ?? ''

    // Validate inputs
    if (!email?.trim()) {
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني مطلوب', statusCode: 400 },
        { status: 400 }
      )
    }

    if (!password?.trim()) {
      return NextResponse.json(
        { success: false, error: 'كلمة المرور مطلوبة', statusCode: 400 },
        { status: 400 }
      )
    }

    // Create Supabase client for API route
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              req.cookies.set(name, value)
            })
          },
        },
      }
    )

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    })

    // Handle authentication errors
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return NextResponse.json(
          { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة', statusCode: 401 },
          { status: 401 }
        )
      }
      return NextResponse.json(
        { success: false, error: 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى', statusCode: 401 },
        { status: 401 }
      )
    }

    if (!data.session || !data.user) {
      return NextResponse.json(
        { success: false, error: 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى', statusCode: 401 },
        { status: 401 }
      )
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', data.user.id)
      .single()

    return NextResponse.json(
      {
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
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً', statusCode: 500 },
      { status: 500 }
    )
  }
}
