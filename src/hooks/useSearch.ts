import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tmdb } from '../services/tmdb';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export interface SearchFilters {
  mediaType: 'all' | 'movie' | 'tv';
  genreId?: number;
  language?: string;
  year?: number;
}

export const useSearch = (query: string, filters: SearchFilters) => {
  const debouncedQuery = useDebounce(query.trim(), 400);

  const searchResults = useQuery({
    queryKey: ['search', debouncedQuery, filters],
    queryFn: async () => {
      if (!debouncedQuery) {
        // When query is empty and user has chosen genre/language/year, use discover
        if (filters.genreId || filters.language || filters.year) {
          return tmdb.discoverMovies({
            genreId: filters.genreId,
            language: filters.language,
            year: filters.year,
          });
        }
        return { page: 1, results: [], total_pages: 0, total_results: 0 };
      }

      if (filters.mediaType === 'movie') {
        return tmdb.searchMovies(debouncedQuery, 1, filters.year);
      }
      if (filters.mediaType === 'tv') {
        return tmdb.searchTV(debouncedQuery, 1, filters.year);
      }
      return tmdb.searchMulti(debouncedQuery, 1);
    },
    enabled: Boolean(debouncedQuery || filters.genreId || filters.language || filters.year),
    staleTime: 1000 * 60 * 5,
  });

  return {
    debouncedQuery,
    searchResults,
  };
};

export default useSearch;

