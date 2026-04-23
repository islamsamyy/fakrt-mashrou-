'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updateProject, deleteProject } from './actions'
import VideoSection from './video-section'
import type { Project } from '@/lib/types'

interface EditProjectClientProps {
  project: Project
}

export default function EditProjectClient({ project }: EditProjectClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState({
    title: project.title,
    category: project.category || '',
    description: project.description || '',
    funding_goal: project.funding_goal.toString(),
    status: project.status,
    video_url: project.video_url || '',
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const categories = ['fintech', 'ai', 'realestate', 'health', 'energy', 'cybersecurity', 'ecommerce', 'logistics']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.category || !formData.funding_goal) {
      toast.error('يجب ملء جميع الحقول')
      return
    }

    startTransition(async () => {
      const result = await updateProject(project.id, formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('تم تحديث المشروع')
        router.push('/projects')
      }
    })
  }

  const handleDelete = async () => {
    startTransition(async () => {
      const result = await deleteProject(project.id)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('تم حذف المشروع')
        router.push('/projects')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Title */}
      <div className="bg-[#0A1628] border border-white/5 p-8 relative">
        <div className="l-bracket-tr opacity-20"></div>
        <label className="block font-data text-xs text-slate-500 uppercase tracking-widest mb-4">
          عنوان المشروع
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full bg-slate-900 border border-white/10 p-4 rounded-xl text-white focus:border-primary-container transition-all outline-none"
          placeholder="عنوان المشروع"
        />
      </div>

      {/* Category & Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0A1628] border border-white/5 p-8">
          <label className="block font-data text-xs text-slate-500 uppercase tracking-widest mb-4">
            القطاع
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full bg-slate-900 border border-white/10 p-4 rounded-xl text-white focus:border-primary-container transition-all outline-none"
          >
            <option value="">اختر القطاع</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-[#0A1628] border border-white/5 p-8">
          <label className="block font-data text-xs text-slate-500 uppercase tracking-widest mb-4">
            الحالة
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            className="w-full bg-slate-900 border border-white/10 p-4 rounded-xl text-white focus:border-primary-container transition-all outline-none"
          >
            <option value="draft">مسودة</option>
            <option value="active">نشط</option>
            <option value="funded">ممول</option>
            <option value="cancelled">ملغى</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div className="bg-[#0A1628] border border-white/5 p-8 relative">
        <div className="l-bracket-bl opacity-20"></div>
        <label className="block font-data text-xs text-slate-500 uppercase tracking-widest mb-4">
          الوصف
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full bg-slate-900 border border-white/10 p-4 rounded-xl text-white focus:border-primary-container transition-all outline-none resize-none"
          placeholder="وصف المشروع"
          rows={6}
        />
      </div>

      {/* Funding Goal */}
      <div className="bg-[#0A1628] border border-white/5 p-8 relative">
        <div className="l-bracket-tr opacity-20"></div>
        <label className="block font-data text-xs text-slate-500 uppercase tracking-widest mb-4">
          هدف التمويل ($)
        </label>
        <input
          type="number"
          value={formData.funding_goal}
          onChange={(e) => setFormData({ ...formData, funding_goal: e.target.value })}
          className="w-full bg-slate-900 border border-white/10 p-4 rounded-xl text-white focus:border-primary-container transition-all outline-none"
          placeholder="1000000"
          min="0"
        />
      </div>

      {/* Video Section */}
      <VideoSection
        videoUrl={formData.video_url}
        onVideoUrlChange={(url) => setFormData({ ...formData, video_url: url })}
      />

      {/* Buttons */}
      <div className="flex gap-4 justify-end">
        {!showDeleteConfirm ? (
          <>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-8 py-3 border border-white/20 text-white hover:bg-white/5 transition-all"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-8 py-3 border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
            >
              حذف المشروع
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="bg-primary-container text-background font-black px-12 py-3 clip-button hover:brightness-110 transition-all disabled:opacity-50"
            >
              {isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
          </>
        ) : (
          <div className="w-full bg-red-500/10 border border-red-500/30 p-6 rounded-lg">
            <p className="text-red-400 mb-4">هل أنت متأكد من حذف هذا المشروع؟ لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-grow px-4 py-2 bg-white/5 text-white hover:bg-white/10 transition-all"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="flex-grow px-4 py-2 bg-red-500 text-white hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {isPending ? 'جاري الحذف...' : 'تأكيد الحذف'}
              </button>
            </div>
          </div>
        )}
      </div>
    </form>
  )
}
