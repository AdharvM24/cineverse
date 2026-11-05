import { useQuery } from '@tanstack/react-query';
import { tmdb } from '../services/tmdb';

export const useTrending = () => {
  const trendingToday = useQuery({
    queryKey: ['trending', 'today'],
    queryFn: () => tmdb.getTrendingDay(),
    staleTime: 1000 * 60 * 15, // 15 mins
  });

  const trendingWeek = useQuery({
    queryKey: ['trending', 'week'],
    queryFn: () => tmdb.getTrendingWeek(),
    staleTime: 1000 * 60 * 30, // 30 mins
  });

  return {
    trendingToday,
    trendingWeek,
  };
};

export default useTrending;

