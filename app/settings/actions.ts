'use server'

import { createClient } from '@/lib/supabase/server'
import { sanitizeShortText, sanitizeText } from '@/lib/sanitize'
import { revalidatePath } from 'next/cache'

export async function updateProfileInfo(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'غير مصرح' }
    }

    const fullName = sanitizeShortText(formData.get('full_name') as string)
    const bio = sanitizeText(formData.get('bio') as string)
    const avatarFile = formData.get('avatar') as File | null

    if (!fullName) {
      return { error: 'الاسم الكامل مطلوب' }
    }

    let avatarUrl: string | null = null

    // Upload avatar if provided (optional - skip on storage errors)
    if (avatarFile && avatarFile.size > 0) {
      try {
        const ext = avatarFile.name.split('.').pop()
        const fileBuffer = await avatarFile.arrayBuffer()
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(`${user.id}/avatar.${ext}`, fileBuffer, { upsert: true, contentType: avatarFile.type })

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(`${user.id}/avatar.${ext}`)
          avatarUrl = publicUrl
        }
      } catch (err) {
        console.error('Avatar upload error:', err)
      }
    }

    // Build update payload
    const updatePayload: Record<string, unknown> = {
      full_name: fullName,
      bio,
    }

    if (avatarUrl) {
      updatePayload.avatar_url = avatarUrl
    }

    // Update profile
    const { error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', user.id)

    if (error) {
      return { error: 'فشل تحديث الملف الشخصي' }
    }

    revalidatePath('/settings')
    revalidatePath('/', 'layout') // Update navbar
    return { success: true }
  } catch (error) {
    console.error('Update profile error:', error)
    return { error: 'حدث خطأ غير متوقع' }
  }
}
