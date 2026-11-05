export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Default TMDB API Key (Can be overridden via EXPO_PUBLIC_TMDB_API_KEY environment variable)
export const TMDB_API_KEY =
  process.env.EXPO_PUBLIC_TMDB_API_KEY || '4f5308f8580aeaff9ae77af41b806d68';

export const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  'https://ybzjiyduznqdjggzqzbe.supabase.co';

export const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_RdSaCcs-FgeGLVGcJR74zg_-7bnRWeQ';

export const GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
};

export const LANGUAGE_NAMES: Record<string, string> = {
  ml: 'Malayalam',
  hi: 'Hindi',
  ta: 'Tamil',
  te: 'Telugu',
  kn: 'Kannada',
  en: 'English',
  ko: 'Korean',
  ja: 'Japanese',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
};

export const POPULAR_SEARCH_TERMS = [
  'Aavesham',
  'Manjummel Boys',
  'Premalu',
  'Bramayugam',
  'Kalki 2898 AD',
  'Stranger Things',
  'Interstellar',
  'Oppenheimer',
  'Breaking Bad',
  'Dark',
];
