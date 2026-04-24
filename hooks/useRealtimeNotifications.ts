'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export interface RealtimeNotification {
  id: string
  type: 'investment' | 'message' | 'milestone' | 'kyc'
  title: string
  message: string
  avatar?: string
  timestamp: Date
  read: boolean
  actionUrl?: string
}

/**
 * Enhanced Hook for real-time notifications using Supabase Realtime
 * Persists notifications to database
 * Listens for new investments, messages, and milestones
 */
export function useRealtimeNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const router = useRouter()

  // Listen for new investments on user's projects
  useEffect(() => {
    if (!userId) return

    const supabase = createClient()

    // Subscribe to investments
    const investmentChannel = supabase
      .channel(`investments:user:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'investments',
          filter: `project_id=in.(SELECT id FROM projects WHERE founder_id='${userId}')`,
        },
        async payload => {
          const notification: RealtimeNotification = {
            id: `inv-${payload.new.id}`,
            type: 'investment',
            title: 'استثمار جديد',
            message: `تم استثمار ${payload.new.amount?.toLocaleString()} في مشروعك`,
            timestamp: new Date(),
            read: false,
            actionUrl: `/dashboard/founder#investment-${payload.new.id}`,
          }

          // Save to database
          try {
            await supabase.from('notifications').insert({
              user_id: userId,
              title: notification.title,
              message: notification.message,
              event_type: 'investment',
              read: false,
              related_user_id: payload.new.investor_id,
              created_at: new Date().toISOString(),
            })
          } catch (error) {
            console.error('Error saving investment notification:', error)
          }

          setNotifications(prev => [notification, ...prev])
          setUnreadCount(prev => prev + 1)
          toast.success(notification.message)
        }
      )
      .subscribe()

    // Subscribe to new messages
    const messageChannel = supabase
      .channel(`messages:user:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`,
        },
        async payload => {
          const notification: RealtimeNotification = {
            id: `msg-${payload.new.id}`,
            type: 'message',
            title: 'رسالة جديدة',
            message: payload.new.content?.substring(0, 50) + '...',
            timestamp: new Date(),
            read: false,
            actionUrl: `/messages?conversation=${payload.new.sender_id}`,
          }

          // Save to database
          try {
            await supabase.from('notifications').insert({
              user_id: userId,
              title: notification.title,
              message: notification.message,
              event_type: 'message',
              read: false,
              related_user_id: payload.new.sender_id,
              created_at: new Date().toISOString(),
            })
          } catch (error) {
            console.error('Error saving message notification:', error)
          }

          setNotifications(prev => [notification, ...prev])
          setUnreadCount(prev => prev + 1)
          toast.info(notification.message)
        }
      )
      .subscribe()

    return () => {
      investmentChannel.unsubscribe()
      messageChannel.unsubscribe()
    }
  }, [userId])

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId: string) => {
      const supabase = createClient()
      try {
        await supabase.from('notifications').update({ read: true }).eq('id', notificationId)
      } catch (error) {
        console.error('Error marking notification as read:', error)
      }

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    },
    []
  )

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!userId) return
    const supabase = createClient()
    try {
      await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false)
    } catch (error) {
      console.error('Error marking all as read:', error)
    }

    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }, [userId])

  // Clear all notifications
  const clearAll = useCallback(async () => {
    if (!userId) return
    const supabase = createClient()
    try {
      await supabase.from('notifications').delete().eq('user_id', userId)
    } catch (error) {
      console.error('Error clearing notifications:', error)
    }

    setNotifications([])
    setUnreadCount(0)
  }, [userId])

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
  }
}
