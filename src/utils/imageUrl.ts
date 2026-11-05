const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/';

export type BackdropSize = 'w300' | 'w780' | 'w1280' | 'original';
export type PosterSize = 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original';
export type ProfileSize = 'w45' | 'w185' | 'h632' | 'original';

export const getPosterUrl = (path: string | null | undefined, size: PosterSize = 'w500'): string => {
  if (!path) {
    return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60';
  }
  return `${TMDB_IMAGE_BASE}${size}${path}`;
};

export const getBackdropUrl = (path: string | null | undefined, size: BackdropSize = 'w1280'): string => {
  if (!path) {
    return 'https://images.unsplash.com/photo-1518676599649-7c77c68b649b?w=1280&auto=format&fit=crop&q=80';
  }
  return `${TMDB_IMAGE_BASE}${size}${path}`;
};

export const getProfileUrl = (path: string | null | undefined, size: ProfileSize = 'w185'): string => {
  if (!path) {
    return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=60';
  }
  return `${TMDB_IMAGE_BASE}${size}${path}`;
};

export const getProviderLogoUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  return `${TMDB_IMAGE_BASE}w154${path}`;
};

