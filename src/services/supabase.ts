import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/constants';
import { UserProfile, WatchlistItem, FavoriteItem, WatchHistoryItem } from '../types/supabase';

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(SUPABASE_URL) &&
    !SUPABASE_URL.includes('placeholder-tmdb-project') &&
    Boolean(SUPABASE_ANON_KEY) &&
    !SUPABASE_ANON_KEY.includes('placeholder-anon-key')
  );
};

export const isValidUUID = (id?: string | null): boolean => {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const supabaseService = {
  // Profiles
  async getProfile(userId: string): Promise<UserProfile | null> {
    const stored = await AsyncStorage.getItem(`@profile_${userId}`);
    const localProfile = stored ? JSON.parse(stored) : null;

    if (!isSupabaseConfigured() || !isValidUUID(userId)) {
      return localProfile;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        return localProfile;
      }
      return data || localProfile;
    } catch {
      return localProfile;
    }
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    // 1. Always update local storage first so UI and avatar update immediately
    const existing = await this.getProfile(userId);
    const updated = { ...(existing || {}), ...updates, updated_at: new Date().toISOString() };
    await AsyncStorage.setItem(`@profile_${userId}`, JSON.stringify(updated));

    // 2. Only push to Supabase if configured AND userId is a valid Supabase Auth UUID
    if (!isSupabaseConfigured() || !isValidUUID(userId)) return;

    try {
      let email = updates.email || existing?.email;
      if (!email) {
        const { data: authData } = await supabase.auth.getUser();
        email = authData.user?.email || '';
      }

      const payload = {
        id: userId,
        email: email || '',
        full_name: updates.full_name || existing?.full_name || '',
        avatar_url: updates.avatar_url || existing?.avatar_url || '',
        favorite_genre: updates.favorite_genre || existing?.favorite_genre || 'Action',
        preferred_language: updates.preferred_language || existing?.preferred_language || 'ml',
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(payload);

      if (error) {
        console.warn('Supabase profiles update notice:', error.message);
      }
    } catch (err: any) {
      console.warn('Supabase profiles error handled safely:', err.message);
    }
  },

  // Watchlist
  async getWatchlist(userId: string): Promise<WatchlistItem[]> {
    const stored = await AsyncStorage.getItem(`@watchlist_${userId}`);
    const localList = stored ? JSON.parse(stored) : [];

    if (!isSupabaseConfigured() || !isValidUUID(userId)) {
      return localList;
    }

    try {
      const { data, error } = await supabase
        .from('watchlists')
        .select('*')
        .eq('user_id', userId)
        .order('added_at', { ascending: false });

      if (error) {
        return localList;
      }
      return data && data.length > 0 ? data : localList;
    } catch {
      return localList;
    }
  },

  async addToWatchlist(item: Omit<WatchlistItem, 'id' | 'added_at'>): Promise<WatchlistItem> {
    const newItem: WatchlistItem = {
      ...item,
      id: `${item.user_id}_${item.media_type}_${item.tmdb_id}`,
      added_at: new Date().toISOString(),
    };

    // Always persist locally
    const current = await this.getWatchlist(item.user_id);
    const filtered = current.filter(
      (i) => !(i.tmdb_id === item.tmdb_id && i.media_type === item.media_type)
    );
    const updated = [newItem, ...filtered];
    await AsyncStorage.setItem(`@watchlist_${item.user_id}`, JSON.stringify(updated));

    if (!isSupabaseConfigured() || !isValidUUID(item.user_id)) {
      return newItem;
    }

    try {
      const { data, error } = await supabase
        .from('watchlists')
        .upsert(newItem)
        .select()
        .single();

      if (error) {
        console.warn('Supabase watchlists notice:', error.message);
        return newItem;
      }
      return data || newItem;
    } catch {
      return newItem;
    }
  },

  async removeFromWatchlist(userId: string, tmdbId: number, mediaType: 'movie' | 'tv'): Promise<void> {
    const current = await this.getWatchlist(userId);
    const updated = current.filter(
      (i) => !(i.tmdb_id === tmdbId && i.media_type === mediaType)
    );
    await AsyncStorage.setItem(`@watchlist_${userId}`, JSON.stringify(updated));

    if (!isSupabaseConfigured() || !isValidUUID(userId)) return;

    try {
      await supabase
        .from('watchlists')
        .delete()
        .eq('user_id', userId)
        .eq('tmdb_id', tmdbId)
        .eq('media_type', mediaType);
    } catch {}
  },

  // Favorites
  async getFavorites(userId: string): Promise<FavoriteItem[]> {
    const stored = await AsyncStorage.getItem(`@favorites_${userId}`);
    const localList = stored ? JSON.parse(stored) : [];

    if (!isSupabaseConfigured() || !isValidUUID(userId)) {
      return localList;
    }

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userId)
        .order('added_at', { ascending: false });

      if (error) {
        return localList;
      }
      return data && data.length > 0 ? data : localList;
    } catch {
      return localList;
    }
  },

  async addToFavorites(item: Omit<FavoriteItem, 'id' | 'added_at'>): Promise<FavoriteItem> {
    const newItem: FavoriteItem = {
      ...item,
      id: `${item.user_id}_${item.media_type}_${item.tmdb_id}`,
      added_at: new Date().toISOString(),
    };

    const current = await this.getFavorites(item.user_id);
    const filtered = current.filter(
      (i) => !(i.tmdb_id === item.tmdb_id && i.media_type === item.media_type)
    );
    const updated = [newItem, ...filtered];
    await AsyncStorage.setItem(`@favorites_${item.user_id}`, JSON.stringify(updated));

    if (!isSupabaseConfigured() || !isValidUUID(item.user_id)) {
      return newItem;
    }

    try {
      const { data, error } = await supabase
        .from('favorites')
        .upsert(newItem)
        .select()
        .single();

      if (error) {
        console.warn('Supabase favorites notice:', error.message);
        return newItem;
      }
      return data || newItem;
    } catch {
      return newItem;
    }
  },

  async removeFromFavorites(userId: string, tmdbId: number, mediaType: 'movie' | 'tv'): Promise<void> {
    const current = await this.getFavorites(userId);
    const updated = current.filter(
      (i) => !(i.tmdb_id === tmdbId && i.media_type === mediaType)
    );
    await AsyncStorage.setItem(`@favorites_${userId}`, JSON.stringify(updated));

    if (!isSupabaseConfigured() || !isValidUUID(userId)) return;

    try {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('tmdb_id', tmdbId)
        .eq('media_type', mediaType);
    } catch {}
  },

  // Watch History
  async getWatchHistory(userId: string): Promise<WatchHistoryItem[]> {
    const stored = await AsyncStorage.getItem(`@history_${userId}`);
    const localList = stored ? JSON.parse(stored) : [];

    if (!isSupabaseConfigured() || !isValidUUID(userId)) {
      return localList;
    }

    try {
      const { data, error } = await supabase
        .from('watch_history')
        .select('*')
        .eq('user_id', userId)
        .order('last_watched_at', { ascending: false })
        .limit(20);

      if (error) {
        return localList;
      }
      return data || localList;
    } catch {
      return localList;
    }
  },

  async recordHistory(item: Omit<WatchHistoryItem, 'id' | 'last_watched_at'>): Promise<void> {
    const newItem: WatchHistoryItem = {
      ...item,
      id: `${item.user_id}_${item.media_type}_${item.tmdb_id}`,
      last_watched_at: new Date().toISOString(),
    };

    const current = await this.getWatchHistory(item.user_id);
    const filtered = current.filter(
      (i) => !(i.tmdb_id === item.tmdb_id && i.media_type === item.media_type)
    );
    await AsyncStorage.setItem(`@history_${item.user_id}`, JSON.stringify([newItem, ...filtered].slice(0, 30)));

    if (!isSupabaseConfigured() || !isValidUUID(item.user_id)) return;

    try {
      await supabase.from('watch_history').upsert(newItem);
    } catch {}
  },
};
