import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { supabase } from '../lib/supabaseClient';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<User>;
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
          role: userProfile.role || 'Community Contributor',
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
          role: 'Community Contributor',
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
      
      updateProfile: async (userData: Partial<User>): Promise<User> => {
        const { user: currentUser } = get();
        
        if (!currentUser) {
          throw new Error('No user logged in');
        }

        console.log('Starting profile update with:', userData);

        try {
          // First, get the current profile from the database
          const { data: currentProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();

          if (fetchError) {
            console.error('Error fetching current profile:', fetchError);
            throw new Error('Failed to fetch current profile');
          }

          console.log('Current profile in DB:', currentProfile);

          // Prepare update data - explicitly handle each field
          const updateData = {
            name: userData.name ?? currentProfile.name,
            bio: userData.bio ?? currentProfile.bio,
            avatar_url: userData.avatar ?? currentProfile.avatar_url,
            role: userData.role ?? currentProfile.role,
            updated_at: new Date().toISOString()
          };

          console.log('Updating profile with:', updateData);

          // Update the profile
          const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', currentUser.id)
            .select()
            .single();

          if (updateError) {
            console.error('Error updating profile:', updateError);
            throw new Error('Failed to update profile: ' + updateError.message);
          }

          if (!updatedProfile) {
            throw new Error('No profile data returned after update');
          }

          console.log('Profile updated in DB:', updatedProfile);

          // Update the frontend state
          const newUserState: User = {
            id: currentUser.id,
            email: currentUser.email,
            name: updatedProfile.name,
            bio: updatedProfile.bio || undefined,
            avatar: updatedProfile.avatar_url || undefined,
            role: updatedProfile.role,
            isAdmin: updatedProfile.is_admin || false,
            createdAt: new Date(updatedProfile.created_at)
          };

          console.log('Setting new user state:', newUserState);
          set({ user: newUserState });

          return newUserState;
        } catch (error) {
          console.error('Profile update failed:', error);
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user ? {
          ...state.user,
          isAdmin: state.user.isAdmin // Ensure admin status is persisted
        } : null
      })
    }
  )
);