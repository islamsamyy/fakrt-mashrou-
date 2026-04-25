'use client';

import React, { useState } from 'react';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  timestamp: Date;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'تم تحديث المحفظة',
      message: 'تمت إضافة استثمار جديد بنجاح',
      read: false,
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: '2',
      type: 'info',
      title: 'فرصة جديدة متاحة',
      message: 'هناك فرصة استثمارية جديدة تطابق معايير بحثك',
      read: false,
      timestamp: new Date(Date.now() - 7200000),
    },
    {
      id: '3',
      type: 'warning',
      title: 'مراجعة مطلوبة',
      message: 'يرجى تحديث بيانات ملفك الشخصي',
      read: true,
      timestamp: new Date(Date.now() - 86400000),
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleClearAll = () => {
    setNotifications([]);
    setIsOpen(false);
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'warning':
        return '!';
      case 'error':
        return '✕';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  const getTypeColor = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'border-green-500 bg-green-500/10';
      case 'warning':
        return 'border-yellow-500 bg-yellow-500/10';
      case 'error':
        return 'border-red-500 bg-red-500/10';
      case 'info':
      default:
        return 'border-primary-container bg-primary-container/10';
    }
  };

  const getIconColor = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      case 'info':
      default:
        return 'text-primary-container';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor(diff / 60000);

    if (minutes < 60) return `قبل ${minutes} دقيقة`;
    if (hours < 24) return `قبل ${hours} ساعة`;
    return `قبل ${Math.floor(hours / 24)} يوم`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-surface-container-high transition-colors rounded-lg"
      >
        <span className="material-symbols-outlined text-slate-300">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-primary-container text-slate-950 text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-surface-container-high border border-white/10 rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto">
          <div className="sticky top-0 bg-surface-container-high border-b border-white/10 p-4 flex justify-between items-center">
            <h3 className="font-headline text-white">الإشعارات</h3>
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-slate-400 hover:text-primary-container transition-colors"
              >
                حذف الكل
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="p-6 text-center text-slate-500 font-body">
              لا توجد إشعارات حالياً
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border-r-2 transition-all ${getTypeColor(
                    notification.type
                  )} ${notification.read ? 'opacity-60' : ''}`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${getIconColor(
                        notification.type
                      )}`}
                    >
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 cursor-pointer">
                      <h4 className="font-headline text-white text-sm mb-1">
                        {notification.title}
                      </h4>
                      <p className="text-xs text-slate-400 font-body mb-2">
                        {notification.message}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500 font-data">
                          {formatTime(notification.timestamp)}
                        </span>
                        {notification.action && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              notification.action!.onClick();
                            }}
                            className="text-xs text-primary-container hover:text-white transition-colors font-bold"
                          >
                            {notification.action.label}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function NotificationCenter() {
  return <NotificationBell />;
}
