import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import MovieCard from '../../src/components/MovieCard';
import tmdb from '../../src/services/tmdb';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_WIDTH = (SCREEN_WIDTH - 16 * 2 - 12 * 2) / 3;

export default function CategoryScreen() {
  const insets = useSafeAreaInsets();
  const { type, title, mediaType } = useLocalSearchParams<{
    type: string;
    title: string;
    mediaType?: 'movie' | 'tv';
  }>();

  const [page, setPage] = useState(1);
  const [accumulatedItems, setAccumulatedItems] = useState<any[]>([]);

  const fetchCategoryData = async (pageToFetch: number) => {
    switch (type) {
      case 'trending_today':
        return tmdb.getTrendingDay(pageToFetch);
      case 'trending_week':
        return tmdb.getTrendingWeek(pageToFetch);
      case 'malayalam':
        return tmdb.getMalayalamMovies(pageToFetch);
      case 'indian':
        return tmdb.getIndianMovies(pageToFetch);
      case 'international':
        return tmdb.getInternationalMovies(pageToFetch);
      case 'popular_tv':
        return tmdb.getPopularTV(pageToFetch);
      case 'airing_today_tv':
        return tmdb.getAiringTodayTV(pageToFetch);
      case 'upcoming':
        return tmdb.getUpcomingMovies(pageToFetch);
      case 'top_rated':
        return tmdb.getTopRatedMovies(pageToFetch);
      case 'popular':
      default:
        return tmdb.getPopularMovies(pageToFetch);
    }
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['category', type, page],
    queryFn: async () => {
      const res = await fetchCategoryData(page);
      if (page === 1) {
        setAccumulatedItems(res.results || []);
      } else {
        setAccumulatedItems((prev) => [...prev, ...(res.results || [])]);
      }
      return res;
    },
  });

  const handleLoadMore = () => {
    if (!isFetching && data && page < (data.total_pages || 1)) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.btnPressed]}
          onPress={() => router.back()}
          hitSlop={8}
        >
          <ArrowLeft size={20} color="#FFF" />
        </Pressable>
        <Text style={[styles.title, typography.sectionTitle]} numberOfLines={1}>
          {title || 'Explore'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Grid */}
      {isLoading && page === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading titles...</Text>
        </View>
      ) : (
        <FlatList
          data={accumulatedItems}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          numColumns={3}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetching ? (
              <ActivityIndicator
                size="small"
                color={colors.primary}
                style={{ marginVertical: 20 }}
              />
            ) : undefined
          }
          renderItem={({ item }) => (
            <View style={styles.gridItem}>
              <MovieCard
                item={item}
                mediaType={mediaType}
                width={COLUMN_WIDTH}
                height={COLUMN_WIDTH * 1.5}
                showTitle={true}
              />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  placeholder: {
    width: 36,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  gridContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40,
  },
  gridItem: {
    marginRight: 12,
    marginBottom: 16,
  },
  btnPressed: {
    opacity: 0.7,
  },
});
