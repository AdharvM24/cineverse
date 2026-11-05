export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  favorite_genre?: string | null;
  preferred_language?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WatchlistItem {
  id: string;
  user_id: string;
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string;
  added_at: string;
}

export interface FavoriteItem {
  id: string;
  user_id: string;
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string;
  added_at: string;
}

export interface WatchHistoryItem {
  id: string;
  user_id: string;
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  last_watched_at: string;
  progress_seconds?: number;
}

