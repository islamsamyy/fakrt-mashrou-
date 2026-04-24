'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';

interface RoadmapPhase {
  id: string;
  title: string;
  description: string;
  timeline: string;
  status: 'completed' | 'in-progress' | 'planned';
  features: string[];
  color: string;
}

const roadmapPhases: RoadmapPhase[] = [
  {
    id: '1',
    title: 'البناء الأساسي - Q1 2026',
    description: 'تأسيس المنصة الأساسية والميزات الأساسية',
    timeline: 'يناير - مارس 2026',
    status: 'completed',
    color: 'bg-emerald-500',
    features: [
      'نظام التسجيل والمصادقة',
      'لوحات تحكم المستخدمين',
      'نشر المشاريع',
      'نظام البحث والتصفية',
    ],
  },
  {
    id: '2',
    title: 'الاستثمار والعروض - Q2 2026',
    description: 'تفعيل نظام الاستثمار وإدارة العروض',
    timeline: 'أبريل - يونيو 2026',
    status: 'in-progress',
    color: 'bg-blue-500',
    features: [
      'نظام الاستثمار المباشر',
      'إدارة العروض والتفاوضات',
      'نظام الدفع المدمج',
      'تقارير الاستثمار',
    ],
  },
  {
    id: '3',
    title: 'الذكاء الاصطناعي والتحليلات - Q3 2026',
    description: 'دمج الذكاء الاصطناعي والتحليلات المتقدمة',
    timeline: 'يوليو - سبتمبر 2026',
    status: 'planned',
    color: 'bg-purple-500',
    features: [
      'تقييم ذكي للمشاريع',
      'توصيات مخصصة للمستثمرين',
      'تحليل السوق والاتجاهات',
      'نظام التنبيهات الذكية',
    ],
  },
  {
    id: '4',
    title: 'المراسلة والتعاون - Q4 2026',
    description: 'نظام المراسلة والتعاون بين الأطراف',
    timeline: 'أكتوبر - ديسمبر 2026',
    status: 'planned',
    color: 'bg-orange-500',
    features: [
      'نظام المراسلة المباشرة',
      'مشاركة الملفات والمستندات',
      'جلسات النقاش والاجتماعات',
      'إدارة المشاريع التعاونية',
    ],
  },
  {
    id: '5',
    title: 'التوسع والعولمة - 2027',
    description: 'التوسع إلى أسواق جديدة والدعم متعدد اللغات',
    timeline: 'يناير 2027 وما بعده',
    status: 'planned',
    color: 'bg-pink-500',
    features: [
      'دعم لغات إضافية',
      'توسع إلى دول جديدة',
      'شراكات استراتيجية',
      'برنامج المسرعات والحاضنات',
    ],
  },
];

const statusConfig = {
  completed: {
    label: 'مكتملة',
    icon: '✓',
    bgColor: 'bg-emerald-500/20',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
  },
  'in-progress': {
    label: 'قيد التطوير',
    icon: '●',
    bgColor: 'bg-blue-500/20',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-500/40',
  },
  planned: {
    label: 'مخطط',
    icon: '○',
    bgColor: 'bg-slate-500/20',
    textColor: 'text-slate-400',
    borderColor: 'border-slate-500/40',
  },
};

export default function RoadmapPage() {
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);

  return (
    <div className="bg-[#020409] text-on-surface font-body min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-20 pb-16 px-6 md:px-12">
        <div className="fixed inset-0 pointer-events-none z-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(0, 255, 209, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 209, 0.03) 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 font-headline">
              خارطة الطريق
            </h1>
            <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
              رؤيتنا لبناء أكبر منصة استثمار في الشرق الأوسط. رحلة تطوير شاملة تمتد على مراحل متعددة
            </p>
          </div>

          {/* Timeline */}
          <div className="space-y-8">
            {roadmapPhases.map((phase, index) => {
              const config = statusConfig[phase.status];
              const isExpanded = expandedPhase === phase.id;

              return (
                <div
                  key={phase.id}
                  className={`relative transition-all duration-300 ${isExpanded ? 'scale-105' : ''}`}
                >
                  {/* Connector Line */}
                  {index < roadmapPhases.length - 1 && (
                    <div className="absolute right-0 top-full h-8 w-[3px] bg-gradient-to-b from-primary-container/40 to-transparent transform -translate-x-1/2 translate-x-[50%]"></div>
                  )}

                  {/* Phase Card */}
                  <button
                    onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                    className={`w-full text-right transition-all duration-300 ${
                      config.bgColor
                    } ${config.borderColor} border backdrop-blur-sm p-6 md:p-8 rounded-lg hover:border-primary-container/60 active:scale-95`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 justify-end mb-2">
                          <h3 className="text-xl md:text-2xl font-bold text-white font-headline">
                            {phase.title}
                          </h3>
                          <span
                            className={`flex-shrink-0 w-3 h-3 rounded-full ${phase.color} shadow-[0_0_10px] animate-pulse`}
                          ></span>
                        </div>
                        <p className="text-sm text-on-surface-variant">
                          {phase.timeline}
                        </p>
                      </div>
                      <span
                        className={`ml-4 px-3 py-1 rounded-full text-xs font-bold ${config.bgColor} ${config.textColor} border ${config.borderColor}`}
                      >
                        {config.label}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-on-surface-variant text-right mb-4">
                      {phase.description}
                    </p>

                    {/* Expand Icon */}
                    <div className="flex justify-end">
                      <span className={`text-primary-container transition-transform duration-300 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}>
                        ▼
                      </span>
                    </div>
                  </button>

                  {/* Expanded Features */}
                  {isExpanded && (
                    <div className="mt-4 ml-4 md:ml-8 pl-6 border-r-2 border-primary-container/40 space-y-3 animate-in fade-in duration-300">
                      <p className="text-sm font-bold text-primary-container mb-4">الميزات المخطط لها:</p>
                      {phase.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-primary-container flex-shrink-0"></span>
                          <span className="text-sm text-on-surface-variant">{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* CTA Section */}
          <div className="mt-16 pt-12 border-t border-outline-variant/20 text-center">
            <p className="text-lg text-on-surface-variant mb-6">
              هل تريد أن تكون جزءاً من هذه الرحلة؟
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="px-8 py-3 bg-gradient-to-r from-primary-container to-[#00e0b7] text-on-primary font-bold rounded-lg hover:brightness-110 transition-all active:scale-95 shadow-[0_0_20px_rgba(0,255,209,0.3)]"
              >
                ابدأ الآن
              </Link>
              <Link
                href="/"
                className="px-8 py-3 border border-primary-container/40 text-primary-container font-bold rounded-lg hover:border-primary-container/80 transition-all active:scale-95"
              >
                العودة للرئيسية
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
