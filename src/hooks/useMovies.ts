import { useQuery } from '@tanstack/react-query';
import { tmdb } from '../services/tmdb';

export const useHomeFeed = () => {
  const trendingToday = useQuery({
    queryKey: ['trending', 'day'],
    queryFn: () => tmdb.getTrendingDay(),
    staleTime: 1000 * 60 * 15,
  });

  const trendingWeek = useQuery({
    queryKey: ['trending', 'week'],
    queryFn: () => tmdb.getTrendingWeek(),
    staleTime: 1000 * 60 * 30,
  });

  const malayalamMovies = useQuery({
    queryKey: ['movies', 'malayalam'],
    queryFn: () => tmdb.getMalayalamMovies(),
    staleTime: 1000 * 60 * 30,
  });

  const indianMovies = useQuery({
    queryKey: ['movies', 'indian'],
    queryFn: () => tmdb.getIndianMovies(),
    staleTime: 1000 * 60 * 30,
  });

  const internationalMovies = useQuery({
    queryKey: ['movies', 'international'],
    queryFn: () => tmdb.getInternationalMovies(),
    staleTime: 1000 * 60 * 30,
  });

  const popularTV = useQuery({
    queryKey: ['tv', 'popular'],
    queryFn: () => tmdb.getPopularTV(),
    staleTime: 1000 * 60 * 30,
  });

  const airingTodayTV = useQuery({
    queryKey: ['tv', 'airingToday'],
    queryFn: () => tmdb.getAiringTodayTV(),
    staleTime: 1000 * 60 * 30,
  });

  const upcomingMovies = useQuery({
    queryKey: ['movies', 'upcoming'],
    queryFn: () => tmdb.getUpcomingMovies(),
    staleTime: 1000 * 60 * 30,
  });

  const topRatedMovies = useQuery({
    queryKey: ['movies', 'topRated'],
    queryFn: () => tmdb.getTopRatedMovies(),
    staleTime: 1000 * 60 * 60,
  });

  const popularMovies = useQuery({
    queryKey: ['movies', 'popular'],
    queryFn: () => tmdb.getPopularMovies(),
    staleTime: 1000 * 60 * 30,
  });

  const isInitialLoading =
    trendingToday.isLoading ||
    malayalamMovies.isLoading ||
    indianMovies.isLoading;

  const isError =
    trendingToday.isError &&
    malayalamMovies.isError &&
    indianMovies.isError;

  const refetchAll = () => {
    trendingToday.refetch();
    trendingWeek.refetch();
    malayalamMovies.refetch();
    indianMovies.refetch();
    internationalMovies.refetch();
    popularTV.refetch();
    airingTodayTV.refetch();
    upcomingMovies.refetch();
    topRatedMovies.refetch();
    popularMovies.refetch();
  };

  return {
    trendingToday,
    trendingWeek,
    malayalamMovies,
    indianMovies,
    internationalMovies,
    popularTV,
    airingTodayTV,
    upcomingMovies,
    topRatedMovies,
    popularMovies,
    isInitialLoading,
    isError,
    refetchAll,
  };
};

export const useMovieDetails = (id: string | number) => {
  return useQuery({
    queryKey: ['movie', 'details', id],
    queryFn: () => tmdb.getMovieDetails(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 30,
  });
};

export const useTVDetails = (id: string | number) => {
  return useQuery({
    queryKey: ['tv', 'details', id],
    queryFn: () => tmdb.getTVDetails(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 30,
  });
};

export const useTVSeason = (tvId: string | number, seasonNumber: number) => {
  return useQuery({
    queryKey: ['tv', 'season', tvId, seasonNumber],
    queryFn: () => tmdb.getTVSeason(tvId, seasonNumber),
    enabled: Boolean(tvId && seasonNumber !== undefined),
    staleTime: 1000 * 60 * 60,
  });
};

