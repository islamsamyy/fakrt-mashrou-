import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { validateEmail, validatePassword } from '@/lib/validation'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const fullName = body.fullName ?? body.name ?? ''
    const email = body.email ?? ''
    const password = body.password ?? ''
    const role = body.role ?? 'investor'

    // Validate inputs
    if (!email?.trim()) {
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني مطلوب', statusCode: 400 },
        { status: 400 }
      )
    }

    if (!fullName?.trim()) {
      return NextResponse.json(
        { success: false, error: 'الاسم الكامل مطلوب', statusCode: 400 },
        { status: 400 }
      )
    }

    if (!password?.trim()) {
      return NextResponse.json(
        { success: false, error: 'كلمة المرور مطلوبة', statusCode: 400 },
        { status: 400 }
      )
    }

    // Validate email format (RFC 5321 compliant)
    if (!validateEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني غير صحيح', statusCode: 400 },
        { status: 400 }
      )
    }

    // Validate password strength
    if (!validatePassword(password)) {
      return NextResponse.json(
        { success: false, error: 'كلمة المرور ضعيفة (8+ حروف، أحرف كبيرة/صغيرة، أرقام مطلوبة)', statusCode: 400 },
        { status: 400 }
      )
    }

    if (!['investor', 'founder'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'نوع الحساب غير صحيح', statusCode: 400 },
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

    // Check for duplicate email
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email.trim())
      .maybeSingle()

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'هذا البريد الإلكتروني مسجل بالفعل', statusCode: 409 },
        { status: 409 }
      )
    }

    // Create user in Supabase Auth
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
      if (error.message.includes('already registered')) {
        return NextResponse.json(
          { success: false, error: 'هذا البريد الإلكتروني مسجل بالفعل', statusCode: 409 },
          { status: 409 }
        )
      }
      throw error
    }

    if (!data.user?.id) {
      return NextResponse.json(
        { success: false, error: 'فشل التسجيل. يرجى المحاولة مرة أخرى', statusCode: 500 },
        { status: 500 }
      )
    }

    // Create profile record
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      email: email.trim(),
      full_name: fullName.trim(),
      role,
    })

    if (profileError) {
      throw profileError
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: data.user.id,
            email: data.user.email || '',
          },
        },
        statusCode: 201,
      },
      { status: 201 }
    )
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error('Registration error:', errorMsg)
    return NextResponse.json(
      { success: false, error: `فشل التسجيل: ${errorMsg}`, statusCode: 500 },
      { status: 500 }
    )
  }
}
