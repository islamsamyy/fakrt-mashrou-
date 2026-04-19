'use client'

import { useState, useTransition } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { toast } from 'sonner'
import { submitContact } from './actions'

export default function ContactPage() {
  const [isPending, startTransition] = useTransition()
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await submitContact(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(result.message)
        setSubmitted(true)
        e.currentTarget.reset()
        setTimeout(() => setSubmitted(false), 3000)
      }
    })
  }

  return (
    <div className="bg-background text-on-surface font-body min-h-screen relative overflow-x-hidden" dir="rtl">
      <div className="fixed inset-0 hex-grid opacity-5 pointer-events-none z-0" />
      <Navbar />

      <main className="container mx-auto px-6 py-32 relative z-10 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="font-headline text-4xl md:text-6xl font-black text-white uppercase tracking-tight mb-4">
            نحن هنا لمساعدتك
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            سواء كنت مستثمراً يبحث عن فرصة ذهبية، أو مؤسساً بشغف للإبداع، نحن هنا للإجابة على جميع استفساراتك.
          </p>
        </div>

        <div className="bg-[#0A1628] p-10 md:p-14 border border-white/5 relative">
          <div className="l-bracket-tr opacity-20" />
          <div className="l-bracket-bl opacity-20" />

          <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-400">الاسم الكامل</label>
                <input
                  type="text"
                  name="name"
                  placeholder="الاسم ثلاثي..."
                  required
                  className="bg-white/5 border border-white/10 p-4 text-white focus:border-primary-container outline-none transition-colors placeholder:text-slate-600"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-400">البريد الإلكتروني</label>
                <input
                  type="email"
                  name="email"
                  placeholder="email@example.com"
                  required
                  className="bg-white/5 border border-white/10 p-4 text-white focus:border-primary-container outline-none transition-colors placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-400">الموضوع</label>
              <input
                type="text"
                name="subject"
                placeholder="موضوع استفسارك..."
                required
                className="bg-white/5 border border-white/10 p-4 text-white focus:border-primary-container outline-none transition-colors placeholder:text-slate-600"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-400">الرسالة</label>
              <textarea
                name="message"
                rows={6}
                placeholder="كيف يمكننا مساعدتك؟ شاركنا تفاصيل طلبك..."
                required
                className="bg-white/5 border border-white/10 p-4 text-white focus:border-primary-container outline-none transition-colors resize-none placeholder:text-slate-600"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="bg-primary-container text-background font-black py-5 mt-4 clip-button hover:brightness-110 active:scale-95 transition-all text-xl shadow-[0_0_20px_rgba(0,255,209,0.1)] flex items-center justify-center gap-3 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
              ) : submitted ? (
                <>
                  <span className="material-symbols-outlined">check_circle</span>
                  تم الإرسال
                </>
              ) : (
                <>
                  إرسال الرسالة
                  <span className="material-symbols-outlined">send</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
