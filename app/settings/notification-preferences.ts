'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface NotificationPreferences {
  emailOnInvestment: boolean;
  emailOnMessage: boolean;
  emailOnKycUpdate: boolean;
  emailOnMilestone: boolean;
  emailWeeklySummary: boolean;
  pushOnInvestment: boolean;
  pushOnMessage: boolean;
  pushOnKycUpdate: boolean;
  inAppNotifications: boolean;
}

/**
 * Get user's notification preferences
 */
export async function getNotificationPreferences() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'غير مصرح', preferences: null };
    }

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Get preferences error:', error);
      return { error: 'فشل تحميل التفضيلات', preferences: null };
    }

    return {
      success: true,
      preferences: {
        emailOnInvestment: data.email_on_investment,
        emailOnMessage: data.email_on_message,
        emailOnKycUpdate: data.email_on_kyc_update,
        emailOnMilestone: data.email_on_milestone,
        emailWeeklySummary: data.email_weekly_summary,
        pushOnInvestment: data.push_on_investment,
        pushOnMessage: data.push_on_message,
        pushOnKycUpdate: data.push_on_kyc_update,
        inAppNotifications: data.in_app_notifications,
      },
    };
  } catch (error) {
    console.error('Get preferences error:', error);
    return {
      error: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
      preferences: null,
    };
  }
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  preferences: Partial<NotificationPreferences>
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'غير مصرح' };
    }

    const updateData: Record<string, any> = {};

    // Map camelCase to snake_case
    if (preferences.emailOnInvestment !== undefined) {
      updateData.email_on_investment = preferences.emailOnInvestment;
    }
    if (preferences.emailOnMessage !== undefined) {
      updateData.email_on_message = preferences.emailOnMessage;
    }
    if (preferences.emailOnKycUpdate !== undefined) {
      updateData.email_on_kyc_update = preferences.emailOnKycUpdate;
    }
    if (preferences.emailOnMilestone !== undefined) {
      updateData.email_on_milestone = preferences.emailOnMilestone;
    }
    if (preferences.emailWeeklySummary !== undefined) {
      updateData.email_weekly_summary = preferences.emailWeeklySummary;
    }
    if (preferences.pushOnInvestment !== undefined) {
      updateData.push_on_investment = preferences.pushOnInvestment;
    }
    if (preferences.pushOnMessage !== undefined) {
      updateData.push_on_message = preferences.pushOnMessage;
    }
    if (preferences.pushOnKycUpdate !== undefined) {
      updateData.push_on_kyc_update = preferences.pushOnKycUpdate;
    }
    if (preferences.inAppNotifications !== undefined) {
      updateData.in_app_notifications = preferences.inAppNotifications;
    }

    if (Object.keys(updateData).length === 0) {
      return { error: 'لم تحدد أي تغييرات' };
    }

    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('notification_preferences')
      .update(updateData)
      .eq('user_id', user.id);

    if (error) {
      console.error('Update preferences error:', error);
      return { error: 'فشل حفظ التفضيلات' };
    }

    revalidatePath('/settings');
    return { success: true, message: 'تم حفظ التفضيلات بنجاح' };
  } catch (error) {
    console.error('Update preferences error:', error);
    return {
      error: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
    };
  }
}

/**
 * Reset preferences to defaults
 */
export async function resetNotificationPreferences() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'غير مصرح' };
    }

    const defaultPreferences = {
      email_on_investment: true,
      email_on_message: true,
      email_on_kyc_update: true,
      email_on_milestone: true,
      email_weekly_summary: false,
      push_on_investment: true,
      push_on_message: true,
      push_on_kyc_update: true,
      in_app_notifications: true,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('notification_preferences')
      .update(defaultPreferences)
      .eq('user_id', user.id);

    if (error) {
      console.error('Reset preferences error:', error);
      return { error: 'فشل إعادة تعيين التفضيلات' };
    }

    revalidatePath('/settings');
    return {
      success: true,
      message: 'تم إعادة تعيين التفضيلات إلى الإعدادات الافتراضية',
    };
  } catch (error) {
    console.error('Reset preferences error:', error);
    return {
      error: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
    };
  }
}

/**
 * Check if user wants email notification for specific event
 */
export async function shouldSendEmailNotification(
  userId: string,
  notificationType: 'investment' | 'message' | 'kyc_update' | 'milestone'
) {
  try {
    const supabase = await createClient();

    const { data } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!data) return false;

    switch (notificationType) {
      case 'investment':
        return data.email_on_investment;
      case 'message':
        return data.email_on_message;
      case 'kyc_update':
        return data.email_on_kyc_update;
      case 'milestone':
        return data.email_on_milestone;
      default:
        return false;
    }
  } catch (error) {
    console.error('Check email notification error:', error);
    return false;
  }
}
