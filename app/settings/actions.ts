'use server'

import { createClient } from '@/lib/supabase/server'
import { sanitizeShortText, sanitizeText } from '@/lib/sanitize'
import { revalidatePath } from 'next/cache'

const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_AVATAR_SIZE = 5 * 1024 * 1024 // 5MB

export async function updateProfileInfo(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'غير مصرح' }

  const fullName = sanitizeShortText(formData.get('full_name') as string)
  const bio = sanitizeText(formData.get('bio') as string)
  const avatarFile = formData.get('avatar') as File | null

  if (!fullName) return { error: 'الاسم الكامل مطلوب' }

  const updatePayload: Record<string, unknown> = {
    full_name: fullName,
    bio: bio || null,
  }

  if (avatarFile && avatarFile.size > 0) {
    if (!ALLOWED_AVATAR_TYPES.includes(avatarFile.type)) {
      return { error: 'نوع الصورة غير مدعوم. يُسمح بـ JPEG أو PNG أو WebP' }
    }

    if (avatarFile.size > MAX_AVATAR_SIZE) {
      return { error: 'حجم الصورة يتجاوز 5MB' }
    }

    const ext = avatarFile.name.split('.').pop()
    const filename = `${user.id}/avatar_${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filename, await avatarFile.arrayBuffer(), {
        upsert: true,
        contentType: avatarFile.type,
      })

    if (uploadError) {
      console.error('[updateProfileInfo] avatar upload:', uploadError)
      return { error: 'فشل رفع الصورة. يرجى المحاولة مرة أخرى' }
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filename)
    updatePayload.avatar_url = urlData.publicUrl
  }

  const { error } = await supabase
    .from('profiles')
    .update(updatePayload)
    .eq('id', user.id)

  if (error) {
    console.error('[updateProfileInfo] update:', error)
    return { error: 'فشل تحديث الملف الشخصي' }
  }

  revalidatePath('/settings')
  revalidatePath('/dashboard/founder')
  revalidatePath('/dashboard/investor')

  return { success: true }
}
