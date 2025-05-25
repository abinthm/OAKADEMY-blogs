export type Category =
  | 'Latest Roots'
  | 'Culture & Identity'
  | 'Education & Opportunity'
  | 'Gender & Expression'
  | 'Climate & Planet'
  | 'Health & Hope'
  | 'Governance & Voice'
  | 'Justice & Rights'
  | 'Civic Spark';

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  cover_image?: string;
  author_id: string;
  authorName?: string;
  authorRole?: string;
  category: Category;
  hashtags: string[];
  published: boolean;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  reviewed_by?: string;
  reviewer?: {
    id: string;
    name: string;
    role: string;
  };
  author?: {
    id: string;
    name: string;
    avatar_url?: string;
    role: string;
  };
} 