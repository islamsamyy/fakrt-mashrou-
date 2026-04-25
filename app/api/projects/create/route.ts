import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const VALIDATION_RULES = {
  title: { minLength: 3, maxLength: 100 },
  category: { allowed: ['fintech', 'realestate', 'ai', 'health', 'saas', 'ecommerce', 'cleantech'] as const },
  description: { minLength: 20, maxLength: 2000 },
  fundingGoal: { min: 50_000, max: 100_000_000 },
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'صيغة الطلب غير صحيحة' }, { status: 400 })
  }

  const title = String(body.title ?? '').trim()
  const category = String(body.category ?? '').trim()
  const description = String(body.description ?? '').trim()
  const fundingGoal = Number(body.fundingGoal ?? 0)

  const errors: string[] = []

  if (title.length < VALIDATION_RULES.title.minLength) {
    errors.push(`العنوان يجب أن يكون ${VALIDATION_RULES.title.minLength} أحرف على الأقل`)
  }
  if (title.length > VALIDATION_RULES.title.maxLength) {
    errors.push(`العنوان لا يمكن أن يتجاوز ${VALIDATION_RULES.title.maxLength} حرف`)
  }

  if (!VALIDATION_RULES.category.allowed.includes(category as typeof VALIDATION_RULES.category.allowed[number])) {
    errors.push(`القطاع غير صحيح. الخيارات: ${VALIDATION_RULES.category.allowed.join(', ')}`)
  }

  if (description.length < VALIDATION_RULES.description.minLength) {
    errors.push(`الوصف يجب أن يكون ${VALIDATION_RULES.description.minLength} حرف على الأقل`)
  }
  if (description.length > VALIDATION_RULES.description.maxLength) {
    errors.push(`الوصف لا يمكن أن يتجاوز ${VALIDATION_RULES.description.maxLength} حرف`)
  }

  if (fundingGoal < VALIDATION_RULES.fundingGoal.min) {
    errors.push(`الحد الأدنى: ${VALIDATION_RULES.fundingGoal.min.toLocaleString('ar-SA')} ريال`)
  }
  if (fundingGoal > VALIDATION_RULES.fundingGoal.max) {
    errors.push(`الحد الأقصى: ${VALIDATION_RULES.fundingGoal.max.toLocaleString('ar-SA')} ريال`)
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: errors[0], errors }, { status: 400 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('kyc_status')
    .eq('id', user.id)
    .single()

  if (profile?.kyc_status !== 'verified') {
    return NextResponse.json({ error: 'يجب التحقق من هويتك أولاً قبل إنشاء مشروع' }, { status: 403 })
  }

  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      title,
      category,
      description: description.replace(/<[^>]*>/g, '').trim(),
      funding_goal: fundingGoal,
      amount_raised: 0,
      status: 'draft',
      founder_id: user.id,
      img: body.image || null,
      video_url: body.videoUrl || null,
    })
    .select('id, title, category, funding_goal, status')
    .single()

  if (error) {
    console.error('[projects/create]', error)
    return NextResponse.json({ error: 'فشل إنشاء المشروع' }, { status: 500 })
  }

  return NextResponse.json({ data: project }, { status: 201 })
}
