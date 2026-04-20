import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/Navbar';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import Link from 'next/link';

export const metadata = {
  title: 'User Management - Admin',
};

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Verify admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/');
  }

  // Fetch all users
  const { data: users } = await supabase
    .from('profiles')
    .select('id, full_name, role, kyc_status, tier, created_at')
    .order('created_at', { ascending: false });

  return (
    <div className="bg-background text-on-surface font-body min-h-screen relative overflow-x-hidden text-right" dir="rtl">
      <div className="fixed inset-0 hex-grid pointer-events-none z-0 opacity-10" />
      <Navbar />
      <DashboardSidebar />

      <main className="xl:mr-64 pt-32 pb-20 px-8 min-h-screen z-10 relative">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 font-headline">
              إدارة المستخدمين
            </h1>
            <p className="text-slate-400">إدارة جميع المستخدمين على المنصة</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-[#0A1628] border border-white/5 rounded-lg p-6">
              <div className="text-slate-400 text-sm mb-2">إجمالي المستخدمين</div>
              <div className="text-3xl font-black text-primary-container">{users?.length || 0}</div>
            </div>

            <div className="bg-[#0A1628] border border-white/5 rounded-lg p-6">
              <div className="text-slate-400 text-sm mb-2">المؤسسون</div>
              <div className="text-3xl font-black text-secondary-container">
                {users?.filter((u: any) => u.role === 'founder').length || 0}
              </div>
            </div>

            <div className="bg-[#0A1628] border border-white/5 rounded-lg p-6">
              <div className="text-slate-400 text-sm mb-2">المستثمرون</div>
              <div className="text-3xl font-black text-tertiary-fixed">
                {users?.filter((u: any) => u.role === 'investor').length || 0}
              </div>
            </div>

            <div className="bg-[#0A1628] border border-white/5 rounded-lg p-6">
              <div className="text-slate-400 text-sm mb-2">التحقق الكامل</div>
              <div className="text-3xl font-black text-green-400">
                {users?.filter((u: any) => u.kyc_status === 'verified').length || 0}
              </div>
            </div>
          </div>

          <div className="bg-[#0A1628] border border-white/5 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/5 bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-right text-sm font-black text-primary-container">الاسم</th>
                    <th className="px-6 py-4 text-right text-sm font-black text-primary-container">النوع</th>
                    <th className="px-6 py-4 text-right text-sm font-black text-primary-container">حالة التحقق</th>
                    <th className="px-6 py-4 text-right text-sm font-black text-primary-container">المستوى</th>
                    <th className="px-6 py-4 text-right text-sm font-black text-primary-container">تاريخ الإنشاء</th>
                    <th className="px-6 py-4 text-right text-sm font-black text-primary-container">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {users && users.length > 0 ? (
                    users.map((userItem: any) => (
                      <tr key={userItem.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-medium text-white">{userItem.full_name || 'بدون اسم'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${userItem.role === 'founder' ? 'bg-secondary-container/20 text-secondary-container' : 'bg-tertiary-fixed/20 text-tertiary-fixed'}`}>
                            {userItem.role === 'founder' ? 'مؤسس' : 'مستثمر'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${userItem.kyc_status === 'verified' ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'}`}>
                            {userItem.kyc_status === 'verified' ? 'موثق' : 'لم يتم التحقق'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">{userItem.tier === 'basic' ? 'أساسي' : 'مميز'}</td>
                        <td className="px-6 py-4 text-sm text-slate-400">{new Date(userItem.created_at).toLocaleDateString('ar')}</td>
                        <td className="px-6 py-4">
                          <Link href={`/admin/kyc?user=${userItem.id}`} className="text-xs font-bold text-primary-container hover:text-primary-container/80">
                            عرض
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        لا توجد مستخدمون
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8">
            <Link href="/admin" className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-primary-container font-bold rounded-lg hover:bg-white/20">
              العودة
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
