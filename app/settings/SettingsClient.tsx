'use client'

import React, { useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useTransition } from 'react'
import { updateProfileInfo } from './actions'
import type { Profile } from '@/lib/types'

interface SettingsClientProps {
  profile: Profile | null
  userEmail: string
}

export default function SettingsClient({ profile, userEmail }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile')
  const [isPending, startTransition] = useTransition()

  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>(profile?.avatar_url || '')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const supabase = createClient()

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setAvatarPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName.trim()) {
      toast.error('يجب إدخال الاسم الكامل')
      return
    }

    // Show uploading toast
    if (avatarFile) {
      toast.loading('جاري تحميل الصورة...')
    } else {
      toast.loading('جاري حفظ البيانات...')
    }

    const formData = new FormData()
    formData.append('full_name', fullName)
    formData.append('bio', bio || '')
    if (avatarFile) {
      console.log('Adding avatar file:', avatarFile.name, 'Size:', avatarFile.size)
      formData.append('avatar', avatarFile)
    }

    startTransition(async () => {
      try {
        console.log('Submitting profile update...')
        const result = await updateProfileInfo(formData)

        if (result?.error) {
          console.error('Update error:', result.error)
          toast.error(result.error || 'فشل تحديث الملف الشخصي')
        } else {
          console.log('Update successful:', result)
          // Force a small delay before showing success to let DB commit
          await new Promise(resolve => setTimeout(resolve, 500))
          toast.success('تم تحديث الملف الشخصي بنجاح! ✨')
          // Reset avatar file after success
          setAvatarFile(null)
          // Refresh page to show updated data
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        }
      } catch (error) {
        console.error('Submit error:', error)
        toast.error('حدث خطأ أثناء التحديث')
      }
    })
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordMessage('')
    setPasswordError('')
    if (password !== confirmPassword) {
      setPasswordError('كلمة المرور غير متطابقة')
      setPasswordLoading(false)
      return
    }
    if (password.length < 6) {
      setPasswordError('كلمة المرور يجب أن تتكون من 6 أحرف على الأقل')
      setPasswordLoading(false)
      return
    }
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setPasswordMessage('تم تحديث كلمة المرور بنجاح')
      setPassword('')
      setConfirmPassword('')
      toast.success('تم تحديث كلمة المرور')
    } catch (err: unknown) {
      setPasswordError((err as Error).message || 'حدث خطأ أثناء التحديث')
      toast.error('فشل تحديث كلمة المرور')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <main className="xl:mr-64 pt-32 pb-32 px-6 max-w-7xl mx-auto z-10 relative">
      <header className="mb-12">
        <h1 className="text-4xl font-headline font-black text-foreground uppercase tracking-tight mb-2">
          الإعدادات
        </h1>
        <p className="text-muted-foreground">إدارة ملفك الشخصي وإعدادات الأمان</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-primary-container/15 dark:border-white/5">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-6 py-4 font-headline font-bold uppercase tracking-widest text-sm transition-all relative ${activeTab === 'profile'
            ? 'text-primary-container border-b-2 border-primary-container'
            : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          الملف الشخصي
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-6 py-4 font-headline font-bold uppercase tracking-widest text-sm transition-all relative ${activeTab === 'security'
            ? 'text-primary-container border-b-2 border-primary-container'
            : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          الأمان
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-8 animate-in fade-in">
          <form onSubmit={handleProfileSubmit} className="space-y-8">
            {/* Avatar Section */}
            <div className="bg-surface-container-low dark:bg-[#0A1628] border border-primary-container/15 dark:border-white/5 p-8 relative rounded-xl">
              <div className="l-bracket-tr opacity-20"></div>
              <h2 className="text-2xl font-bold font-headline text-foreground mb-6">الصورة الشخصية</h2>
              <div className="flex items-center gap-8">
                <div className="relative">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" className="w-32 h-32 rounded-full object-cover border-4 border-primary-container" />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-surface-container-high dark:bg-slate-700 border-4 border-primary-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-6xl text-muted-foreground">person</span>
                    </div>
                  )}
                </div>
                <label className="flex-grow cursor-pointer">
                  <div className="border-2 border-dashed border-primary-container/20 dark:border-white/10 rounded-2xl p-8 text-center group hover:border-primary-container/50 transition-all">
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    <span className="material-symbols-outlined text-4xl text-muted-foreground mb-4 group-hover:text-primary-container transition-colors block">photo_camera</span>
                    <p className="text-sm text-muted-foreground mb-2">{avatarFile ? avatarFile.name : 'اختر صورة جديدة'}</p>
                    <p className="text-[10px] text-muted-foreground">JPG, PNG (Max 5MB)</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Profile Info */}
            <div className="bg-surface-container-low dark:bg-[#0A1628] border border-primary-container/15 dark:border-white/5 p-8 relative rounded-xl">
              <div className="l-bracket-bl opacity-20"></div>
              <h2 className="text-2xl font-bold font-headline text-foreground mb-6">معلومات الملف الشخصي</h2>
              <div className="space-y-6">
                <div>
                  <label className="block font-data text-xs text-muted-foreground uppercase tracking-widest mb-2">الاسم الكامل</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-surface-container dark:bg-slate-900 border border-primary-container/20 dark:border-white/10 p-4 rounded-xl text-foreground focus:border-primary-container transition-all outline-none"
                    placeholder="أدخل اسمك الكامل"
                  />
                </div>
                <div>
                  <label className="block font-data text-xs text-muted-foreground uppercase tracking-widest mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={userEmail}
                    disabled
                    className="w-full bg-surface-container/50 dark:bg-slate-900/50 border border-primary-container/10 dark:border-white/5 p-4 rounded-xl text-muted-foreground cursor-not-allowed opacity-50"
                  />
                  <p className="text-[10px] text-muted-foreground mt-2">لا يمكن تغيير البريد الإلكتروني</p>
                </div>
                <div>
                  <label className="block font-data text-xs text-muted-foreground uppercase tracking-widest mb-2">السيرة الذاتية</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-surface-container dark:bg-slate-900 border border-primary-container/20 dark:border-white/10 p-4 rounded-xl text-foreground focus:border-primary-container transition-all outline-none resize-none"
                    placeholder="أخبرنا عن نفسك..."
                    rows={4}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={isPending} className="bg-primary-container text-background font-black px-12 py-4 clip-button hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-3">
                {isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                {!isPending && <span className="material-symbols-outlined">check</span>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-8 animate-in fade-in">
          <div className="bg-surface-container-low dark:bg-[#0A1628] border border-primary-container/15 dark:border-white/5 p-8 relative rounded-xl">
            <div className="l-bracket-tr opacity-20"></div>
            <h2 className="text-2xl font-bold font-headline text-foreground mb-6">الجلسات النشطة</h2>
            <div className="flex items-center justify-between p-4 bg-surface-container dark:bg-slate-900 border-r-4 border-r-primary-container rounded-lg">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary-container text-2xl">desktop_windows</span>
                <div>
                  <p className="font-headline font-bold text-foreground">المتصفح الحالي</p>
                  <p className="text-[10px] text-muted-foreground font-data">جلسة نشطة</p>
                </div>
              </div>
              <span className="text-[10px] font-data text-primary-container bg-primary-container/10 px-3 py-1 rounded uppercase font-bold tracking-widest">نشط</span>
            </div>
          </div>

          <div className="bg-surface-container-low dark:bg-[#0A1628] border border-primary-container/15 dark:border-white/5 p-8 relative rounded-xl">
            <div className="l-bracket-bl opacity-20"></div>
            <h2 className="text-2xl font-bold font-headline text-foreground mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined">lock_reset</span>
              تغيير كلمة المرور
            </h2>
            <form onSubmit={handlePasswordUpdate} className="space-y-6">
              {passwordError && <div className="bg-red-500/10 text-red-600 dark:text-red-400 p-4 border border-red-500/30 rounded-lg text-sm">{passwordError}</div>}
              {passwordMessage && <div className="bg-green-500/10 text-green-600 dark:text-green-400 p-4 border border-green-500/30 rounded-lg text-sm">{passwordMessage}</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-data text-xs text-muted-foreground uppercase tracking-widest mb-2">كلمة المرور الجديدة</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-surface-container dark:bg-slate-900 border border-primary-container/20 dark:border-white/10 p-4 rounded-xl text-foreground focus:border-primary-container transition-all outline-none" placeholder="••••••••••" required minLength={6} />
                </div>
                <div>
                  <label className="block font-data text-xs text-muted-foreground uppercase tracking-widest mb-2">تأكيد كلمة المرور</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-surface-container dark:bg-slate-900 border border-primary-container/20 dark:border-white/10 p-4 rounded-xl text-foreground focus:border-primary-container transition-all outline-none" placeholder="••••••••••" required minLength={6} />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={passwordLoading} className="bg-primary-container text-background font-black px-12 py-4 clip-button hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-3">
                  {passwordLoading ? 'جاري الحفظ...' : 'تحديث كلمة المرور'}
                  {!passwordLoading && <span className="material-symbols-outlined">bolt</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
