'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { type User } from '@supabase/supabase-js'
import { LogoutButton } from './LogoutButton'
import NotificationBell from './NotificationBell'
import { ThemeToggle } from './ThemeToggle'
import type { Profile } from '@/lib/types'

const NAV_LINKS = [
  { href: '/', label: 'الرئيسية' },
  { href: '/opportunities', label: 'الفرص' },
  { href: '/discover', label: 'اكتشف' },
  { href: '/trending', label: 'شائع' },
  { href: '/leaderboard', label: 'الأفضل' },
  { href: '/investors', label: 'المستثمرون' },
  { href: '/blog', label: 'المدونة' },
] as const

function NavLinks({ onClick, pathname }: { onClick?: () => void; pathname: string }) {
  return (
    <>
      {NAV_LINKS.map(({ href, label }) => {
        const isActive = pathname === href
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
        )
      })}
    </>
  )
}

export function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const supabase = createClient()

    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name, role, avatar_url, bio, kyc_status, tier, created_at')
          .eq('id', user.id)
          .single()
        setProfile(data as Profile | null)
      }
      setLoading(false)
    }

    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), [])
  const toggleMobileMenu = useCallback(() => setIsMobileMenuOpen((prev) => !prev), [])

  const dashboardHref = profile?.role ? `/dashboard/${profile.role}` : '/dashboard/founder'

  return (
    <header
      suppressHydrationWarning
      className={`fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-12 h-20 transition-all duration-500 ${
        scrolled
          ? 'bg-background/80 dark:bg-[#020408]/90 backdrop-blur-2xl border-b border-primary-container/20 shadow-[0_4px_30px_rgba(0,0,0,0.1)]'
          : 'bg-transparent'
      }`}
    >
      <div className="absolute inset-0 scanline opacity-[0.03] pointer-events-none" />

      <Link href="/" className="group flex items-center gap-3 relative">
        <Image src="/LOGO.svg" alt="IDEA BUSINESS" width={48} height={48} className="h-12 w-auto group-hover:opacity-80 transition-opacity duration-300" />
        <div className="flex flex-col">
          <span className="font-headline font-black text-primary-container text-xl leading-tight tracking-tight group-hover:text-accent transition-colors duration-300">
            فكرة مشروع
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

      <div className="flex items-center gap-3 md:gap-4">
        <ThemeToggle />
        {!loading && (
          user ? (
            <>
              <NotificationBell currentUserId={user.id} />
              <Link
                href={dashboardHref}
                className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary-container hover:text-accent transition-all duration-300 px-5 py-2.5 border border-primary-container/20 rounded-xl bg-primary-container/5 group"
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
              <Link
                href="/login"
                className="text-foreground font-black px-6 py-2.5 text-xs border border-primary-container/20 rounded-xl hover:bg-primary-container/10 transition-all duration-300 uppercase tracking-widest hover:border-primary-container/40"
              >
                دخول
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-primary-container to-accent text-background font-black px-7 py-2.5 rounded-xl shadow-[0_4px_15px_rgba(0,255,209,0.2)] hover:shadow-[0_8px_25px_rgba(0,255,209,0.4)] transition-all duration-500 active:scale-95 text-xs uppercase tracking-widest"
              >
                إنشاء حساب
              </Link>
            </div>
          )
        )}

        <button
          aria-label={isMobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
          aria-expanded={isMobileMenuOpen}
          className="lg:hidden w-10 h-10 flex items-center justify-center text-primary-container hover:bg-primary-container/10 rounded-xl transition-all duration-300 border border-primary-container/20"
          onClick={toggleMobileMenu}
        >
          <span className="material-symbols-outlined text-2xl">{isMobileMenuOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 bg-background/95 dark:bg-[#020408]/98 backdrop-blur-2xl z-40 transition-all duration-500 lg:hidden flex flex-col pt-24 px-8 ${
          isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 scanline opacity-[0.02] pointer-events-none" />

        <nav className="flex flex-col gap-8 font-label text-foreground uppercase tracking-widest text-xl">
          <NavLinks onClick={closeMobileMenu} pathname={pathname} />
        </nav>

        <div className="mt-12 pt-12 border-t border-primary-container/10 flex flex-col gap-5">
          <div className="flex justify-center mb-4">
            <ThemeToggle />
          </div>
          {!loading && (
            user ? (
              <>
                <Link
                  href={dashboardHref}
                  onClick={closeMobileMenu}
                  className="flex justify-center items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-primary-container py-4 border border-primary-container/30 hover:bg-primary-container/10 transition-all duration-300 rounded-2xl bg-primary-container/5"
                >
                  <span className="material-symbols-outlined text-lg">dashboard</span>
                  لوحة التحكم
                </Link>
                <div onClick={closeMobileMenu}>
                  <LogoutButton />
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="w-full text-center border border-primary-container/20 text-foreground font-black px-4 py-4 text-xs uppercase tracking-widest hover:bg-primary-container/10 transition-all duration-300 rounded-2xl"
                >
                  دخول
                </Link>
                <Link
                  href="/register"
                  onClick={closeMobileMenu}
                  className="w-full text-center bg-gradient-to-r from-primary-container to-accent text-background font-black px-6 py-4 rounded-2xl active:scale-95 text-xs uppercase tracking-widest transition-all duration-300 shadow-[0_8px_20px_rgba(0,255,209,0.2)]"
                >
                  إنشاء حساب
                </Link>
              </>
            )
          )}
        </div>
      </div>
    </header>
  )
}
