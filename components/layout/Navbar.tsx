'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { type User } from '@supabase/supabase-js';
import { LogoutButton } from './LogoutButton';
import NotificationBell from './NotificationBell';
import { ThemeToggle } from './ThemeToggle';
import type { Profile } from '@/lib/types';

const NAV_LINKS = [
  { href: '/', label: 'الرئيسية' },
  { href: '/opportunities', label: 'الفرص' },
  { href: '/discover', label: 'اكتشف' },
  { href: '/trending', label: 'شائع' },
  { href: '/leaderboard', label: 'الأفضل' },
  { href: '/investors', label: 'المستثمرون' },
  { href: '/blog', label: 'المدونة' },
];

const NavLinks = ({ onClick, pathname }: { onClick?: () => void, pathname: string }) => (
  <>
    {NAV_LINKS.map(({ href, label }) => {
      const isActive = pathname === href;
      return (
        <Link
          key={href}
          href={href}
          onClick={onClick}
          className={`transition-colors ${isActive ? 'text-primary-container' : 'hover:text-primary-container'}`}
        >
          {label}
        </Link>
      );
    })}
  </>
);

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(data);
      }
      setLoading(false);
    }
    getUser();
  }, [supabase]);

  const dashboardHref = profile?.role
    ? `/dashboard/${profile.role}`
    : '/dashboard/founder';

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-8 h-20 bg-background/90 dark:bg-[#020408]/95 backdrop-blur-xl border-b border-primary-container/30 dark:border-primary-container/20 shadow-sm dark:shadow-[0_0_20px_rgba(0,255,209,0.1)] transition-all duration-300">
      <Link href="/" className="flex items-center gap-2 font-data font-black text-primary-container text-2xl tracking-tighter hover:opacity-80 active:scale-95 transition-all">
        IDEA BUSINESS
      </Link>

      <nav className="hidden md:flex items-center gap-8 font-label text-foreground uppercase tracking-wider text-sm">
        <NavLinks pathname={pathname} />
      </nav>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        {!loading && (
          user ? (
            <>
              <NotificationBell currentUserId={user.id} />
              <Link
                href={dashboardHref}
                className="hidden md:flex items-center gap-2 text-sm font-headline uppercase tracking-widest text-primary-container hover:text-accent transition-all duration-200 interactive-glow px-4 py-2 border border-primary-container/20 rounded-lg"
              >
                <span className="material-symbols-outlined text-lg">dashboard</span>
                <span>{profile?.full_name?.split(' ')[0] ?? 'لوحة التحكم'}</span>
              </Link>
              <div className="hidden md:block">
                <LogoutButton />
              </div>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <button className="text-foreground font-bold px-6 py-2.5 text-sm border border-primary-container/30 rounded-lg hover:bg-primary-container/10 transition-all duration-200 interactive-glow">
                  دخول
                </button>
              </Link>
              <Link href="/register">
                <button className="bg-gradient-to-r from-primary-container to-accent text-foreground font-bold px-6 py-2.5 rounded-lg hover:shadow-[0_8px_24px_rgba(0,255,209,0.3)] transition-all duration-300 active:scale-95 text-sm">
                  إنشاء حساب
                </button>
              </Link>
            </div>
          )
        )}

        {/* Mobile Menu Toggle Button */}
        <button
          className="md:hidden text-primary-container p-2 hover:bg-primary-container/10 rounded-lg transition-colors duration-200"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="material-symbols-outlined">
            {isMobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* Mobile Sidebar Drawer */}
      <div
        className={`fixed inset-0 bg-background/95 dark:bg-background/95 backdrop-blur-md z-40 transition-transform duration-300 md:hidden flex flex-col pt-24 px-6 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <nav className="flex flex-col gap-6 font-label text-foreground uppercase tracking-wider text-lg">
          <NavLinks onClick={() => setIsMobileMenuOpen(false)} pathname={pathname} />
        </nav>

        <div className="mt-8 pt-8 border-t border-primary-container/20 flex flex-col gap-4">
          {!loading && (
            user ? (
              <>
                <Link
                  href={dashboardHref}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex justify-center items-center gap-2 text-sm font-headline uppercase tracking-widest text-primary-container py-3 border border-primary-container/30 hover:bg-primary-container/10 dark:hover:bg-primary-container/20 transition-colors duration-200 rounded-lg"
                >
                  <span className="material-symbols-outlined text-sm">dashboard</span>
                  <span>{profile?.full_name?.split(' ')[0] ?? 'لوحة التحكم'}</span>
                </Link>
                <div onClick={() => setIsMobileMenuOpen(false)}>
                  <LogoutButton />
                </div>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="w-full border border-primary-container/30 text-foreground font-medium px-4 py-3 text-sm hover:bg-primary-container/10 hover:text-primary-container transition-all duration-200 rounded-lg">
                    دخول
                  </button>
                </Link>
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="w-full bg-gradient-to-r from-primary-container to-accent text-foreground font-bold px-6 py-3 clip-button active:scale-95 text-sm transition-all duration-200">
                    إنشاء حساب
                  </button>
                </Link>
              </>
            )
          )}
        </div>
      </div>
    </header>
  );
}
