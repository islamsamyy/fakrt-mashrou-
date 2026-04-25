'use client'

import { useTheme } from '@/components/providers/ThemeProvider'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      suppressHydrationWarning
      aria-label={theme === 'dark' ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
      className="relative p-3 rounded-lg border border-primary-container/30 bg-primary-container/5 text-primary-container hover:bg-primary-container/15 hover:border-primary-container/50 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary-container group"
      title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
    >
      <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform duration-300" suppressHydrationWarning>
        {theme === 'dark' ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  )
}
