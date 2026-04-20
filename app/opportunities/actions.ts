'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Save (bookmark) an opportunity
 */
export async function saveOpportunity(projectId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'يرجى تسجيل الدخول أولاً' };
    }

    // Check if already saved
    const { data: existing } = await supabase
      .from('saved_opportunities')
      .select('id')
      .eq('investor_id', user.id)
      .eq('project_id', projectId)
      .single();

    if (existing) {
      return { error: 'هذا المشروع محفوظ بالفعل' };
    }

    // Insert save record
    const { error } = await supabase
      .from('saved_opportunities')
      .insert({
        investor_id: user.id,
        project_id: projectId,
      });

    if (error) {
      console.error('Save opportunity error:', error);
      return { error: 'فشل حفظ المشروع' };
    }

    revalidatePath('/opportunities');
    revalidatePath('/saved');
    return { success: true, saved: true };
  } catch (error) {
    console.error('Save opportunity error:', error);
    return {
      error: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
    };
  }
}

/**
 * Unsave (remove bookmark) an opportunity
 */
export async function unsaveOpportunity(projectId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'يرجى تسجيل الدخول أولاً' };
    }

    // Delete save record
    const { error } = await supabase
      .from('saved_opportunities')
      .delete()
      .eq('investor_id', user.id)
      .eq('project_id', projectId);

    if (error) {
      console.error('Unsave opportunity error:', error);
      return { error: 'فشل إزالة المشروع من المحفوظات' };
    }

    revalidatePath('/opportunities');
    revalidatePath('/saved');
    return { success: true, saved: false };
  } catch (error) {
    console.error('Unsave opportunity error:', error);
    return {
      error: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
    };
  }
}

/**
 * Toggle save status
 */
export async function toggleSaveOpportunity(projectId: string, currentlySaved: boolean) {
  if (currentlySaved) {
    return await unsaveOpportunity(projectId);
  } else {
    return await saveOpportunity(projectId);
  }
}

/**
 * Get user's saved opportunities
 */
export async function getSavedOpportunities() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'يرجى تسجيل الدخول أولاً', saved: [] };
    }

    const { data: saved, error } = await supabase
      .from('saved_opportunities')
      .select('project_id')
      .eq('investor_id', user.id);

    if (error) {
      console.error('Get saved error:', error);
      return { error: 'فشل تحميل المحفوظات', saved: [] };
    }

    return {
      success: true,
      saved: saved.map((s: any) => s.project_id),
    };
  } catch (error) {
    console.error('Get saved error:', error);
    return { error: 'حدث خطأ غير متوقع', saved: [] };
  }
}

/**
 * Check if project is saved by current user
 */
export async function isProjectSaved(projectId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { isSaved: false };
    }

    const { data } = await supabase
      .from('saved_opportunities')
      .select('id')
      .eq('investor_id', user.id)
      .eq('project_id', projectId)
      .single();

    return { isSaved: !!data };
  } catch (error) {
    console.error('Check saved error:', error);
    return { isSaved: false };
  }
}
