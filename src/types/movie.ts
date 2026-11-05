export type MediaType = 'movie' | 'tv' | 'person';

export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface Movie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  original_language: string;
  genre_ids?: number[];
  genres?: Genre[];
  adult: boolean;
  video: boolean;
  runtime?: number;
  tagline?: string;
  status?: string;
  budget?: number;
  revenue?: number;
  production_companies?: ProductionCompany[];
  production_countries?: ProductionCountry[];
  spoken_languages?: SpokenLanguage[];
  media_type?: MediaType;
}

export interface CastMember {
  id: number;
  cast_id?: number;
  credit_id: string;
  name: string;
  original_name: string;
  character: string;
  profile_path: string | null;
  order: number;
  known_for_department?: string;
}

export interface CrewMember {
  id: number;
  credit_id: string;
  name: string;
  original_name: string;
  department: string;
  job: string;
  profile_path: string | null;
}

export interface CreditsResponse {
  id: number;
  cast: CastMember[];
  crew: CrewMember[];
}

export interface VideoItem {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  key: string;
  name: string;
  site: string; // "YouTube"
  size: number;
  type: string; // "Trailer", "Teaser", "Featurette"
  official: boolean;
  published_at: string;
}

export interface VideosResponse {
  id: number;
  results: VideoItem[];
}

export interface WatchProvider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

export interface CountryProviders {
  link?: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
  free?: WatchProvider[];
  ads?: WatchProvider[];
}

export interface WatchProvidersResponse {
  id: number;
  results: Record<string, CountryProviders>;
}

export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

