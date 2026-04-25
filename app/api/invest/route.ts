import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const MIN_INVESTMENT = 1_000
const MAX_INVESTMENT = 10_000_000

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('investments')
    .select(`
      id, amount, status, created_at, notes,
      project:projects ( id, title, description, category, funding_goal, amount_raised, status )
    `)
    .eq('investor_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[invest GET]', error)
    return NextResponse.json({ error: 'فشل في جلب الاستثمارات' }, { status: 500 })
  }

  return NextResponse.json({ data: data ?? [], total: data?.length ?? 0 })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 })
  }

  let body: { projectId?: unknown; amount?: unknown; notes?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'صيغة الطلب غير صحيحة' }, { status: 400 })
  }

  const { projectId, amount, notes } = body

  if (!projectId || typeof projectId !== 'string') {
    return NextResponse.json({ error: 'معرّف المشروع مطلوب' }, { status: 400 })
  }

  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    return NextResponse.json({ error: 'المبلغ يجب أن يكون رقماً صحيحاً' }, { status: 400 })
  }

  if (amount < MIN_INVESTMENT) {
    return NextResponse.json(
      { error: `الحد الأدنى للاستثمار هو ${MIN_INVESTMENT.toLocaleString('ar-SA')} ريال` },
      { status: 400 }
    )
  }

  if (amount > MAX_INVESTMENT) {
    return NextResponse.json(
      { error: `الحد الأقصى للاستثمار هو ${MAX_INVESTMENT.toLocaleString('ar-SA')} ريال` },
      { status: 400 }
    )
  }

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, title, founder_id, status')
    .eq('id', projectId)
    .single()

  if (projectError || !project) {
    return NextResponse.json({ error: 'المشروع غير موجود' }, { status: 404 })
  }

  if (project.founder_id === user.id) {
    return NextResponse.json({ error: 'لا يمكنك الاستثمار في مشروعك الخاص' }, { status: 403 })
  }

  if (project.status !== 'active') {
    return NextResponse.json({ error: 'هذا المشروع لا يقبل استثمارات جديدة' }, { status: 409 })
  }

  const { data: existing } = await supabase
    .from('investments')
    .select('id')
    .eq('project_id', projectId)
    .eq('investor_id', user.id)
    .maybeSingle()

  if (existing) {
    return NextResponse.json(
      { error: 'أنت بالفعل مستثمر في هذا المشروع' },
      { status: 409 }
    )
  }

  const { data: investment, error: insertError } = await supabase
    .from('investments')
    .insert({
      project_id: projectId,
      investor_id: user.id,
      amount,
      status: 'pending',
      notes: typeof notes === 'string' ? notes : null,
    })
    .select('id, project_id, amount, status')
    .single()

  if (insertError || !investment) {
    console.error('[invest POST]', insertError)
    return NextResponse.json({ error: 'فشل إنشاء الاستثمار' }, { status: 500 })
  }

  return NextResponse.json(
    {
      data: {
        investmentId: investment.id,
        projectId: investment.project_id,
        amount: investment.amount,
        status: investment.status,
      },
    },
    { status: 201 }
  )
}
