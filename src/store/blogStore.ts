import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BlogPost, Category, PostStatus } from '../types';
import { useAuthStore } from './authStore';
import { supabase } from '../lib/supabaseClient';
import type { Database } from '../lib/database.types';

interface BlogState {
  posts: BlogPost[];
  drafts: BlogPost[];
  fetchPosts: () => Promise<void>;
  fetchDrafts: () => Promise<void>;
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
  createPost: (post: Partial<BlogPost>) => Promise<BlogPost>;
  publishPost: (id: string) => Promise<void>;
}

export const useBlogStore = create<BlogState>()(
  persist(
    (set, get) => ({
      posts: [],
      drafts: [],
      
      fetchPosts: async () => {
        try {
          const { data: posts, error } = await supabase
            .from('posts')
            .select(`
              *,
              author:profiles!posts_author_id_fkey (
                id,
                name,
                avatar_url,
                role,
                is_admin
              ),
              reviewer:profiles!posts_reviewed_by_fkey (
                id,
                name,
                role,
                is_admin
              )
            `)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching posts:', error);
            return;
          }

          // Transform posts to include author name and ensure proper typing
          const transformedPosts = posts?.map(post => ({
            ...post,
            authorName: post.author?.name || 'Community Member',
            authorRole: post.author?.role || 'Community Contributor',
            hashtags: post.hashtags || [],
            status: post.status || 'draft',
            published: post.published || false,
            reviewer: post.reviewer || null
          })) || [];

          console.log('Fetched posts:', transformedPosts);
          console.log('Pending posts:', transformedPosts.filter(post => post.status === 'pending'));
          set({ posts: transformedPosts });
        } catch (error) {
          console.error('Error in fetchPosts:', error);
        }
      },
      
      fetchDrafts: async () => {
        try {
          const { data: drafts, error } = await supabase
            .from('posts')
            .select(`
              *,
              author:profiles(
                id,
                name,
                avatar_url,
                role
              )
            `)
            .eq('published', false)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching drafts:', error);
            return;
          }

          set({ drafts: drafts || [] });
        } catch (error) {
          console.error('Error in fetchDrafts:', error);
        }
      },
      
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
      
      deletePost: async (id) => {
        try {
          // Delete hashtags first (due to foreign key constraint)
          const { error: hashtagError } = await supabase
            .from('post_hashtags')
            .delete()
            .eq('post_id', id);

          if (hashtagError) throw hashtagError;

          // Delete the post
          const { error: postError } = await supabase
            .from('posts')
            .delete()
            .eq('id', id);

          if (postError) throw postError;

          // Update local store after successful deletion
          set((state) => ({
            posts: state.posts.filter((post) => post.id !== id),
            drafts: state.drafts.filter((draft) => draft.id !== id)
          }));
        } catch (error) {
          console.error('Error deleting post:', error);
          throw error;
        }
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
        const allPosts = get().posts;
        console.log('All posts in store:', allPosts);
        const pendingPosts = allPosts.filter(post => post.status === 'pending');
        console.log('Filtered pending posts:', pendingPosts);
        return pendingPosts;
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
      },

      createPost: async (post) => {
        try {
          const { data, error } = await supabase
            .from('posts')
            .insert([post])
            .select(`
              *,
              author:profiles(
                id,
                name,
                avatar_url,
                role
              )
            `)
            .single();

          if (error) {
            console.error('Error creating post:', error);
            throw error;
          }

          if (!data) {
            throw new Error('No data returned from post creation');
          }

          // Update the appropriate list
          if (data.published) {
            set(state => ({ posts: [data, ...state.posts] }));
          } else {
            set(state => ({ drafts: [data, ...state.drafts] }));
          }

          return data;
        } catch (error) {
          console.error('Error in createPost:', error);
          throw error;
        }
      },

      publishPost: async (id) => {
        try {
          const { data, error } = await supabase
            .from('posts')
            .update({ published: true })
            .eq('id', id)
            .select(`
              *,
              author:profiles(
                id,
                name,
                avatar_url,
                role
              )
            `)
            .single();

          if (error) {
            console.error('Error publishing post:', error);
            throw error;
          }

          if (!data) {
            throw new Error('No data returned from post publish');
          }

          // Move from drafts to posts
          set(state => ({
            posts: [data, ...state.posts],
            drafts: state.drafts.filter(post => post.id !== id)
          }));
        } catch (error) {
          console.error('Error in publishPost:', error);
          throw error;
        }
      }
    }),
    {
      name: 'blog-storage',
    }
  )
);