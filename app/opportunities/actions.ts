'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveOpportunity(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'يرجى تسجيل الدخول أولاً' }

  if (!projectId) return { error: 'معرف المشروع مطلوب' }

  try {
    const { data: existing } = await supabase
      .from('saved_opportunities')
      .select('id')
      .eq('user_id', user.id)
      .eq('project_id', projectId)
      .maybeSingle()

    if (existing) {
      return { error: 'هذا المشروع محفوظ بالفعل' }
    }

    const { error } = await supabase.from('saved_opportunities').insert({
      user_id: user.id,
      project_id: projectId,
    })

    if (error) throw error

    revalidatePath('/opportunities')
    revalidatePath('/saved')
    return { success: true, saved: true }
  } catch (error) {
    console.error('[saveOpportunity]', error)
    return { error: 'فشل حفظ المشروع' }
  }
}

export async function unsaveOpportunity(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'يرجى تسجيل الدخول أولاً' }

  if (!projectId) return { error: 'معرف المشروع مطلوب' }

  try {
    const { error } = await supabase
      .from('saved_opportunities')
      .delete()
      .eq('user_id', user.id)
      .eq('project_id', projectId)

    if (error) throw error

    revalidatePath('/opportunities')
    revalidatePath('/saved')
    return { success: true, saved: false }
  } catch (error) {
    console.error('[unsaveOpportunity]', error)
    return { error: 'فشل إزالة المشروع' }
  }
}

export async function toggleSaveOpportunity(projectId: string, currentlySaved: boolean) {
  return currentlySaved ? unsaveOpportunity(projectId) : saveOpportunity(projectId)
}

export async function getSavedOpportunities() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'يرجى تسجيل الدخول أولاً', saved: [] }

  try {
    const { data: saved } = await supabase
      .from('saved_opportunities')
      .select('project_id')
      .eq('user_id', user.id)

    return { success: true, saved: (saved ?? []).map((s: { project_id: string }) => s.project_id) }
  } catch (error) {
    console.error('[getSavedOpportunities]', error)
    return { error: 'فشل تحميل المحفوظات', saved: [] }
  }
}

export async function isProjectSaved(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { isSaved: false }

  try {
    const { data } = await supabase
      .from('saved_opportunities')
      .select('id')
      .eq('user_id', user.id)
      .eq('project_id', projectId)
      .maybeSingle()

    return { isSaved: !!data }
  } catch (error) {
    console.error('[isProjectSaved]', error)
    return { isSaved: false }
  }
}
