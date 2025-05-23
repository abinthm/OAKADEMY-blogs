import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BlogPost, Category, PostStatus } from '../types';
import { useAuthStore } from './authStore';
import { supabase } from '../lib/supabaseClient';
import type { Database } from '../lib/database.types';

interface BlogState {
  posts: BlogPost[];
  drafts: BlogPost[];
  addPost: (post: BlogPost) => void;
  updatePost: (id: string, post: Partial<BlogPost>) => void;
  deletePost: (id: string) => void;
  getPostById: (id: string) => BlogPost | undefined;
  getPostsByAuthor: (authorId: string) => BlogPost[];
  getPostsByCategory: (category: Category) => BlogPost[];
  getPostsByHashtag: (hashtag: string) => BlogPost[];
  getPendingPosts: () => BlogPost[];
  approvePost: (id: string, reviewNotes?: string) => void;
  rejectPost: (id: string, reviewNotes: string) => void;
  saveDraft: (draft: BlogPost) => void;
  publishDraft: (id: string) => void;
}

export const useBlogStore = create<BlogState>()(
  persist(
    (set, get) => ({
      posts: [],
      drafts: [],
      
      addPost: (post) => {
        set((state) => ({
          posts: [...state.posts, post]
        }));
      },
      
      updatePost: (id, postData) => {
        set((state) => ({
          posts: state.posts.map((post) => 
            post.id === id 
              ? { ...post, ...postData } 
              : post
          )
        }));
      },
      
      deletePost: (id) => {
        set((state) => ({
          posts: state.posts.filter((post) => post.id !== id),
          drafts: state.drafts.filter((draft) => draft.id !== id)
        }));
      },
      
      getPostById: (id) => {
        const { posts, drafts } = get();
        return [...posts, ...drafts].find((post) => post.id === id);
      },
      
      getPostsByAuthor: (authorId) => {
        return get().posts.filter((post) => 
          post.author_id === authorId && 
          post.status === 'approved' && 
          post.published
        );
      },
      
      getPostsByCategory: (category) => {
        return get().posts.filter((post) => 
          post.category === category && 
          post.status === 'approved' && 
          post.published
        );
      },
      
      getPostsByHashtag: (hashtag) => {
        return get().posts.filter((post) => 
          post.hashtags.includes(hashtag) && 
          post.status === 'approved' && 
          post.published
        );
      },

      getPendingPosts: () => {
        return get().posts.filter((post) => post.status === 'pending');
      },

      approvePost: (id, reviewNotes) => {
        const user = useAuthStore.getState().user;
        if (!user?.isAdmin) throw new Error('Unauthorized: Only admins can approve posts');

        set((state) => ({
          posts: state.posts.map((post) => 
            post.id === id 
              ? {
                  ...post,
                  status: 'approved',
                  published: true,
                  reviewed_by: user.id,
                  reviewed_at: new Date().toISOString(),
                  review_notes: reviewNotes || 'Approved',
                  updated_at: new Date().toISOString()
                }
              : post
          )
        }));
      },

      rejectPost: (id, reviewNotes) => {
        const user = useAuthStore.getState().user;
        if (!user?.isAdmin) throw new Error('Unauthorized: Only admins can reject posts');

        set((state) => ({
          posts: state.posts.map((post) => 
            post.id === id 
              ? {
                  ...post,
                  status: 'rejected',
                  published: false,
                  reviewed_by: user.id,
                  reviewed_at: new Date().toISOString(),
                  review_notes: reviewNotes,
                  updated_at: new Date().toISOString()
                }
              : post
          )
        }));
      },
      
      saveDraft: (draft) => {
        set((state) => ({ 
          drafts: [...state.drafts, draft]
        }));
      },
      
      publishDraft: (id) => {
        const draft = get().drafts.find(d => d.id === id);
        if (!draft) return;

        set((state) => ({
          posts: [...state.posts, { ...draft, status: 'pending', published: false }],
          drafts: state.drafts.filter(d => d.id !== id)
        }));
      }
    }),
    {
      name: 'blog-storage',
    }
  )
);