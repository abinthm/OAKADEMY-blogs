import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      
      login: async (email: string, password: string) => {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) {
          console.error('Auth error:', authError);
          throw new Error(authError.message);
        }

        if (!authData.user) {
          throw new Error('No user data returned');
        }

        console.log('Auth successful, fetching profile for user:', authData.user.id);

        let userProfile;
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          // Create profile if it doesn't exist
          console.log('Attempting to create profile for user:', authData.user.id);
          
          const { data: insertData, error: insertError } = await supabase
            .from('profiles')
            .insert([
              {
                id: authData.user.id,
                name: email.split('@')[0], // Use email username as default name
              }
            ])
            .select()
            .single();

          if (insertError) {
            console.error('Profile creation error:', insertError);
            throw new Error(`Failed to create user profile: ${insertError.message}`);
          }

          if (!insertData) {
            throw new Error('No profile data returned after creation');
          }

          userProfile = insertData;
          console.log('Profile created successfully:', userProfile);
        } else {
          userProfile = profile;
          console.log('Existing profile found:', userProfile);
        }

        const user: User = {
          id: authData.user.id,
          email: authData.user.email!,
          name: userProfile.name,
          bio: userProfile.bio || undefined,
          avatar: userProfile.avatar_url || undefined,
          createdAt: new Date(userProfile.created_at),
          isAdmin: userProfile.is_admin || false,
        };

        set({ user, isAuthenticated: true });
        return user;
      },
      
      register: async (name: string, email: string, password: string) => {
        console.log('Starting registration for:', email);
        
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) {
          console.error('Registration auth error:', authError);
          throw new Error(authError.message);
        }

        if (!authData.user) {
          throw new Error('No user data returned');
        }

        console.log('Auth successful, creating profile for user:', authData.user.id);

        // Create the profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              name: name,
              is_admin: false,
            }
          ])
          .select()
          .single();

        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw new Error(`Failed to create user profile: ${profileError.message}`);
        }

        if (!profileData) {
          throw new Error('No profile data returned after creation');
        }

        console.log('Profile created successfully:', profileData);

        const user: User = {
          id: authData.user.id,
          email: authData.user.email!,
          name,
          createdAt: new Date(profileData.created_at),
          isAdmin: false,
        };

        set({ user, isAuthenticated: true });
        return user;
      },
      
      logout: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Logout error:', error);
          throw new Error('Failed to log out');
        }
        set({ user: null, isAuthenticated: false });
      },
      
      updateProfile: async (userData) => {
        const { user: currentUser } = useAuthStore.getState();
        
        if (!currentUser) {
          throw new Error('No user logged in');
        }

        // Convert avatar to avatar_url for database
        const dbData = {
          ...userData,
          avatar_url: userData.avatar,
        };
        delete dbData.avatar;

        const { error } = await supabase
          .from('profiles')
          .update(dbData)
          .eq('id', currentUser.id);

        if (error) {
          console.error('Profile update error:', error);
          throw new Error('Failed to update profile');
        }

        // Keep avatar in the frontend state
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null
        }));
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);