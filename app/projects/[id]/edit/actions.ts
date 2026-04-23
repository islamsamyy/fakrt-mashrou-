'use server'

import { createClient } from '@/lib/supabase/server'
import { sanitizeShortText, sanitizeText } from '@/lib/sanitize'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateProject(
  projectId: string,
  data: {
    title: string
    category: string
    description: string
    funding_goal: string
    status: string
    video_url?: string
  }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'غير مصرح' }
    }

    // Verify ownership
    const { data: project } = await supabase
      .from('projects')
      .select('founder_id')
      .eq('id', projectId)
      .single()

    if (!project || project.founder_id !== user.id) {
      return { error: 'غير مصرح' }
    }

    const { error } = await supabase.from('projects').update({
      title: sanitizeShortText(data.title),
      category: sanitizeShortText(data.category),
      description: sanitizeText(data.description),
      funding_goal: parseFloat(data.funding_goal),
      status: data.status,
      video_url: data.video_url || null,
    }).eq('id', projectId)

    if (error) {
      return { error: 'فشل تحديث المشروع' }
    }

    revalidatePath('/projects')
    revalidatePath(`/projects/${projectId}`)
    return { success: true }
  } catch (error) {
    console.error('Update project error:', error)
    return { error: 'حدث خطأ غير متوقع' }
  }
}

export async function deleteProject(projectId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'غير مصرح' }
    }

    // Verify ownership
    const { data: project } = await supabase
      .from('projects')
      .select('founder_id')
      .eq('id', projectId)
      .single()

    if (!project || project.founder_id !== user.id) {
      return { error: 'غير مصرح' }
    }

    // Check for active investments
    const { data: investments } = await supabase
      .from('investments')
      .select('*', { count: 'exact' })
      .eq('project_id', projectId)
      .neq('status', 'cancelled')

    if (investments && investments.length > 0) {
      return { error: 'لا يمكن حذف مشروع له استثمارات نشطة' }
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('founder_id', user.id)

    if (error) {
      return { error: 'فشل حذف المشروع' }
    }

    revalidatePath('/projects')
    return { success: true }
  } catch (error) {
    console.error('Delete project error:', error)
    return { error: 'حدث خطأ غير متوقع' }
  }
}
