'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * BUG #14 FIX: Mobile hamburger menu
 * Shows on screens < 768px
 * Hides on desktop
 */

interface NavLink {
  href: string
  label: string
  icon?: string
}

interface MobileNavMenuProps {
  links: NavLink[]
  brandText?: string
  showAuth?: boolean
}

export function MobileNavMenu({
  links,
  brandText = 'IDEA BUSINESS',
  showAuth = true,
}: MobileNavMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <>
      {/* Mobile Menu Button - Only visible on screens < 768px */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 hover:bg-white/10 rounded-lg transition"
        aria-label="فتح القائمة"
      >
        <span className="material-symbols-outlined text-2xl">
          {isOpen ? 'close' : 'menu'}
        </span>
      </button>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 mt-2 bg-[#0A1628] border border-white/10 rounded-xl p-4 z-40">
          {/* Brand */}
          <div className="mb-4 pb-4 border-b border-white/5">
            <p className="text-sm font-bold text-primary-container">{brandText}</p>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2 mb-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                  isActive(link.href)
                    ? 'bg-primary-container/20 text-primary-container font-bold'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.icon && <span className="material-symbols-outlined">{link.icon}</span>}
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* Auth Links */}
          {showAuth && (
            <div className="flex flex-col gap-2 border-t border-white/5 pt-4">
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg text-center text-white hover:bg-white/10 transition text-sm"
                onClick={() => setIsOpen(false)}
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-lg text-center bg-primary-container text-background font-bold transition text-sm"
                onClick={() => setIsOpen(false)}
              >
                إنشاء حساب
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 top-20 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

/**
 * Updated Navbar with responsive mobile menu
 * Usage in app/components/layout/Navbar.tsx:
 */
export const NAVBAR_LINKS: NavLink[] = [
  { href: '/', label: 'الرئيسية', icon: 'home' },
  { href: '/discover', label: 'اكتشف الفرص', icon: 'search' },
  { href: '/trending', label: 'المشاريع الصاعدة', icon: 'trending_up' },
  { href: '/leaderboard', label: 'لوحة الصدارة', icon: 'leaderboard' },
]

// Example usage in Navbar:
// import { MobileNavMenu, NAVBAR_LINKS } from '@/components/mobile-nav-menu'
//
// export function Navbar() {
//   return (
//     <nav className="flex items-center justify-between gap-4">
//       <Link href="/" className="font-bold">IDEA BUSINESS</Link>
//       <div className="hidden md:flex gap-6">
//         {NAVBAR_LINKS.map(link => (
//           <Link key={link.href} href={link.href}>{link.label}</Link>
//         ))}
//       </div>
//       <MobileNavMenu links={NAVBAR_LINKS} />
//     </nav>
//   )
// }
