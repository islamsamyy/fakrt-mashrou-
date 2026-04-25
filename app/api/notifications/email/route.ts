import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'

interface EmailNotificationRequest {
  userId: string
  type: 'investment' | 'message' | 'kyc' | 'project' | 'update'
  title: string
  message: string
  actionUrl?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as EmailNotificationRequest

    // Validate request
    if (!body.userId || !body.type || !body.title) {
      return NextResponse.json(
        { error: 'Missing required fields', statusCode: 400 },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Fetch user email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', body.userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User not found', statusCode: 404 },
        { status: 404 }
      )
    }

    // Store notification in database
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: body.userId,
        type: body.type,
        title: body.title,
        message: body.message,
        action_url: body.actionUrl || null,
        read: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (notificationError) {
      console.error('Notification creation error:', notificationError)
      return NextResponse.json(
        { error: 'Failed to create notification', statusCode: 500 },
        { status: 500 }
      )
    }

    // Build email HTML based on notification type
    const getEmailHTML = () => {
      const actionButton = body.actionUrl
        ? `<p><a href="${body.actionUrl}" style="background: #00ffd1; color: #020408; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">اعرض التفاصيل</a></p>`
        : ''

      return `
        <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; background: #f5f5f5; padding: 20px;">
          <div style="background: white; padding: 24px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #020408; margin-bottom: 16px;">${body.title}</h2>
            <p style="color: #444; line-height: 1.6; margin-bottom: 16px;">${body.message}</p>
            ${actionButton}
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
            <p style="color: #999; font-size: 12px;">هذا بريد تم إرساله تلقائياً من IDEA BUSINESS</p>
          </div>
        </div>
      `
    }

    // Send email
    const emailResult = await sendEmail({
      to: profile.email,
      subject: body.title,
      html: getEmailHTML(),
    })

    if (!emailResult.success) {
      console.error('Email send failed:', emailResult.error)
    }

    return NextResponse.json({
      success: true,
      data: notification,
      emailSent: emailResult.success,
      statusCode: 201,
    })
  } catch (error) {
    console.error('Email notification error:', error)
    return NextResponse.json(
      { error: 'Internal server error', statusCode: 500 },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', statusCode: 401 },
        { status: 401 }
      )
    }

    // Fetch user's notifications
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Notification fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch notifications', statusCode: 500 },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: notifications || [],
      total: notifications?.length || 0,
      unread: notifications?.filter(n => !n.read).length || 0,
      statusCode: 200,
    })
  } catch (error) {
    console.error('GET notifications error:', error)
    return NextResponse.json(
      { error: 'Internal server error', statusCode: 500 },
      { status: 500 }
    )
  }
}
