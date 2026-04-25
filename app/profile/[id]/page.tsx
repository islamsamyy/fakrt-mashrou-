import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProfileClient } from './ProfileClient';

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  // Fetch profile with better error handling
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, bio, role, tier, kyc_status, created_at')
    .eq('id', params.id)
    .single();

  if (error) {
    console.error('Profile fetch error:', error);
    // If auth error, try to fetch without authentication requirement
    if (error.code === 'PGRST116') {
      // Row not found - return not found
      notFound();
    }
  }

  if (!profile) {
    notFound();
  }

  // If founder, fetch their projects
  let projects: any[] = [];
  if (profile.role === 'founder') {
    const { data: projectsData } = await supabase
      .from('projects')
      .select('id, title, description, category, funding_goal, amount_raised, status, img')
      .eq('founder_id', params.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    projects = projectsData || [];
  }

  // If investor, fetch their investment count
  let investmentCount = 0;
  if (profile.role === 'investor') {
    const { count } = await supabase
      .from('investments')
      .select('*', { count: 'exact', head: true })
      .eq('investor_id', params.id);

    investmentCount = count || 0;
  }

  return (
    <ProfileClient
      profile={profile}
      projects={projects}
      investmentCount={investmentCount}
    />
  );
}
