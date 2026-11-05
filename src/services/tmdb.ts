import { TMDB_BASE_URL, TMDB_API_KEY } from '../utils/constants';
import {
  Movie,
  PaginatedResponse,
  CreditsResponse,
  VideosResponse,
  WatchProvidersResponse,
} from '../types/movie';
import { TVShow, TVSeasonDetail } from '../types/tv';

interface FetchOptions {
  params?: Record<string, string | number | boolean | undefined>;
}

async function fetchFromTMDB<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  url.searchParams.append('include_adult', 'false');

  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`TMDB API Error [${response.status}]: ${errorBody || response.statusText}`);
  }

  return response.json();
}

export const tmdb = {
  // 1. Trending
  getTrendingDay: (page = 1) =>
    fetchFromTMDB<PaginatedResponse<Movie>>('/trending/movie/day', { params: { page } }),

  getTrendingWeek: (page = 1) =>
    fetchFromTMDB<PaginatedResponse<Movie>>('/trending/movie/week', { params: { page } }),

  getTrendingAllDay: (page = 1) =>
    fetchFromTMDB<PaginatedResponse<Movie | TVShow>>('/trending/all/day', { params: { page } }),

  // 2. Movies
  getPopularMovies: (page = 1) =>
    fetchFromTMDB<PaginatedResponse<Movie>>('/movie/popular', { params: { page } }),

  getNowPlayingMovies: (page = 1) =>
    fetchFromTMDB<PaginatedResponse<Movie>>('/movie/now_playing', { params: { page } }),

  getUpcomingMovies: (page = 1) =>
    fetchFromTMDB<PaginatedResponse<Movie>>('/movie/upcoming', { params: { page } }),

  getTopRatedMovies: (page = 1) =>
    fetchFromTMDB<PaginatedResponse<Movie>>('/movie/top_rated', { params: { page } }),

  // 3. Indian & Regional Cinemas
  // Malayalam Movies
  getMalayalamMovies: (page = 1, sortBy = 'popularity.desc') =>
    fetchFromTMDB<PaginatedResponse<Movie>>('/discover/movie', {
      params: {
        page,
        with_original_language: 'ml',
        sort_by: sortBy,
        'vote_count.gte': 10,
      },
    }),

  // Popular Indian Movies (All Indian Languages)
  getIndianMovies: (page = 1) =>
    fetchFromTMDB<PaginatedResponse<Movie>>('/discover/movie', {
      params: {
        page,
        with_origin_country: 'IN',
        sort_by: 'popularity.desc',
        'vote_count.gte': 15,
      },
    }),

  // International Cinema (Non-English, curated acclaim)
  getInternationalMovies: (page = 1) =>
    fetchFromTMDB<PaginatedResponse<Movie>>('/discover/movie', {
      params: {
        page,
        without_original_language: 'en',
        sort_by: 'popularity.desc',
        'vote_count.gte': 100,
      },
    }),

  // 4. TV Series & Web Shows
  getPopularTV: (page = 1) =>
    fetchFromTMDB<PaginatedResponse<TVShow>>('/tv/popular', { params: { page } }),

  getAiringTodayTV: (page = 1) =>
    fetchFromTMDB<PaginatedResponse<TVShow>>('/tv/airing_today', { params: { page } }),

  getTopRatedTV: (page = 1) =>
    fetchFromTMDB<PaginatedResponse<TVShow>>('/tv/top_rated', { params: { page } }),

  // 5. Details
  getMovieDetails: (id: number | string) =>
    fetchFromTMDB<Movie>(`/movie/${id}`, {
      params: { append_to_response: 'credits,videos,similar,watch/providers' },
    }),

  getTVDetails: (id: number | string) =>
    fetchFromTMDB<TVShow>(`/tv/${id}`, {
      params: { append_to_response: 'credits,videos,similar,watch/providers' },
    }),

  getTVSeason: (tvId: number | string, seasonNumber: number) =>
    fetchFromTMDB<TVSeasonDetail>(`/tv/${tvId}/season/${seasonNumber}`),

  // 6. Credits, Videos, Similar & Providers
  getMovieCredits: (id: number | string) =>
    fetchFromTMDB<CreditsResponse>(`/movie/${id}/credits`),

  getTVCredits: (id: number | string) =>
    fetchFromTMDB<CreditsResponse>(`/tv/${id}/credits`),

  getMovieVideos: (id: number | string) =>
    fetchFromTMDB<VideosResponse>(`/movie/${id}/videos`),

  getTVVideos: (id: number | string) =>
    fetchFromTMDB<VideosResponse>(`/tv/${id}/videos`),

  getSimilarMovies: (id: number | string, page = 1) =>
    fetchFromTMDB<PaginatedResponse<Movie>>(`/movie/${id}/similar`, { params: { page } }),

  getSimilarTV: (id: number | string, page = 1) =>
    fetchFromTMDB<PaginatedResponse<TVShow>>(`/tv/${id}/similar`, { params: { page } }),

  getMovieWatchProviders: (id: number | string) =>
    fetchFromTMDB<WatchProvidersResponse>(`/movie/${id}/watch/providers`),

  getTVWatchProviders: (id: number | string) =>
    fetchFromTMDB<WatchProvidersResponse>(`/tv/${id}/watch/providers`),

  // 7. Search & Discovery Filters
  searchMulti: (query: string, page = 1) =>
    fetchFromTMDB<PaginatedResponse<Movie | TVShow>>('/search/multi', {
      params: { query, page },
    }),

  searchMovies: (query: string, page = 1, year?: number) =>
    fetchFromTMDB<PaginatedResponse<Movie>>('/search/movie', {
      params: { query, page, primary_release_year: year },
    }),

  searchTV: (query: string, page = 1, firstAirYear?: number) =>
    fetchFromTMDB<PaginatedResponse<TVShow>>('/search/tv', {
      params: { query, page, first_air_date_year: firstAirYear },
    }),

  discoverMovies: (params: {
    page?: number;
    genreId?: number;
    language?: string;
    year?: number;
    sortBy?: string;
  }) =>
    fetchFromTMDB<PaginatedResponse<Movie>>('/discover/movie', {
      params: {
        page: params.page || 1,
        with_genres: params.genreId,
        with_original_language: params.language,
        primary_release_year: params.year,
        sort_by: params.sortBy || 'popularity.desc',
      },
    }),
};

export default tmdb;

