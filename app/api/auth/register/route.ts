import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateEmail, validatePassword } from '@/lib/validation'

const VALID_ROLES = ['investor', 'founder'] as const
type Role = typeof VALID_ROLES[number]

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'صيغة الطلب غير صحيحة' }, { status: 400 })
  }

  const email = String(body.email ?? '').trim()
  const fullName = String(body.fullName ?? body.name ?? '').trim()
  const password = String(body.password ?? '').trim()
  const role = String(body.role ?? 'investor') as Role

  if (!email) return NextResponse.json({ error: 'البريد الإلكتروني مطلوب' }, { status: 400 })
  if (!fullName) return NextResponse.json({ error: 'الاسم الكامل مطلوب' }, { status: 400 })
  if (!password) return NextResponse.json({ error: 'كلمة المرور مطلوبة' }, { status: 400 })

  if (!validateEmail(email)) {
    return NextResponse.json({ error: 'البريد الإلكتروني غير صحيح' }, { status: 400 })
  }

  const passwordResult = validatePassword(password)
  if (!passwordResult.valid) {
    return NextResponse.json(
      { error: passwordResult.errors[0]?.message ?? 'كلمة المرور ضعيفة' },
      { status: 400 }
    )
  }

  if (fullName.length < 3) {
    return NextResponse.json({ error: 'يجب أن يكون الاسم 3 أحرف على الأقل' }, { status: 400 })
  }

  if (fullName.length > 100) {
    return NextResponse.json({ error: 'الاسم طويل جداً' }, { status: 400 })
  }

  if (!/^[؀-ۿa-zA-Z0-9\s\-'.]+$/.test(fullName)) {
    return NextResponse.json({ error: 'الاسم يحتوي على أحرف غير مقبولة' }, { status: 400 })
  }

  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: 'نوع الحساب غير صحيح' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: signupData, error: signupError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, role } },
  })

  if (signupError) {
    const msg = signupError.message
    if (msg.includes('rate limit') || msg.includes('too many') || msg.includes('Too many')) {
      return NextResponse.json({ error: 'محاولات كثيرة. يرجى المحاولة بعد قليل' }, { status: 429 })
    }
    if (msg.includes('already registered') || msg.includes('already exists')) {
      return NextResponse.json({ error: 'هذا البريد الإلكتروني مسجل بالفعل' }, { status: 409 })
    }
    if (msg.includes('password')) {
      return NextResponse.json({ error: 'كلمة المرور غير قوية بما يكفي' }, { status: 400 })
    }
    console.error('[register POST] signUp error:', msg)
    return NextResponse.json({ error: 'فشل التسجيل. يرجى المحاولة مرة أخرى' }, { status: 500 })
  }

  if (!signupData?.user?.id) {
    return NextResponse.json({ error: 'فشل التسجيل. يرجى المحاولة مرة أخرى' }, { status: 500 })
  }

  const userId = signupData.user.id

  const { error: profileError } = await supabase.from('profiles').insert({
    id: userId,
    email,
    full_name: fullName,
    role,
  })

  if (profileError) {
    console.error('[register POST] profile insert error:', profileError)
  }

  return NextResponse.json(
    { data: { user: { id: userId, email: signupData.user.email ?? '' } } },
    { status: 201 }
  )
}
