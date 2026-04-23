/**
 * BUG #10 FIX: Create /invest POST endpoint
 * Handles investment creation with full validation
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface InvestmentRequest {
  projectId: string
  amount: number
  notes?: string
}

interface InvestmentResponse {
  success: boolean
  data?: {
    investmentId: string
    projectId: string
    amount: number
    status: string
  }
  error?: string
  statusCode?: number
}

export async function POST(request: NextRequest): Promise<NextResponse<InvestmentResponse>> {
  try {
    // Parse request body
    let body: InvestmentRequest
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'صيغة الطلب غير صحيحة. يجب إرسال JSON.',
          statusCode: 400,
        },
        { status: 400 }
      )
    }

    // BUG #8 FIX: Validate investment amount
    if (!body.projectId || typeof body.projectId !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'معرّف المشروع مطلوب',
          statusCode: 400,
        },
        { status: 400 }
      )
    }

    if (!body.amount || typeof body.amount !== 'number') {
      return NextResponse.json(
        {
          success: false,
          error: 'المبلغ يجب أن يكون رقماً',
          statusCode: 400,
        },
        { status: 400 }
      )
    }

    // Validate amount is within acceptable range (1K - 10M SAR)
    const MIN_INVESTMENT = 1000
    const MAX_INVESTMENT = 10000000

    if (body.amount < MIN_INVESTMENT) {
      return NextResponse.json(
        {
          success: false,
          error: `الحد الأدنى للاستثمار هو ${MIN_INVESTMENT.toLocaleString()} ريال`,
          statusCode: 400,
        },
        { status: 400 }
      )
    }

    if (body.amount > MAX_INVESTMENT) {
      return NextResponse.json(
        {
          success: false,
          error: `الحد الأقصى للاستثمار هو ${MAX_INVESTMENT.toLocaleString()} ريال`,
          statusCode: 400,
        },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get current user
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'يجب تسجيل الدخول أولاً',
          statusCode: 401,
        },
        { status: 401 }
      )
    }

    // BUG #9 FIX: Validate project exists
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, title, founder_id, status')
      .eq('id', body.projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        {
          success: false,
          error: 'المشروع غير موجود',
          statusCode: 404,
        },
        { status: 404 }
      )
    }

    // Prevent investor from investing in their own project (if founder)
    if (project.founder_id === userData.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'لا يمكنك الاستثمار في مشروعك الخاص',
          statusCode: 403,
        },
        { status: 403 }
      )
    }

    // Check if project is still accepting investments
    if (project.status !== 'active') {
      return NextResponse.json(
        {
          success: false,
          error: 'هذا المشروع لا يقبل استثمارات جديدة',
          statusCode: 409,
        },
        { status: 409 }
      )
    }

    // Check if user has already invested in this project
    const { data: existingInvestment } = await supabase
      .from('investments')
      .select('id')
      .eq('project_id', body.projectId)
      .eq('investor_id', userData.user.id)
      .maybeSingle()

    if (existingInvestment) {
      return NextResponse.json(
        {
          success: false,
          error: 'أنت بالفعل مستثمر في هذا المشروع. يمكنك زيادة الاستثمار من خلال المحفظة.',
          statusCode: 409,
        },
        { status: 409 }
      )
    }

    // Create investment record
    const { data: investment, error: investmentError } = await supabase
      .from('investments')
      .insert({
        project_id: body.projectId,
        investor_id: userData.user.id,
        amount: body.amount,
        status: 'pending',
        notes: body.notes || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (investmentError || !investment) {
      console.error('Investment creation error:', investmentError)
      return NextResponse.json(
        {
          success: false,
          error: 'فشل إنشاء الاستثمار. يرجى المحاولة مرة أخرى',
          statusCode: 500,
        },
        { status: 500 }
      )
    }

    // BUG #4 FIX: Return proper JSON response
    return NextResponse.json(
      {
        success: true,
        data: {
          investmentId: investment.id,
          projectId: investment.project_id,
          amount: investment.amount,
          status: investment.status,
        },
        statusCode: 201,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Invest endpoint error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً',
        statusCode: 500,
      },
      { status: 500 }
    )
  }
}
