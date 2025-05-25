export interface User {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  role?: string;
  createdAt: Date;
  isAdmin?: boolean;
}

export type PostStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  cover_image?: string;
  author_id: string;
  authorName?: string;
  authorRole?: string;
  category: string;
  hashtags: string[];
  created_at: string;
  updated_at: string;
  published: boolean;
  status: PostStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
}

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