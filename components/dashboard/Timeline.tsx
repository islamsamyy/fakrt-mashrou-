'use client';

import React from 'react';

export interface TimelineEvent {
  id: string;
  date: Date;
  title: string;
  description?: string;
  type: 'milestone' | 'funding' | 'update' | 'partnership';
  icon?: string;
}

interface TimelineProps {
  events: TimelineEvent[];
  title: string;
}

export function Timeline({ events, title }: TimelineProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'milestone':
        return 'bg-primary-container text-background';
      case 'funding':
        return 'bg-green-500/20 border border-green-500/40 text-green-400';
      case 'partnership':
        return 'bg-purple-500/20 border border-purple-500/40 text-purple-400';
      case 'update':
      default:
        return 'bg-secondary-container/20 border border-secondary-container/40 text-secondary-container';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'milestone':
        return 'flag';
      case 'funding':
        return 'trending_up';
      case 'partnership':
        return 'handshake';
      case 'update':
      default:
        return 'info';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="w-full">
      <h3 className="text-xl font-headline font-black text-white mb-8 uppercase tracking-tight border-r-4 border-primary-container pr-4">
        {title}
      </h3>

      <div className="space-y-6 relative">
        {/* Vertical line */}
        <div className="absolute right-[15px] top-12 bottom-0 w-px bg-gradient-to-b from-primary-container via-primary-container/50 to-transparent"></div>

        {events.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <span className="material-symbols-outlined text-4xl text-slate-600 block mb-3">event_note</span>
            <p className="text-sm">لا توجد أحداث حالياً</p>
          </div>
        ) : (
          events.map((event, index) => (
            <div key={event.id || index} className="flex gap-6 relative">
              {/* Timeline dot */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${getTypeColor(event.type)} relative z-10 shadow-lg shadow-primary-container/30`}>
                  <span className="material-symbols-outlined text-sm">
                    {event.icon || getTypeIcon(event.type)}
                  </span>
                </div>
              </div>

              {/* Content card */}
              <div className="flex-1 pb-6">
                <div className="bg-gradient-to-br from-surface-container-high/40 to-surface-container-high/20 border border-white/5 p-5 rounded-lg hover:border-primary-container/30 transition-all group">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <div className="flex-1 text-right">
                      <h4 className="font-headline font-bold text-white text-sm uppercase tracking-tight group-hover:text-primary-container transition-colors">
                        {event.title}
                      </h4>
                      <p className="text-xs text-slate-500 font-data mt-1">{formatDate(event.date)}</p>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-1 rounded font-headline font-black uppercase tracking-widest flex-shrink-0 ${getTypeColor(
                        event.type
                      )}`}
                    >
                      {event.type === 'milestone'
                        ? 'مرحلة'
                        : event.type === 'funding'
                          ? 'تمويل'
                          : event.type === 'partnership'
                            ? 'شراكة'
                            : 'تحديث'}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-xs text-slate-400 font-body leading-relaxed text-right mt-3">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
