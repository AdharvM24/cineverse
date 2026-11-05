import { create } from 'zustand';
import { supabase, supabaseService, isSupabaseConfigured } from '../services/supabase';
import { UserProfile } from '../types/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isConfigured: boolean;
  initialize: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const DEMO_USER: UserProfile = {
  id: 'guest_user_demo_netflix',
  email: 'guest@cineverse.app',
  full_name: 'Cinephile Guest',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  favorite_genre: 'Action',
  preferred_language: 'ml',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: DEMO_USER,
  isLoading: true,
  isAuthenticated: true,
  isConfigured: isSupabaseConfigured(),

  initialize: async () => {
    try {
      const configured = isSupabaseConfigured();
      set({ isConfigured: configured });

      if (!configured) {
        // Load offline demo profile
        const stored = await AsyncStorage.getItem('@cineverse_demo_user');
        if (stored) {
          set({ user: JSON.parse(stored), isAuthenticated: true, isLoading: false });
        } else {
          await AsyncStorage.setItem('@cineverse_demo_user', JSON.stringify(DEMO_USER));
          set({ user: DEMO_USER, isAuthenticated: true, isLoading: false });
        }
        return;
      }

      // Check live Supabase session
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const profile = await supabaseService.getProfile(data.session.user.id);
        const userObj: UserProfile = {
          id: data.session.user.id,
          email: data.session.user.email || '',
          full_name: profile?.full_name || data.session.user.user_metadata?.full_name || 'Movie Lover',
          avatar_url: profile?.avatar_url || data.session.user.user_metadata?.avatar_url || DEMO_USER.avatar_url,
          favorite_genre: profile?.favorite_genre || 'Action',
          preferred_language: profile?.preferred_language || 'ml',
          created_at: profile?.created_at || new Date().toISOString(),
          updated_at: profile?.updated_at || new Date().toISOString(),
        };
        set({ user: userObj, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: DEMO_USER, isAuthenticated: true, isLoading: false });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const profile = await supabaseService.getProfile(session.user.id);
          set({
            user: {
              id: session.user.id,
              email: session.user.email || '',
              full_name: profile?.full_name || session.user.user_metadata?.full_name || 'Movie Lover',
              avatar_url: profile?.avatar_url || session.user.user_metadata?.avatar_url || DEMO_USER.avatar_url,
              favorite_genre: profile?.favorite_genre || 'Action',
              preferred_language: profile?.preferred_language || 'ml',
              created_at: profile?.created_at || new Date().toISOString(),
              updated_at: profile?.updated_at || new Date().toISOString(),
            },
            isAuthenticated: true,
          });
        }
      });
    } catch {
      set({ user: DEMO_USER, isAuthenticated: true, isLoading: false });
    }
  },

  signInWithEmail: async (email, password) => {
    try {
      if (!get().isConfigured) {
        const demoUser: UserProfile = {
          ...DEMO_USER,
          email,
          full_name: email.split('@')[0],
        };
        await AsyncStorage.setItem('@cineverse_demo_user', JSON.stringify(demoUser));
        set({ user: demoUser, isAuthenticated: true });
        return { success: true };
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };
      if (data.user) {
        const profile = await supabaseService.getProfile(data.user.id);
        set({
          user: {
            id: data.user.id,
            email: data.user.email || '',
            full_name: profile?.full_name || data.user.user_metadata?.full_name || email.split('@')[0],
            avatar_url: profile?.avatar_url || DEMO_USER.avatar_url,
            favorite_genre: profile?.favorite_genre || 'Action',
            preferred_language: profile?.preferred_language || 'ml',
            created_at: profile?.created_at || new Date().toISOString(),
            updated_at: profile?.updated_at || new Date().toISOString(),
          },
          isAuthenticated: true,
        });
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  },

  signUpWithEmail: async (email, password, fullName) => {
    try {
      if (!get().isConfigured) {
        const demoUser: UserProfile = {
          ...DEMO_USER,
          email,
          full_name: fullName,
        };
        await AsyncStorage.setItem('@cineverse_demo_user', JSON.stringify(demoUser));
        set({ user: demoUser, isAuthenticated: true });
        return { success: true };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) return { success: false, error: error.message };
      if (data.user) {
        await supabaseService.updateProfile(data.user.id, {
          email,
          full_name: fullName,
          avatar_url: DEMO_USER.avatar_url,
        });
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Signup failed' };
    }
  },

  signOut: async () => {
    if (get().isConfigured) {
      await supabase.auth.signOut();
    }
    await AsyncStorage.removeItem('@cineverse_demo_user');
    set({ user: DEMO_USER, isAuthenticated: true });
  },

  updateProfile: async (updates) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...updates };
    set({ user: updated });
    await supabaseService.updateProfile(current.id, updates);
  },
}));

