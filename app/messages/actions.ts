'use server'

import { createClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/notifications'
import { sanitizeText } from '@/lib/sanitize'
import { revalidatePath } from 'next/cache'

const MIN_MESSAGE_LENGTH = 1
const MAX_MESSAGE_LENGTH = 5000
const EDIT_TIME_LIMIT = 15 * 60 * 1000

export async function sendMessage(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'غير مصرح' }

  const receiverId = String(formData.get('receiver_id') ?? '').trim()
  const content = String(formData.get('content') ?? '').trim()

  if (!receiverId || !content) {
    return { error: 'معلومات الرسالة ناقصة' }
  }

  const sanitized = sanitizeText(content)
  if (!sanitized || sanitized.length < MIN_MESSAGE_LENGTH || sanitized.length > MAX_MESSAGE_LENGTH) {
    return { error: `الرسالة يجب أن تكون بين ${MIN_MESSAGE_LENGTH} و ${MAX_MESSAGE_LENGTH} حرف` }
  }

  try {
    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: receiverId,
      content: sanitized,
      read: false,
    })

    if (error) throw error

    await createNotification(receiverId, 'message', 'رسالة جديدة', `لديك رسالة جديدة من ${user.email}`, '/messages').catch(() => {})

    revalidatePath('/messages')
    return { success: true }
  } catch (error) {
    console.error('[sendMessage]', error)
    return { error: 'فشل إرسال الرسالة' }
  }
}

export async function markMessagesRead(senderId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'غير مصرح' }

  try {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('receiver_id', user.id)
      .eq('sender_id', senderId)

    if (error) throw error

    revalidatePath('/messages')
    return { success: true }
  } catch (error) {
    console.error('[markMessagesRead]', error)
    return { error: 'فشل تحديث حالة الرسائل' }
  }
}

export async function deleteMessage(messageId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'غير مصرح' }

  try {
    const { data: message } = await supabase
      .from('messages')
      .select('sender_id')
      .eq('id', messageId)
      .single()

    if (!message || message.sender_id !== user.id) {
      return { error: 'لا يمكنك حذف هذه الرسالة' }
    }

    const { error } = await supabase.from('messages').delete().eq('id', messageId)

    if (error) throw error

    revalidatePath('/messages')
    return { success: true }
  } catch (error) {
    console.error('[deleteMessage]', error)
    return { error: 'فشل حذف الرسالة' }
  }
}

export async function editMessage(messageId: string, newContent: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'غير مصرح' }

  const content = newContent.trim()
  if (!content || content.length > MAX_MESSAGE_LENGTH) {
    return { error: `الرسالة يجب أن تكون بين 1 و ${MAX_MESSAGE_LENGTH} حرف` }
  }

  try {
    const { data: message } = await supabase
      .from('messages')
      .select('sender_id, created_at')
      .eq('id', messageId)
      .single()

    if (!message || message.sender_id !== user.id) {
      return { error: 'لا يمكنك تعديل هذه الرسالة' }
    }

    const messageAge = Date.now() - new Date(message.created_at).getTime()
    if (messageAge > EDIT_TIME_LIMIT) {
      return { error: 'لا يمكن تعديل الرسائل القديمة (أكثر من 15 دقيقة)' }
    }

    const { error } = await supabase
      .from('messages')
      .update({ content: sanitizeText(content), edited_at: new Date().toISOString() })
      .eq('id', messageId)

    if (error) throw error

    revalidatePath('/messages')
    return { success: true }
  } catch (error) {
    console.error('[editMessage]', error)
    return { error: 'فشل تعديل الرسالة' }
  }
}
