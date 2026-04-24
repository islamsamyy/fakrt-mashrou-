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
          className={`relative px-2 py-1 transition-all duration-300 group ${isActive ? 'text-primary-container' : 'text-foreground/70 hover:text-primary-container'}`}
        >
          {label}
          {isActive && (
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary-container shadow-[0_0_8px_rgba(0,255,209,0.8)] animate-pulse" />
          )}
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-container transition-all duration-300 group-hover:w-full opacity-50" />
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
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <header 
      className={`fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-12 h-20 transition-all duration-500 ${
        scrolled 
          ? 'bg-background/80 dark:bg-[#020408]/90 backdrop-blur-2xl border-b border-primary-container/20 shadow-[0_4px_30px_rgba(0,0,0,0.1)]' 
          : 'bg-transparent'
      }`}
    >
      <div className="absolute inset-0 scanline opacity-[0.03] pointer-events-none" />
      
      <Link href="/" className="group flex items-center gap-3 relative">
        <div className="w-10 h-10 border border-primary-container/30 flex items-center justify-center rounded-lg bg-primary-container/5 group-hover:border-primary-container transition-colors duration-500">
          <span className="material-symbols-outlined text-primary-container text-xl animate-pulse-gentle">filter_tilt_shift</span>
        </div>
        <div className="flex flex-col">
          <span className="font-data font-black text-primary-container text-2xl tracking-tighter hover:text-accent transition-all group-hover:animate-glitch-skew">
            IDEA BUSINESS
          </span>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse shadow-[0_0_8px_#00ffd1]" />
            <span className="text-[8px] font-data text-primary-container/60 uppercase tracking-[0.2em]">System Online</span>
          </div>
        </div>
      </Link>

      <nav className="hidden lg:flex items-center gap-8 font-label text-foreground uppercase tracking-wider text-xs">
        <NavLinks pathname={pathname} />
      </nav>

      <div className="flex items-center gap-4">
        <div className="hidden sm:block">
          <ThemeToggle />
        </div>
        {!loading && (
          user ? (
            <>
              <NotificationBell currentUserId={user.id} />
              <Link
                href={dashboardHref}
                className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary-container hover:text-accent transition-all duration-300 holographic-reflection px-5 py-2.5 border border-primary-container/20 rounded-xl bg-primary-container/5 group"
              >
                <span className="material-symbols-outlined text-sm group-hover:rotate-90 transition-transform duration-500">dashboard</span>
                <span>{profile?.full_name?.split(' ')[0] ?? 'لوحة التحكم'}</span>
              </Link>
              <div className="hidden md:block">
                <LogoutButton />
              </div>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <button className="text-foreground font-black px-6 py-2.5 text-xs border border-primary-container/20 rounded-xl hover:bg-primary-container/10 transition-all duration-300 uppercase tracking-widest hover:border-primary-container/40">
                  دخول
                </button>
              </Link>
              <Link href="/register">
                <button className="bg-gradient-to-r from-primary-container to-accent text-background font-black px-7 py-2.5 rounded-xl shadow-[0_4px_15px_rgba(0,255,209,0.2)] hover:shadow-[0_8px_25px_rgba(0,255,209,0.4)] transition-all duration-500 active:scale-95 text-xs uppercase tracking-widest holographic-reflection overflow-hidden relative">
                  إنشاء حساب
                </button>
              </Link>
            </div>
          )
        )}

        {/* Mobile Menu Toggle Button */}
        <button
          className="lg:hidden w-10 h-10 flex items-center justify-center text-primary-container hover:bg-primary-container/10 rounded-xl transition-all duration-300 border border-primary-container/20"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="material-symbols-outlined text-2xl">
            {isMobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* Mobile Sidebar Drawer */}
      <div
        className={`fixed inset-0 bg-background/95 dark:bg-[#020408]/98 backdrop-blur-2xl z-40 transition-all duration-500 lg:hidden flex flex-col pt-24 px-8 ${
          isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 neon-grid opacity-[0.03] pointer-events-none" />
        <div className="absolute inset-0 scanline opacity-[0.02] pointer-events-none" />
        
        <nav className="flex flex-col gap-8 font-label text-foreground uppercase tracking-widest text-xl">
          <NavLinks onClick={() => setIsMobileMenuOpen(false)} pathname={pathname} />
        </nav>

        <div className="mt-12 pt-12 border-t border-primary-container/10 flex flex-col gap-5">
          {!loading && (
            user ? (
              <>
                <Link
                  href={dashboardHref}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex justify-center items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-primary-container py-4 border border-primary-container/30 hover:bg-primary-container/10 transition-all duration-300 rounded-2xl bg-primary-container/5"
                >
                  <span className="material-symbols-outlined text-lg">dashboard</span>
                  <span>لوحة التحكم</span>
                </Link>
                <div onClick={() => setIsMobileMenuOpen(false)}>
                  <LogoutButton />
                </div>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="w-full border border-primary-container/20 text-foreground font-black px-4 py-4 text-xs uppercase tracking-widest hover:bg-primary-container/10 transition-all duration-300 rounded-2xl">
                    دخول
                  </button>
                </Link>
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="w-full bg-gradient-to-r from-primary-container to-accent text-background font-black px-6 py-4 rounded-2xl active:scale-95 text-xs uppercase tracking-widest transition-all duration-300 shadow-[0_8px_20px_rgba(0,255,209,0.2)]">
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
