import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { validateEmail, validatePassword, validateFullName } from '@/lib/validation'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const fullName = body.fullName ?? body.name ?? ''
    const email = body.email ?? ''
    const password = body.password ?? ''
    const role = body.role ?? 'investor'

    // Validate inputs - empty field checks
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
    try {
      if (!validateEmail(email)) {
        return NextResponse.json(
          { success: false, error: 'البريد الإلكتروني غير صحيح', statusCode: 400 },
          { status: 400 }
        )
      }
    } catch (emailError) {
      console.error('Email validation error:', emailError)
      return NextResponse.json(
        { success: false, error: 'خطأ في التحقق من البريد الإلكتروني', statusCode: 400 },
        { status: 400 }
      )
    }

    // Validate password strength
    try {
      const passwordResult = validatePassword(password)
      if (!passwordResult.valid) {
        return NextResponse.json(
          { success: false, error: passwordResult.errors[0]?.message || 'كلمة المرور ضعيفة', statusCode: 400 },
          { status: 400 }
        )
      }
    } catch (passwordError) {
      console.error('Password validation error:', passwordError)
      return NextResponse.json(
        { success: false, error: 'خطأ في التحقق من كلمة المرور', statusCode: 400 },
        { status: 400 }
      )
    }

    // Validate full name
    try {
      // Basic validation: at least 3 characters, not too long
      if (fullName.trim().length < 3) {
        return NextResponse.json(
          { success: false, error: 'يجب أن يكون الاسم 3 أحرف على الأقل', statusCode: 400 },
          { status: 400 }
        )
      }
      if (fullName.length > 100) {
        return NextResponse.json(
          { success: false, error: 'الاسم طويل جداً', statusCode: 400 },
          { status: 400 }
        )
      }
      // Allow alphanumeric, Arabic, spaces, hyphens, apostrophes, dots
      if (!/^[؀-ۿa-zA-Z0-9\s\-'.]+$/.test(fullName)) {
        return NextResponse.json(
          { success: false, error: 'الاسم يحتوي على أحرف غير صحيحة', statusCode: 400 },
          { status: 400 }
        )
      }
    } catch (nameError) {
      console.error('Full name validation error:', nameError)
      return NextResponse.json(
        { success: false, error: 'خطأ في التحقق من الاسم', statusCode: 400 },
        { status: 400 }
      )
    }

    // Validate role
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
    try {
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.trim())
        .maybeSingle()

      if (checkError && !checkError.message.includes('no rows')) {
        console.error('Profile check error:', checkError)
      }

      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'هذا البريد الإلكتروني مسجل بالفعل', statusCode: 409 },
          { status: 409 }
        )
      }
    } catch (dbError) {
      console.error('Database error checking duplicate email:', dbError)
      // Continue with signup anyway, let Supabase handle duplicate detection
    }

    // Create user in Supabase Auth
    let signupError = null
    let signupData = null

    try {
      const response = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            full_name: fullName.trim(),
            role,
          },
        },
      })
      signupData = response.data
      signupError = response.error
    } catch (error) {
      console.error('Supabase signup exception:', error)
      signupError = error as any
    }

    if (signupError) {
      const errorMessage = signupError?.message || String(signupError)

      // Handle rate limiting
      if (
        errorMessage.includes('rate limit') ||
        errorMessage.includes('too many') ||
        errorMessage.includes('Too many')
      ) {
        return NextResponse.json(
          { success: false, error: 'محاولات كثيرة. يرجى المحاولة بعد قليل', statusCode: 429 },
          { status: 429 }
        )
      }

      // Handle already registered
      if (
        errorMessage.includes('already registered') ||
        errorMessage.includes('already exists')
      ) {
        return NextResponse.json(
          { success: false, error: 'هذا البريد الإلكتروني مسجل بالفعل', statusCode: 409 },
          { status: 409 }
        )
      }

      // Handle weak password
      if (errorMessage.includes('password')) {
        return NextResponse.json(
          { success: false, error: 'كلمة المرور غير قوية بما يكفي', statusCode: 400 },
          { status: 400 }
        )
      }

      // Handle other errors
      console.error('Signup error:', errorMessage)
      return NextResponse.json(
        { success: false, error: 'فشل التسجيل. يرجى المحاولة مرة أخرى', statusCode: 500 },
        { status: 500 }
      )
    }

    if (!signupData?.user?.id) {
      console.error('Signup succeeded but no user ID returned')
      return NextResponse.json(
        { success: false, error: 'فشل التسجيل. يرجى المحاولة مرة أخرى', statusCode: 500 },
        { status: 500 }
      )
    }

    // Create profile record
    try {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: signupData.user.id,
        email: email.trim(),
        full_name: fullName.trim(),
        role,
      })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // Still return success even if profile creation fails, user account is created
      }
    } catch (profileError) {
      console.error('Profile creation exception:', profileError)
      // Still return success even if profile creation fails
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: signupData.user.id,
            email: signupData.user.email || '',
          },
        },
        statusCode: 201,
      },
      { status: 201 }
    )
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error('Registration error:', errorMsg, err)

    // Don't expose internal error messages to client
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في التسجيل. يرجى المحاولة لاحقاً', statusCode: 500 },
      { status: 500 }
    )
  }
}
