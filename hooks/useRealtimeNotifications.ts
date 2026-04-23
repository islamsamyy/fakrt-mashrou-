'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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
 * Hook for real-time notifications using Supabase Realtime
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
          filter: `owner_id=eq.${userId}`,
        },
        payload => {
          const notification: RealtimeNotification = {
            id: `inv-${payload.new.id}`,
            type: 'investment',
            title: 'নতুন বিনিয়োগ',
            message: `আপনার প্রকল্পে ${payload.new.amount.toLocaleString()} ريال বিনিয়োগ হয়েছে`,
            timestamp: new Date(),
            read: false,
            actionUrl: `/dashboard/founder#investment-${payload.new.id}`,
          }
          setNotifications(prev => [notification, ...prev])
          setUnreadCount(prev => prev + 1)
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
          filter: `recipient_id=eq.${userId}`,
        },
        payload => {
          const notification: RealtimeNotification = {
            id: `msg-${payload.new.id}`,
            type: 'message',
            title: 'نرسالة جديدة',
            message: payload.new.content.substring(0, 50) + '...',
            timestamp: new Date(),
            read: false,
            actionUrl: `/messages?conversation=${payload.new.sender_id}`,
          }
          setNotifications(prev => [notification, ...prev])
          setUnreadCount(prev => prev + 1)
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
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    },
    []
  )

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  return {
    notifications,
    unreadCount,
    markAsRead,
    clearAll,
  }
}
