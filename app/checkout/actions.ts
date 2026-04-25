'use server'

import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { redirect } from 'next/navigation'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
const PLATFORM_FEE_RATE = 0.015

export async function createStripeSession(projectId: string, amount: number, message?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  if (!projectId || amount <= 0) {
    throw new Error('بيانات الاستثمار غير صحيحة')
  }

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('title, status, founder_id')
    .eq('id', projectId)
    .single()

  if (projectError || !project) {
    throw new Error('المشروع غير موجود')
  }

  if (project.status !== 'active') {
    throw new Error('هذا المشروع لا يقبل استثمارات حالياً')
  }

  const { data: investment, error: investmentError } = await supabase
    .from('investments')
    .insert({
      investor_id: user.id,
      project_id: projectId,
      amount,
      status: 'committed',
    })
    .select('id')
    .single()

  if (investmentError || !investment) {
    throw new Error('فشل إنشاء سجل الاستثمار')
  }

  // Send message to founder if provided
  if (message && message.trim() && project.founder_id) {
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id: project.founder_id,
        content: `📈 استثمار جديد: ${message}`,
        read: false,
      })

    if (messageError) {
      console.error('Failed to send message:', messageError)
      // Don't throw error - continue with investment even if message fails
    }
  }

  const platformFee = Math.round(amount * PLATFORM_FEE_RATE * 100)
  const investmentCents = Math.round(amount * 100)

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `استثمار في: ${project.title}`,
            description: `معرف العملية: INV-${investment.id.slice(0, 8).toUpperCase()}`,
          },
          unit_amount: investmentCents,
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'رسوم المنصة (1.5%)',
          },
          unit_amount: platformFee,
        },
        quantity: 1,
      },
    ],
    metadata: {
      investment_id: investment.id,
      project_id: projectId,
      investor_id: user.id,
    },
    success_url: `${APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_URL}/checkout?projectId=${projectId}&cancelled=true`,
  })

  if (!session.url) {
    throw new Error('فشل إنشاء جلسة الدفع')
  }

  return { url: session.url }
}
