import { Navbar } from '@/components/layout/Navbar'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch project with founder details
  const { data: project } = await supabase
    .from('projects')
    .select('*, founder:profiles!founder_id(*)')
    .eq('id', id)
    .single()

  if (!project) {
    notFound()
  }

  const fundingPercent = Math.round(
    ((project.amount_raised || 0) / (project.funding_goal || 1)) * 100
  )

  return (
    <div
      className="bg-background text-on-surface font-body min-h-screen relative overflow-x-hidden text-right"
      dir="rtl"
    >
      {/* Global Background Elements */}
      <div className="fixed inset-0 hex-grid pointer-events-none z-0 opacity-10"></div>
      <div className="fixed inset-0 scanline pointer-events-none z-0 opacity-5"></div>

      <Navbar />
      <DashboardSidebar />

      <main className="xl:mr-64 pt-32 pb-32 px-6 max-w-7xl mx-auto z-10 relative">
        {/* Breadcrumb */}
        <div className="mb-8 flex gap-2 text-sm">
          <Link href="/opportunities" className="text-primary-container font-data hover:underline">
            السوق
          </Link>
          <span className="text-slate-500">/</span>
          <span className="text-slate-300 font-data truncate">{project.title}</span>
        </div>

        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tighter text-white mb-4">
            {project.title}
          </h1>
          <p className="text-slate-400 max-w-2xl text-lg mb-8 leading-relaxed">
            {project.description || 'لا توجد وصفة متاحة حالياً'}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href={`/projects/${id}/funding`}>
              <button className="bg-primary-container text-background font-bold px-8 py-3 clip-button hover:brightness-110 active:scale-95 transition-all uppercase tracking-widest font-data">
                تمويل المشروع
              </button>
            </Link>
            <Link href="/messages">
              <button className="border-2 border-secondary-container text-secondary-container bg-transparent px-8 py-3 clip-button hover:bg-secondary-container hover:text-black transition-all font-bold uppercase tracking-widest font-data">
                تواصل مع المؤسس
              </button>
            </Link>
          </div>
        </header>

        {/* Content Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Video Section */}
            {project.video_url && (
              <div className="bg-[#0A1628] border border-white/5 p-8 relative">
                <div className="l-bracket-tr opacity-20"></div>
                <h2 className="text-2xl font-bold font-headline mb-4 text-primary-container">
                  فيديو المشروع
                </h2>
                <div className="relative w-full bg-slate-900 rounded-lg overflow-hidden border border-white/10">
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      className="absolute top-0 left-0 w-full h-full"
                      src={
                        project.video_url.includes('youtube.com') || project.video_url.includes('youtu.be')
                          ? `https://www.youtube.com/embed/${project.video_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^\&\?\/\r\n]+)/)?.[1]}`
                          : project.video_url.includes('vimeo.com')
                          ? `https://player.vimeo.com/video/${project.video_url.match(/vimeo\.com\/(\d+)/)?.[1]}`
                          : undefined
                      }
                      title="Project video"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Project Image */}
            {project.img && (
              <div className="relative h-96 overflow-hidden border border-white/5">
                <Image
                  src={project.img}
                  alt={project.title}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
                {project.verified && (
                  <div className="absolute top-4 left-4 bg-primary-container/20 backdrop-blur-md border border-primary-container/30 px-4 py-2 rounded-lg">
                    <span className="text-primary-container font-black text-xs uppercase tracking-widest flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">verified</span>
                      معتمد
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Executive Summary */}
            <div className="bg-[#0A1628] border border-white/5 p-8 relative">
              <div className="l-bracket-tr opacity-20"></div>
              <h2 className="text-2xl font-bold font-headline mb-4 text-primary-container">
                الملخص التنفيذي
              </h2>
              <p className="text-slate-300 leading-loose">
                {project.description || 'لم يتم تقديم وصف للمشروع بعد.'}
              </p>
            </div>

            {/* Project Details */}
            <div className="bg-[#0A1628] border border-white/5 p-8 relative">
              <div className="l-bracket-tr opacity-20"></div>
              <h2 className="text-2xl font-bold font-headline mb-6 text-secondary-container">
                تفاصيل المشروع
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between pb-4 border-b border-white/5">
                  <span className="text-slate-400 font-data text-xs uppercase tracking-widest">الحد الأدنى للاستثمار</span>
                  <span className="text-white font-data font-black text-lg">
                    ${(project.min_invest || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between pb-4 border-b border-white/5">
                  <span className="text-slate-400 font-data text-xs uppercase tracking-widest">العائد المتوقع</span>
                  <span className="text-primary-container font-data font-black text-lg">
                    {project.roi || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between pb-4 border-b border-white/5">
                  <span className="text-slate-400 font-data text-xs uppercase tracking-widest">الحالة</span>
                  <span className="text-tertiary-fixed-dim font-data font-black text-lg uppercase">
                    {project.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Basic Info Card */}
            <div className="bg-[#0A1628] border border-white/5 p-6 relative">
              <div className="l-bracket-bl opacity-20"></div>
              <h3 className="font-bold text-white mb-6 text-lg font-headline">معلومات أساسية</h3>
              <div className="space-y-4">
                <div className="pb-4 border-b border-white/10">
                  <p className="text-slate-500 text-[10px] font-data uppercase tracking-widest mb-1">
                    التصنيف
                  </p>
                  <p className="text-white font-headline font-bold capitalize">{project.category || 'غير محدد'}</p>
                </div>
                <div className="pb-4 border-b border-white/10">
                  <p className="text-slate-500 text-[10px] font-data uppercase tracking-widest mb-1">
                    هدف التمويل
                  </p>
                  <p className="text-primary-container font-data font-black text-xl">
                    ${(project.funding_goal || 0).toLocaleString()}
                  </p>
                </div>
                <div className="pb-4 border-b border-white/10">
                  <p className="text-slate-500 text-[10px] font-data uppercase tracking-widest mb-1">
                    تم تجميعه
                  </p>
                  <p className="text-tertiary-fixed-dim font-data font-black text-xl">
                    ${(project.amount_raised || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] font-data uppercase tracking-widest mb-2">
                    التقدم
                  </p>
                  <div className="bg-slate-900 rounded-full h-2">
                    <div
                      className="h-full bg-primary-container shadow-[0_0_10px_#00ffd1] transition-all duration-300"
                      style={{ width: `${Math.min(fundingPercent, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-primary-container text-[10px] font-data font-black mt-2">
                    {fundingPercent}%
                  </p>
                </div>
              </div>
            </div>

            {/* Founder Card */}
            {project.founder && (
              <div className="bg-[#0A1628] border border-white/5 p-6 relative">
                <div className="l-bracket-tr opacity-20"></div>
                <h3 className="font-bold text-white mb-6 text-lg font-headline">مؤسس المشروع</h3>
                <div className="text-center">
                  {project.founder.avatar_url ? (
                    <Image
                      src={project.founder.avatar_url}
                      alt={project.founder.full_name || 'مؤسس'}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-primary-container"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-slate-700 flex items-center justify-center border-2 border-primary-container">
                      <span className="material-symbols-outlined text-primary-container text-4xl">
                        person
                      </span>
                    </div>
                  )}
                  <h4 className="text-white font-bold font-headline mb-2">
                    {project.founder.full_name || 'مؤسس مجهول'}
                  </h4>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                    {project.founder.bio || 'لا توجد سيرة ذاتية'}
                  </p>
                  <Link href="/messages">
                    <button className="w-full bg-primary-container/10 border border-primary-container/30 text-primary-container font-bold py-2 hover:bg-primary-container/20 transition-all text-sm uppercase tracking-widest font-data">
                      أرسل رسالة
                    </button>
                  </Link>
                </div>
              </div>
            )}

            {/* Key Stats */}
            <div className="bg-[#0A1628] border border-white/5 p-6 relative">
              <div className="l-bracket-bl opacity-20"></div>
              <h3 className="font-bold text-white mb-6 text-lg font-headline">الإحصائيات</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-data text-xs uppercase">مشاهدات</span>
                  <span className="text-white font-data font-black text-lg">245</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-data text-xs uppercase">المهتمون</span>
                  <span className="text-primary-container font-data font-black text-lg">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-data text-xs uppercase">عمر المشروع</span>
                  <span className="text-tertiary-fixed-dim font-data font-black text-lg">
                    {Math.floor(
                      (Date.now() - new Date(project.created_at).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{' '}
                    يوم
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
