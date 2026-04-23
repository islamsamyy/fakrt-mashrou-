'use client'

import { useState } from 'react'
import { toast } from 'sonner'

interface VideoSectionProps {
  videoUrl: string | null
  onVideoUrlChange: (url: string) => void
}

const VALID_VIDEO_DOMAINS = ['youtube.com', 'youtu.be', 'vimeo.com']

function isValidVideoUrl(url: string): boolean {
  if (!url.trim()) return true // Allow empty

  try {
    const urlObj = new URL(url)
    return VALID_VIDEO_DOMAINS.some(domain => urlObj.hostname.includes(domain))
  } catch {
    return false
  }
}

function getVideoThumbnail(url: string): string | null {
  if (!url) return null

  // YouTube video ID extraction
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^\&\?\/\r\n]+)/)
  if (youtubeMatch?.[1]) {
    return `https://img.youtube.com/vi/${youtubeMatch[1]}/mqdefault.jpg`
  }

  // Vimeo video ID extraction
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch?.[1]) {
    return `https://i.vimeocdn.com/video/${vimeoMatch[1]}.jpg`
  }

  return null
}

function getEmbedUrl(url: string): string | null {
  if (!url) return null

  // YouTube
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^\&\?\/\r\n]+)/)
  if (youtubeMatch?.[1]) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch?.[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  }

  return null
}

export default function VideoSection({ videoUrl, onVideoUrlChange }: VideoSectionProps) {
  const [inputValue, setInputValue] = useState(videoUrl || '')
  const [showPreview, setShowPreview] = useState(!!videoUrl)

  const handleVideoUrlChange = (url: string) => {
    setInputValue(url)

    if (!url.trim()) {
      onVideoUrlChange('')
      setShowPreview(false)
      return
    }

    if (!isValidVideoUrl(url)) {
      toast.error('يجب استخدام رابط صحيح من YouTube أو Vimeo')
      return
    }

    onVideoUrlChange(url)
    setShowPreview(true)
    toast.success('تم إضافة رابط الفيديو')
  }

  const thumbnail = getVideoThumbnail(inputValue)
  const embedUrl = getEmbedUrl(inputValue)

  return (
    <div className="bg-[#0A1628] border border-white/5 p-8 relative">
      <div className="l-bracket-tr opacity-20"></div>

      <label className="block font-data text-xs text-slate-500 uppercase tracking-widest mb-4">
        رابط الفيديو التوضيحي (YouTube أو Vimeo)
      </label>

      <div className="space-y-4">
        <input
          type="url"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={(e) => handleVideoUrlChange(e.target.value)}
          className="w-full bg-slate-900 border border-white/10 p-4 rounded-xl text-white focus:border-primary-container transition-all outline-none placeholder-slate-600"
          placeholder="https://youtube.com/watch?v=... أو https://vimeo.com/..."
        />

        {inputValue && !isValidVideoUrl(inputValue) && (
          <p className="text-red-400 text-sm font-data">
            ⚠️ رابط غير صحيح. استخدم رابط YouTube أو Vimeo صحيح.
          </p>
        )}

        {/* Video Preview */}
        {showPreview && embedUrl && (
          <div className="space-y-4">
            <div className="text-sm text-slate-400 font-data">معاينة الفيديو</div>

            {/* Thumbnail Preview */}
            {thumbnail && (
              <div className="relative h-48 overflow-hidden border border-white/10 rounded-lg bg-slate-900">
                <img
                  src={thumbnail}
                  alt="Video thumbnail"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <span className="material-symbols-outlined text-white text-6xl opacity-70">play_circle</span>
                </div>
              </div>
            )}

            {/* Embedded Player Preview */}
            <div className="relative w-full bg-slate-900 rounded-lg overflow-hidden border border-white/10">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={embedUrl}
                  title="Video preview"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setInputValue('')
                onVideoUrlChange('')
                setShowPreview(false)
              }}
              className="w-full bg-red-500/10 border border-red-500/30 text-red-400 py-2 rounded hover:bg-red-500/20 transition-all font-data text-sm"
            >
              إزالة الفيديو
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
