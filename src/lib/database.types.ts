export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type PostStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          avatar_url: string | null
          bio: string | null
          role: string | null
          created_at: string
          updated_at: string
          is_admin: boolean
        }
        Insert: {
          id: string
          name: string
          avatar_url?: string | null
          bio?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
          is_admin?: boolean
        }
        Update: {
          id?: string
          name?: string
          avatar_url?: string | null
          bio?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
          is_admin?: boolean
        }
      }
      posts: {
        Row: {
          id: string
          title: string
          content: string
          excerpt: string
          cover_image: string | null
          author_id: string
          category: string
          published: boolean
          created_at: string
          updated_at: string
          status: PostStatus
          reviewed_by: string | null
          reviewed_at: string | null
          review_notes: string | null
        }
        Insert: {
          id?: string
          title: string
          content: string
          excerpt: string
          cover_image?: string | null
          author_id: string
          category: string
          published?: boolean
          created_at?: string
          updated_at?: string
          status?: PostStatus
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
        }
        Update: {
          id?: string
          title?: string
          content?: string
          excerpt?: string
          cover_image?: string | null
          author_id?: string
          category?: string
          published?: boolean
          created_at?: string
          updated_at?: string
          status?: PostStatus
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
        }
      }
      post_hashtags: {
        Row: {
          post_id: string
          hashtag: string
        }
        Insert: {
          post_id: string
          hashtag: string
        }
        Update: {
          post_id?: string
          hashtag?: string
        }
      }
    }
  }
}