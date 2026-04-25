import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'صيغة الطلب غير صحيحة' }, { status: 400 })
  }

  const email = String(body.email ?? '').trim()
  const password = String(body.password ?? '').trim()

  if (!email) return NextResponse.json({ error: 'البريد الإلكتروني مطلوب' }, { status: 400 })
  if (!password) return NextResponse.json({ error: 'كلمة المرور مطلوبة' }, { status: 400 })

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    const msg = error.message.toLowerCase()
    if (msg.includes('invalid login credentials')) {
      return NextResponse.json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }, { status: 401 })
    }
    console.error('[login POST]', error.message)
    return NextResponse.json({ error: 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى' }, { status: 401 })
  }

  if (!data.session?.user) {
    return NextResponse.json({ error: 'فشل تسجيل الدخول' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', data.session.user.id)
    .single()

  return NextResponse.json({
    data: {
      user: {
        id: data.session.user.id,
        email: data.session.user.email ?? '',
        full_name: profile?.full_name ?? 'مستخدم',
      },
      token: data.session.access_token,
    },
  })
}
