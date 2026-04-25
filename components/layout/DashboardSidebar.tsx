'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { LogoutButton } from './LogoutButton';

interface Profile {
  full_name: string;
  role: 'founder' | 'investor';
  tier: string;
  kyc_status: string;
}

export function DashboardSidebar() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, role, tier, kyc_status')
          .eq('id', user.id)
          .single();
        setProfile(data);
      }
      setLoading(false);
    }
    getUser();
  }, [supabase]);

  if (loading) return null;

  const isFounder = profile?.role === 'founder';

  const founderMenu = [
    { icon: 'dashboard', label: 'لوحة التحكم', href: '/dashboard/founder' },
    { icon: 'lightbulb', label: 'مشاريعي', href: '/projects' },
    { icon: 'add_circle', label: 'أضف فكرة', href: '/add-idea' },
    { icon: 'trending_up', label: 'تقدم التمويل', href: '/funding-progress' },
    { icon: 'chat', label: 'الرسائل', href: '/messages' },
    { icon: 'settings', label: 'الإعدادات', href: '/settings' },
  ];

  const investorMenu = [
    { icon: 'dashboard', label: 'لوحة التحكم', href: '/dashboard/investor' },
    { icon: 'explore', label: 'الفرص', href: '/opportunities' },
    { icon: 'account_balance_wallet', label: 'محفظتي', href: '/portfolio' },
    { icon: 'bookmark', label: 'المحفوظات', href: '/saved' },
    { icon: 'chat', label: 'الرسائل', href: '/messages' },
    { icon: 'settings', label: 'الإعدادات', href: '/settings' },
  ];

  const menuItems = isFounder ? founderMenu : investorMenu;
  const tierLabel = profile?.tier === 'platinum' ? 'بلاتيني' : profile?.tier === 'gold' ? 'ذهبي' : 'أساسي';
  const roleLabel = isFounder ? 'مؤسس' : 'مستثمر';

  return (
    <aside className="hidden xl:flex fixed right-0 top-20 h-[calc(100vh-80px)] w-72 bg-background/95 backdrop-blur-2xl border-l border-foreground/10 flex-col z-30 overflow-hidden shadow-[-8px_0_32px_rgba(0,0,0,0.15)]">
      {/* Visual Overlays */}
      <div className="absolute inset-0 neon-grid opacity-[0.03] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-primary-container/30 to-transparent" />

      {/* User Info Section */}
      <div className="p-8 border-b border-foreground/10 relative group">
        <div className="absolute top-0 left-0 w-8 h-[1px] bg-primary-container/50" />
        <div className="absolute top-0 left-0 w-[1px] h-8 bg-primary-container/50" />

        <div className="flex items-center gap-4 mb-6 relative">
          <div className="relative">
            <div className="w-14 h-14 rounded-xl overflow-hidden border border-primary-container/30 bg-primary-container/10 flex items-center justify-center holographic-reflection group-hover:border-primary-container transition-colors duration-500">
              <span className="material-symbols-outlined text-3xl text-primary-container animate-pulse-gentle">person</span>
            </div>
            <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-background border border-primary-container/20 flex items-center justify-center rounded-sm">
              <div className="w-2 h-2 bg-primary-container rounded-full animate-pulse" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-headline text-base text-foreground font-black truncate uppercase tracking-tight group-hover:text-primary-container transition-colors duration-300">
              {profile?.full_name ?? user?.email?.split('@')[0] ?? 'UNKNOWN_ENTITY'}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-1 bg-primary-container/10 border border-primary-container/30 rounded text-xs font-black text-primary-container uppercase tracking-wider leading-none">
                {roleLabel}
              </span>
              <span className="text-xs text-foreground/60 font-data font-bold uppercase tracking-widest">
                {tierLabel}
              </span>
            </div>
          </div>
        </div>

        {profile?.kyc_status !== 'verified' && (
          <Link
            href="/kyc"
            className="w-full py-2.5 px-4 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-sm font-black border border-yellow-500/30 hover:bg-yellow-500/20 transition-all flex items-center gap-2 justify-center clip-button uppercase tracking-widest"
          >
            <span className="material-symbols-outlined text-sm animate-pulse">security</span>
            VERIFICATION REQUIRED
          </Link>
        )}
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 py-6 overflow-y-auto no-scrollbar relative">
        <div className="px-6 mb-4">
          <p className="text-xs text-foreground/50 font-black uppercase tracking-[0.3em]">CORE_SYSTEMS</p>
        </div>

        <div className="space-y-1">
          {menuItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={index}
                href={item.href}
                className={`relative px-8 py-3.5 flex items-center gap-4 group transition-all duration-500 ${
                  isActive
                    ? 'text-primary-container bg-primary-container/8'
                    : 'text-foreground/70 hover:text-primary-container hover:bg-primary-container/5'
                }`}
              >
                {isActive && (
                  <>
                    <div className="absolute inset-y-0 right-0 w-1 bg-primary-container" />
                    <div className="absolute inset-0 bg-gradient-to-l from-primary-container/8 to-transparent" />
                  </>
                )}

                <span className={`material-symbols-outlined text-xl transition-all duration-500 ${
                  isActive ? 'text-primary-container' : 'group-hover:text-primary-container group-hover:translate-x-1'
                }`}>
                  {item.icon}
                </span>

                <span className={`font-body text-sm font-bold uppercase tracking-widest transition-all duration-300 ${
                  isActive ? 'translate-x-1 font-black' : 'group-hover:translate-x-2'
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* System Status Section */}
      <div className="p-6 border-t border-foreground/10 space-y-4 relative bg-muted/30">
        <div className="bg-foreground/[0.03] p-4 border border-foreground/10 relative overflow-hidden rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-foreground/60 font-black tracking-widest uppercase">NETWORK</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-primary-container font-black uppercase">ACTIVE</span>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground/80 font-bold uppercase tracking-tight">Secure Node</span>
              <span className="text-xs text-primary-container font-data font-black">TERMINAL_V2</span>
            </div>
            <div className="w-full h-1 bg-foreground/10 rounded-full overflow-hidden">
              <div className="h-full w-full bg-primary-container/60 animate-shimmer" />
            </div>
          </div>
        </div>

        <div className="px-2">
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}
