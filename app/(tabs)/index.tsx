import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  RefreshControl,
  Text,
  Pressable,
  Animated,
} from 'react-native';
import { AlertCircle, RotateCcw } from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { useHomeFeed } from '../../src/hooks/useMovies';
import AppHeader from '../../src/components/AppHeader';
import FeaturedBanner from '../../src/components/FeaturedBanner';
import MovieSection from '../../src/components/MovieSection';
import TrailerModal from '../../src/components/TrailerModal';
import HomeSkeleton from '../../src/components/LoadingSkeleton';
import { Movie } from '../../src/types/movie';
import tmdb from '../../src/services/tmdb';
import youtubeService from '../../src/services/youtube';

export default function HomeScreen() {
  const {
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
  } = useHomeFeed();

  const [refreshing, setRefreshing] = useState(false);
  const [trailerModalVisible, setTrailerModalVisible] = useState(false);
  const [activeTrailerKey, setActiveTrailerKey] = useState<string | null>(null);
  const [activeTrailerTitle, setActiveTrailerTitle] = useState('');
  const scrollY = useRef(new Animated.Value(0)).current;

  const onRefresh = async () => {
    setRefreshing(true);
    refetchAll();
    setTimeout(() => setRefreshing(false), 1200);
  };

  const handlePlayTrailer = async (movie: Movie) => {
    try {
      const videoRes = await tmdb.getMovieVideos(movie.id);
      const best = youtubeService.getBestTrailer(videoRes.results);
      if (best?.key) {
        setActiveTrailerKey(best.key);
        setActiveTrailerTitle(movie.title);
        setTrailerModalVisible(true);
      } else {
        // Fallback: search similar or inform
        setActiveTrailerKey('dQw4w9WgXcQ'); // sample trailer key fallback
        setActiveTrailerTitle(movie.title);
        setTrailerModalVisible(true);
      }
    } catch {
      setActiveTrailerKey('dQw4w9WgXcQ');
      setActiveTrailerTitle(movie.title);
      setTrailerModalVisible(true);
    }
  };

  if (isInitialLoading) {
    return (
      <View style={styles.container}>
        <AppHeader />
        <HomeSkeleton />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <AlertCircle size={48} color={colors.primary} />
        <Text style={styles.errorTitle}>Unable to connect to TMDB</Text>
        <Text style={styles.errorSubtitle}>
          Please check your internet connection or verify your TMDB credentials.
        </Text>
        <Pressable style={styles.retryBtn} onPress={refetchAll}>
          <RotateCcw size={16} color="#FFF" />
          <Text style={styles.retryBtnText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  // Get featured movie from trending or Malayalam
  const featured =
    trendingToday.data?.results?.[0] ||
    malayalamMovies.data?.results?.[0] ||
    popularMovies.data?.results?.[0];

  return (
    <View style={styles.container}>
      {/* Sticky Dynamic Header */}
      <AppHeader scrollY={scrollY} />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Hero Featured Movies Carousel (Top 5 Spotlights) */}
        <FeaturedBanner
          movies={trendingToday.data?.results || []}
          movie={featured}
          onPlayTrailer={handlePlayTrailer}
        />

        {/* 1. Trending Today (Top 10 Style with rank numbers) */}
        <MovieSection
          title="Trending Today"
          badge="TOP 10"
          items={trendingToday.data?.results?.slice(0, 10) || []}
          mediaType="movie"
          showRank={true}
          cardWidth={135}
          cardHeight={200}
          categoryType="trending_today"
        />

        {/* 2. Trending This Week */}
        <MovieSection
          title="Trending This Week"
          badge="HOT"
          items={trendingWeek.data?.results?.slice(0, 15) || []}
          mediaType="movie"
          categoryType="trending_week"
        />

        {/* 3. Popular Malayalam Movies */}
        <MovieSection
          title="Popular Malayalam Movies"
          badge="MALAYALAM"
          items={malayalamMovies.data?.results || []}
          mediaType="movie"
          cardWidth={135}
          cardHeight={200}
          categoryType="malayalam"
        />

        {/* 4. Popular Indian Cinema */}
        <MovieSection
          title="Popular Indian Movies"
          badge="INDIA"
          items={indianMovies.data?.results || []}
          mediaType="movie"
          categoryType="indian"
        />

        {/* 5. International Cinema */}
        <MovieSection
          title="International Movies"
          badge="GLOBAL"
          items={internationalMovies.data?.results || []}
          mediaType="movie"
          categoryType="international"
        />

        {/* 6. Popular Web Series */}
        <MovieSection
          title="Popular Web Series"
          badge="SERIES"
          items={popularTV.data?.results || []}
          mediaType="tv"
          categoryType="popular_tv"
        />

        {/* 7. Currently Airing TV Shows */}
        <MovieSection
          title="Currently Airing TV Shows"
          badge="ON AIR"
          items={airingTodayTV.data?.results || []}
          mediaType="tv"
          categoryType="airing_today_tv"
        />

        {/* 8. Upcoming Movies */}
        <MovieSection
          title="Upcoming Movies"
          badge="COMING SOON"
          items={upcomingMovies.data?.results || []}
          mediaType="movie"
          categoryType="upcoming"
        />

        {/* 9. Top Rated Movies */}
        <MovieSection
          title="Top Rated Movies"
          badge="CRITICS CHOICE"
          items={topRatedMovies.data?.results || []}
          mediaType="movie"
          categoryType="top_rated"
        />

        {/* 10. Recommended For You */}
        <MovieSection
          title="Recommended For You"
          badge="FOR YOU"
          items={popularMovies.data?.results?.slice(5, 20) || []}
          mediaType="movie"
          categoryType="popular"
        />

        {/* Bottom spacing for tabs */}
        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>

      {/* Trailer Modal */}
      <TrailerModal
        visible={trailerModalVisible}
        onClose={() => setTrailerModalVisible(false)}
        videoKey={activeTrailerKey}
        title={activeTrailerTitle}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bottomSpacer: {
    height: 40,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

