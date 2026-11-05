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
    if (!isSupabaseConfigured()) {
      const stored = await AsyncStorage.getItem(`@profile_${userId}`);
      return stored ? JSON.parse(stored) : null;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    if (!isSupabaseConfigured()) {
      const existing = await this.getProfile(userId);
      const updated = { ...(existing || {}), ...updates, updated_at: new Date().toISOString() };
      await AsyncStorage.setItem(`@profile_${userId}`, JSON.stringify(updated));
      return;
    }
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() });
    if (error) throw error;
  },

  // Watchlist
  async getWatchlist(userId: string): Promise<WatchlistItem[]> {
    if (!isSupabaseConfigured()) {
      const stored = await AsyncStorage.getItem(`@watchlist_${userId}`);
      return stored ? JSON.parse(stored) : [];
    }
    const { data, error } = await supabase
      .from('watchlists')
      .select('*')
      .eq('user_id', userId)
      .order('added_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async addToWatchlist(item: Omit<WatchlistItem, 'id' | 'added_at'>): Promise<WatchlistItem> {
    const newItem: WatchlistItem = {
      ...item,
      id: `${item.user_id}_${item.media_type}_${item.tmdb_id}`,
      added_at: new Date().toISOString(),
    };

    if (!isSupabaseConfigured()) {
      const current = await this.getWatchlist(item.user_id);
      const filtered = current.filter(
        (i) => !(i.tmdb_id === item.tmdb_id && i.media_type === item.media_type)
      );
      const updated = [newItem, ...filtered];
      await AsyncStorage.setItem(`@watchlist_${item.user_id}`, JSON.stringify(updated));
      return newItem;
    }

    const { data, error } = await supabase
      .from('watchlists')
      .upsert(newItem)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async removeFromWatchlist(userId: string, tmdbId: number, mediaType: 'movie' | 'tv'): Promise<void> {
    if (!isSupabaseConfigured()) {
      const current = await this.getWatchlist(userId);
      const updated = current.filter(
        (i) => !(i.tmdb_id === tmdbId && i.media_type === mediaType)
      );
      await AsyncStorage.setItem(`@watchlist_${userId}`, JSON.stringify(updated));
      return;
    }

    const { error } = await supabase
      .from('watchlists')
      .delete()
      .eq('user_id', userId)
      .eq('tmdb_id', tmdbId)
      .eq('media_type', mediaType);
    if (error) throw error;
  },

  // Favorites
  async getFavorites(userId: string): Promise<FavoriteItem[]> {
    if (!isSupabaseConfigured()) {
      const stored = await AsyncStorage.getItem(`@favorites_${userId}`);
      return stored ? JSON.parse(stored) : [];
    }
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .order('added_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async addToFavorites(item: Omit<FavoriteItem, 'id' | 'added_at'>): Promise<FavoriteItem> {
    const newItem: FavoriteItem = {
      ...item,
      id: `${item.user_id}_${item.media_type}_${item.tmdb_id}`,
      added_at: new Date().toISOString(),
    };

    if (!isSupabaseConfigured()) {
      const current = await this.getFavorites(item.user_id);
      const filtered = current.filter(
        (i) => !(i.tmdb_id === item.tmdb_id && i.media_type === item.media_type)
      );
      const updated = [newItem, ...filtered];
      await AsyncStorage.setItem(`@favorites_${item.user_id}`, JSON.stringify(updated));
      return newItem;
    }

    const { data, error } = await supabase
      .from('favorites')
      .upsert(newItem)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async removeFromFavorites(userId: string, tmdbId: number, mediaType: 'movie' | 'tv'): Promise<void> {
    if (!isSupabaseConfigured()) {
      const current = await this.getFavorites(userId);
      const updated = current.filter(
        (i) => !(i.tmdb_id === tmdbId && i.media_type === mediaType)
      );
      await AsyncStorage.setItem(`@favorites_${userId}`, JSON.stringify(updated));
      return;
    }

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('tmdb_id', tmdbId)
      .eq('media_type', mediaType);
    if (error) throw error;
  },

  // Watch History
  async getWatchHistory(userId: string): Promise<WatchHistoryItem[]> {
    if (!isSupabaseConfigured()) {
      const stored = await AsyncStorage.getItem(`@history_${userId}`);
      return stored ? JSON.parse(stored) : [];
    }
    const { data, error } = await supabase
      .from('watch_history')
      .select('*')
      .eq('user_id', userId)
      .order('last_watched_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    return data || [];
  },

  async recordHistory(item: Omit<WatchHistoryItem, 'id' | 'last_watched_at'>): Promise<void> {
    const newItem: WatchHistoryItem = {
      ...item,
      id: `${item.user_id}_${item.media_type}_${item.tmdb_id}`,
      last_watched_at: new Date().toISOString(),
    };
    if (!isSupabaseConfigured()) {
      const current = await this.getWatchHistory(item.user_id);
      const filtered = current.filter(
        (i) => !(i.tmdb_id === item.tmdb_id && i.media_type === item.media_type)
      );
      await AsyncStorage.setItem(`@history_${item.user_id}`, JSON.stringify([newItem, ...filtered].slice(0, 30)));
      return;
    }
    await supabase.from('watch_history').upsert(newItem);
  },
};
