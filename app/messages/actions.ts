'use server'

import { createClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/notifications'
import { sanitizeText } from '@/lib/sanitize'
import { revalidatePath } from 'next/cache'

export async function sendMessage(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'غير مصرح' }
    }

    const receiverId = formData.get('receiver_id') as string
    const content = formData.get('content') as string

    if (!receiverId || !content) {
      return { error: 'معلومات الرسالة ناقصة' }
    }

    const sanitizedContent = sanitizeText(content)
    if (!sanitizedContent) {
      return { error: 'الرسالة فارغة' }
    }

    // Insert message into database
    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: receiverId,
      content: sanitizedContent,
      read: false,
    })

    if (error) {
      console.error('Message insert error:', error)
      return { error: 'فشل إرسال الرسالة' }
    }

    // Notify receiver
    await createNotification(
      receiverId,
      'message',
      'رسالة جديدة',
      `لديك رسالة جديدة من ${user.email}`,
      '/messages'
    )

    revalidatePath('/messages')
    return { success: true }
  } catch (error) {
    console.error('Send message error:', error)
    return { error: 'حدث خطأ غير متوقع' }
  }
}

export async function markMessagesRead(senderId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'غير مصرح' }
    }

    // Mark all messages from senderId that are addressed to currentUser as read
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('receiver_id', user.id)
      .eq('sender_id', senderId)

    if (error) {
      console.error('Mark read error:', error)
    }

    revalidatePath('/messages')
  } catch (error) {
    console.error('Mark messages read error:', error)
  }
}

export async function deleteMessage(messageId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'غير مصرح' }
    }

    // Verify user is the sender
    const { data: message } = await supabase
      .from('messages')
      .select('sender_id')
      .eq('id', messageId)
      .single()

    if (!message || message.sender_id !== user.id) {
      return { error: 'لا يمكنك حذف هذه الرسالة' }
    }

    // Delete message
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)

    if (error) {
      console.error('Delete message error:', error)
      return { error: 'فشل حذف الرسالة' }
    }

    revalidatePath('/messages')
    return { success: true }
  } catch (error) {
    console.error('Delete message error:', error)
    return { error: 'حدث خطأ غير متوقع' }
  }
}

export async function editMessage(messageId: string, newContent: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'غير مصرح' }
    }

    if (!newContent || newContent.trim().length === 0) {
      return { error: 'الرسالة فارغة' }
    }

    // Verify user is the sender
    const { data: message } = await supabase
      .from('messages')
      .select('sender_id, created_at')
      .eq('id', messageId)
      .single()

    if (!message || message.sender_id !== user.id) {
      return { error: 'لا يمكنك تعديل هذه الرسالة' }
    }

    // Check if message is less than 15 minutes old
    const messageTime = new Date(message.created_at).getTime()
    const now = new Date().getTime()
    const fifteenMinutes = 15 * 60 * 1000

    if (now - messageTime > fifteenMinutes) {
      return { error: 'لا يمكن تعديل الرسائل القديمة (أكثر من 15 دقيقة)' }
    }

    const sanitizedContent = sanitizeText(newContent)

    // Update message
    const { error } = await supabase
      .from('messages')
      .update({ content: sanitizedContent, edited_at: new Date().toISOString() })
      .eq('id', messageId)

    if (error) {
      console.error('Edit message error:', error)
      return { error: 'فشل تعديل الرسالة' }
    }

    revalidatePath('/messages')
    return { success: true }
  } catch (error) {
    console.error('Edit message error:', error)
    return { error: 'حدث خطأ غير متوقع' }
  }
}
