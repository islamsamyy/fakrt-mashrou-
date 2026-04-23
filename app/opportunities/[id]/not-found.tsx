import Link from 'next/link'

/**
 * BUG #15 FIX: Custom 404 page for non-existent opportunities
 * Shows friendly error message with navigation options
 * Triggered when opportunity ID doesn't exist
 */

export default function OpportunityNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Icon */}
        <div className="mb-8">
          <span className="material-symbols-outlined text-8xl text-slate-600">
            search_off
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-black text-white mb-4">404</h1>
        <h2 className="text-2xl font-bold text-white mb-4">المشروع غير موجود</h2>

        {/* Description */}
        <p className="text-slate-400 mb-8">
          عذراً، المشروع الذي تبحث عنه غير موجود أو قد تم حذفه. قد تكون الرابط غير صحيح.
        </p>

        {/* Error Code */}
        <div className="bg-slate-500/10 border border-slate-500/20 rounded-lg p-4 mb-8">
          <p className="text-xs text-slate-500 font-mono">Error: Opportunity not found</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/opportunities"
            className="flex-1 bg-primary-container text-background font-bold py-3 rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            العودة إلى المشاريع
          </Link>

          <Link
            href="/discover"
            className="flex-1 bg-white/10 text-white font-bold py-3 rounded-lg hover:bg-white/20 transition"
          >
            اكتشف الفرص
          </Link>
        </div>

        {/* Additional Help */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-sm text-slate-500 mb-3">هل تحتاج إلى مساعدة؟</p>
          <Link
            href="/contact"
            className="text-primary-container hover:underline text-sm font-medium"
          >
            تواصل مع الدعم →
          </Link>
        </div>
      </div>
    </div>
  )
}
