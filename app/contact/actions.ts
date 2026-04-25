'use server'

import { createClient } from '@/lib/supabase/server'
import { sanitizeShortText, sanitizeText } from '@/lib/sanitize'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function submitContact(formData: FormData) {
  const name = sanitizeShortText(formData.get('name') as string)
  const email = sanitizeShortText(formData.get('email') as string)
  const subject = sanitizeShortText(formData.get('subject') as string)
  const message = sanitizeText(formData.get('message') as string)

  if (!name || !email || !subject || !message) {
    return { error: 'جميع الحقول مطلوبة' }
  }

  if (!EMAIL_REGEX.test(email)) {
    return { error: 'البريد الإلكتروني غير صحيح' }
  }

  if (name.length < 3 || name.length > 100) {
    return { error: 'الاسم يجب أن يكون بين 3 و 100 حرف' }
  }

  if (subject.length < 5 || subject.length > 200) {
    return { error: 'العنوان يجب أن يكون بين 5 و 200 حرف' }
  }

  if (message.length < 10 || message.length > 5000) {
    return { error: 'الرسالة يجب أن تكون بين 10 و 5000 حرف' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('contact_messages').insert({
    name,
    email,
    subject,
    message,
  })

  if (error) {
    console.error('[contact POST]', error)
    return { error: 'فشل إرسال الرسالة. حاول مجدداً.' }
  }

  return { success: true, message: 'شكراً لتواصلك معنا. سنرد عليك قريباً.' }
}
