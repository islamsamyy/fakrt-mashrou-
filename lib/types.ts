export interface Profile {
  id: string;
  role: 'founder' | 'investor' | 'admin';
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  kyc_status: 'unverified' | 'pending' | 'verified';
  tier: 'basic' | 'premium' | 'enterprise';
  interests?: string[];
  created_at: string;
}

export interface Project {
  id: string;
  founder_id: string;
  title: string;
  description: string | null;
  category: string | null;
  funding_goal: number;
  amount_raised: number;
  min_invest: number;
  roi: string | null;
  status: 'draft' | 'active' | 'funded' | 'cancelled';
  verified: boolean;
  img: string | null;
  video_url: string | null;
  created_at: string;
  founder?: Profile;
}

export interface Investment {
  id: string;
  investor_id: string;
  project_id: string;
  amount: number;
  status: 'committed' | 'paid' | 'cancelled';
  created_at: string;
  project?: Project;
  investor?: Profile;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  project_id: string | null;
  content: string;
  read: boolean;
  created_at: string;
  sender?: Profile;
  receiver?: Profile;
  project?: Project;
}

export interface SavedOpportunity {
  id: string;
  user_id: string;
  project_id: string;
  created_at: string;
  project?: Project;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  event_type: 'investment' | 'message' | 'project' | 'system';
  related_user_id?: string | null;
  created_at: string;
  relatedUser?: Profile;
}
