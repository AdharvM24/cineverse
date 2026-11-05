import { create } from 'zustand';
import { supabaseService } from '../services/supabase';
import { WatchlistItem, FavoriteItem } from '../types/supabase';
import { useAuthStore } from './authStore';

interface WatchlistState {
  watchlist: WatchlistItem[];
  favorites: FavoriteItem[];
  isLoading: boolean;
  loadItems: () => Promise<void>;
  isInWatchlist: (tmdbId: number, mediaType?: 'movie' | 'tv') => boolean;
  isFavorite: (tmdbId: number, mediaType?: 'movie' | 'tv') => boolean;
  toggleWatchlist: (item: {
    tmdb_id: number;
    media_type: 'movie' | 'tv';
    title: string;
    poster_path: string | null;
    backdrop_path: string | null;
    vote_average: number;
    release_date: string;
  }) => Promise<boolean>;
  toggleFavorite: (item: {
    tmdb_id: number;
    media_type: 'movie' | 'tv';
    title: string;
    poster_path: string | null;
    backdrop_path: string | null;
    vote_average: number;
    release_date: string;
  }) => Promise<boolean>;
}

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  watchlist: [],
  favorites: [],
  isLoading: false,

  loadItems: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    set({ isLoading: true });
    try {
      const [watchlist, favorites] = await Promise.all([
        supabaseService.getWatchlist(user.id),
        supabaseService.getFavorites(user.id),
      ]);
      set({ watchlist, favorites, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  isInWatchlist: (tmdbId: number, mediaType: 'movie' | 'tv' = 'movie') => {
    return get().watchlist.some(
      (item) => item.tmdb_id === tmdbId && item.media_type === mediaType
    );
  },

  isFavorite: (tmdbId: number, mediaType: 'movie' | 'tv' = 'movie') => {
    return get().favorites.some(
      (item) => item.tmdb_id === tmdbId && item.media_type === mediaType
    );
  },

  toggleWatchlist: async (item) => {
    const user = useAuthStore.getState().user;
    if (!user) return false;

    const exists = get().isInWatchlist(item.tmdb_id, item.media_type);
    if (exists) {
      // Remove
      set({
        watchlist: get().watchlist.filter(
          (w) => !(w.tmdb_id === item.tmdb_id && w.media_type === item.media_type)
        ),
      });
      await supabaseService.removeFromWatchlist(user.id, item.tmdb_id, item.media_type);
      return false;
    } else {
      // Add
      const newItem: WatchlistItem = {
        ...item,
        id: `${user.id}_${item.media_type}_${item.tmdb_id}`,
        user_id: user.id,
        added_at: new Date().toISOString(),
      };
      set({ watchlist: [newItem, ...get().watchlist] });
      await supabaseService.addToWatchlist({
        user_id: user.id,
        tmdb_id: item.tmdb_id,
        media_type: item.media_type,
        title: item.title,
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        vote_average: item.vote_average,
        release_date: item.release_date,
      });
      return true;
    }
  },

  toggleFavorite: async (item) => {
    const user = useAuthStore.getState().user;
    if (!user) return false;

    const exists = get().isFavorite(item.tmdb_id, item.media_type);
    if (exists) {
      // Remove
      set({
        favorites: get().favorites.filter(
          (f) => !(f.tmdb_id === item.tmdb_id && f.media_type === item.media_type)
        ),
      });
      await supabaseService.removeFromFavorites(user.id, item.tmdb_id, item.media_type);
      return false;
    } else {
      // Add
      const newItem: FavoriteItem = {
        ...item,
        id: `${user.id}_${item.media_type}_${item.tmdb_id}`,
        user_id: user.id,
        added_at: new Date().toISOString(),
      };
      set({ favorites: [newItem, ...get().favorites] });
      await supabaseService.addToFavorites({
        user_id: user.id,
        tmdb_id: item.tmdb_id,
        media_type: item.media_type,
        title: item.title,
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        vote_average: item.vote_average,
        release_date: item.release_date,
      });
      return true;
    }
  },
}));

