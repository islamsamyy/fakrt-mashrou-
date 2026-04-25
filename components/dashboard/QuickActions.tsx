'use client';

import React from 'react';
import Link from 'next/link';

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  href: string;
  color: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning';
  description?: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
  title?: string;
}

export function QuickActions({ actions, title = 'الإجراءات السريعة' }: QuickActionsProps) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'secondary':
        return 'bg-secondary-container/10 hover:bg-secondary-container/20 border-secondary-container/30 text-secondary-container';
      case 'tertiary':
        return 'bg-tertiary-fixed-dim/10 hover:bg-tertiary-fixed-dim/20 border-tertiary-fixed-dim/30 text-tertiary-fixed-dim';
      case 'success':
        return 'bg-green-500/10 hover:bg-green-500/20 border-green-500/30 text-green-400';
      case 'warning':
        return 'bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/30 text-yellow-400';
      case 'primary':
      default:
        return 'bg-primary-container/10 hover:bg-primary-container/20 border-primary-container/30 text-primary-container';
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-2xl font-headline font-black text-foreground mb-8 uppercase tracking-tight border-r-4 border-primary-container pr-4">
        {title}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {actions.map((action) => (
          <Link
            key={action.id}
            href={action.href}
            className={`group relative overflow-hidden rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg hover:shadow-primary-container/20 ${getColorClasses(
              action.color
            )}`}
          >
            <div className="absolute top-0 right-0 w-12 h-12 bg-current opacity-5 rounded-full transform translate-x-4 -translate-y-4 group-hover:scale-150 transition-transform duration-500"></div>

            <div className="relative z-10 flex flex-col items-center text-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-current/20 group-hover:bg-current/30 transition-all duration-300">
                <span className="material-symbols-outlined text-lg">{action.icon}</span>
              </div>
              <div>
                <h4 className="font-headline font-bold text-sm uppercase tracking-tight text-foreground group-hover:text-current transition-colors duration-300">
                  {action.label}
                </h4>
                {action.description && (
                  <p className="text-[11px] text-muted-foreground font-body mt-1 line-clamp-2">
                    {action.description}
                  </p>
                )}
              </div>
            </div>

            <div className="absolute inset-0 border-t border-current/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          </Link>
        ))}
      </div>
    </div>
  );
}
