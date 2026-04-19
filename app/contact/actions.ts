'use server'

import { createClient } from '@/lib/supabase/server'
import { sanitizeShortText, sanitizeText } from '@/lib/sanitize'

export async function submitContact(formData: FormData) {
  const supabase = await createClient()

  const name = sanitizeShortText(formData.get('name') as string)
  const email = sanitizeShortText(formData.get('email') as string)
  const subject = sanitizeShortText(formData.get('subject') as string)
  const message = sanitizeText(formData.get('message') as string)

  if (!name || !email || !subject || !message) {
    return { error: 'جميع الحقول مطلوبة' }
  }

  const { error } = await supabase.from('contact_messages').insert({
    name,
    email,
    subject,
    message,
  })

  if (error) {
    console.error('Contact form error:', error)
    return { error: 'فشل إرسال الرسالة. حاول مجدداً.' }
  }

  return { success: true, message: 'شكراً لتواصلك معنا. سنرد عليك قريباً.' }
}
