import { Genre, ProductionCompany, ProductionCountry, SpokenLanguage, MediaType } from './movie';

export interface TVSeason {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episode_count: number;
  air_date: string | null;
  vote_average?: number;
}

export interface TVEpisode {
  id: number;
  name: string;
  overview: string;
  air_date: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
  runtime: number | null;
}

export interface TVNetwork {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface TVShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  last_air_date?: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  original_language: string;
  genre_ids?: number[];
  genres?: Genre[];
  adult: boolean;
  tagline?: string;
  status?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
  seasons?: TVSeason[];
  networks?: TVNetwork[];
  production_companies?: ProductionCompany[];
  production_countries?: ProductionCountry[];
  spoken_languages?: SpokenLanguage[];
  media_type?: MediaType;
}

export interface TVSeasonDetail extends TVSeason {
  _id: string;
  episodes: TVEpisode[];
}

