import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Plus, Check, Info } from 'lucide-react-native';
import { router } from 'expo-router';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { getBackdropUrl } from '../utils/imageUrl';
import { formatYear } from '../utils/formatters';
import { GENRE_MAP } from '../utils/constants';
import RatingBadge from './RatingBadge';
import { Movie } from '../types/movie';
import { useWatchlistStore } from '../store/watchlistStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_HEIGHT = 490;

interface FeaturedBannerProps {
  movies?: Movie[];
  movie?: Movie;
  onPlayTrailer?: (movie: Movie) => void;
}

export const FeaturedBanner: React.FC<FeaturedBannerProps> = ({
  movies = [],
  movie,
  onPlayTrailer,
}) => {
  const { isInWatchlist, toggleWatchlist } = useWatchlistStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Fallback to single movie if array is empty
  const bannerMovies = movies.length > 0 ? movies.slice(0, 5) : movie ? [movie] : [];

  // Auto advance banner every 6 seconds
  useEffect(() => {
    if (bannerMovies.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % bannerMovies.length;
        flatListRef.current?.scrollToOffset({
          offset: next * SCREEN_WIDTH,
          animated: true,
        });
        return next;
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [bannerMovies.length]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index !== activeIndex && index >= 0 && index < bannerMovies.length) {
      setActiveIndex(index);
    }
  };

  if (bannerMovies.length === 0) return null;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={bannerMovies}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScroll}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => {
          const inWatchlist = isInWatchlist(item.id, 'movie');
          const genres = (item.genre_ids || [])
            .slice(0, 3)
            .map((id: number) => GENRE_MAP[id])
            .filter(Boolean);

          const backdropUri = getBackdropUrl(item.backdrop_path || item.poster_path, 'w1280');

          return (
            <View style={styles.slide}>
              {/* Cinematic Backdrop Image */}
              <Image
                source={{ uri: backdropUri }}
                style={styles.backdrop}
                contentFit="cover"
                transition={300}
                cachePolicy="memory-disk"
              />

              {/* Top Vignette Gradient */}
              <LinearGradient
                colors={['rgba(9, 9, 11, 0.85)', 'rgba(9, 9, 11, 0.25)', 'transparent']}
                style={styles.topVignette}
              />

              {/* Bottom Deep Gradient Fade */}
              <LinearGradient
                colors={[
                  'transparent',
                  'rgba(9, 9, 11, 0.4)',
                  'rgba(9, 9, 11, 0.88)',
                  colors.background,
                ]}
                style={styles.bottomGradient}
              />

              {/* Content Overlay */}
              <View style={styles.content}>
                {/* Badges Row */}
                <View style={styles.badgeRow}>
                  <View style={styles.featuredBadge}>
                    <Text style={styles.featuredBadgeText}>TOP SPOTLIGHT</Text>
                  </View>
                  <RatingBadge rating={item.vote_average} size="md" />
                  <Text style={styles.yearText}>{formatYear(item.release_date)}</Text>
                  {item.original_language && (
                    <View style={styles.langBadge}>
                      <Text style={styles.langBadgeText}>
                        {item.original_language.toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Movie Title */}
                <Text style={[styles.title, typography.heroTitle]} numberOfLines={2}>
                  {item.title}
                </Text>

                {/* Genres */}
                {genres.length > 0 && (
                  <View style={styles.genresRow}>
                    {genres.map((genre: string, idx: number) => (
                      <React.Fragment key={genre}>
                        <Text style={styles.genreText}>{genre}</Text>
                        {idx < genres.length - 1 && <Text style={styles.bullet}>•</Text>}
                      </React.Fragment>
                    ))}
                  </View>
                )}

                {/* Overview */}
                <Text style={[styles.overview, typography.body]} numberOfLines={2}>
                  {item.overview}
                </Text>

                {/* Action Buttons Row */}
                <View style={styles.actionRow}>
                  {/* Play Trailer Button */}
                  <Pressable
                    style={({ pressed }) => [
                      styles.primaryBtn,
                      pressed && styles.btnPressed,
                    ]}
                    onPress={() => {
                      if (onPlayTrailer) {
                        onPlayTrailer(item);
                      } else {
                        router.push(`/movie/${item.id}` as any);
                      }
                    }}
                  >
                    <Play size={18} color="#000" fill="#000" />
                    <Text style={styles.primaryBtnText}>Trailer</Text>
                  </Pressable>

                  {/* Watchlist Toggle */}
                  <Pressable
                    style={({ pressed }) => [
                      styles.secondaryBtn,
                      inWatchlist && styles.secondaryBtnActive,
                      pressed && styles.btnPressed,
                    ]}
                    onPress={() => {
                      toggleWatchlist({
                        tmdb_id: item.id,
                        media_type: 'movie',
                        title: item.title,
                        poster_path: item.poster_path,
                        backdrop_path: item.backdrop_path,
                        vote_average: item.vote_average,
                        release_date: item.release_date,
                      });
                    }}
                  >
                    {inWatchlist ? (
                      <Check size={18} color={colors.primary} />
                    ) : (
                      <Plus size={18} color="#FFF" />
                    )}
                    <Text
                      style={[
                        styles.secondaryBtnText,
                        inWatchlist && styles.secondaryBtnTextActive,
                      ]}
                    >
                      {inWatchlist ? 'In List' : 'Watchlist'}
                    </Text>
                  </Pressable>

                  {/* Details Button */}
                  <Pressable
                    style={({ pressed }) => [
                      styles.iconBtn,
                      pressed && styles.btnPressed,
                    ]}
                    onPress={() => router.push(`/movie/${item.id}` as any)}
                  >
                    <Info size={18} color="#FFF" />
                    <Text style={styles.iconBtnText}>Info</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          );
        }}
      />

      {/* Hero Carousel Dots Indicator */}
      {bannerMovies.length > 1 && (
        <View style={styles.paginationRow}>
          {bannerMovies.map((_, idx) => (
            <Pressable
              key={idx}
              onPress={() => {
                flatListRef.current?.scrollToOffset({
                  offset: idx * SCREEN_WIDTH,
                  animated: true,
                });
                setActiveIndex(idx);
              }}
              hitSlop={8}
            >
              <View
                style={[
                  styles.paginationDot,
                  activeIndex === idx && styles.paginationDotActive,
                ]}
              />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: BANNER_HEIGHT,
    position: 'relative',
    backgroundColor: colors.background,
  },
  slide: {
    width: SCREEN_WIDTH,
    height: BANNER_HEIGHT,
    position: 'relative',
  },
  backdrop: {
    width: '100%',
    height: '100%',
  },
  topVignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
  },
  bottomGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 290,
  },
  content: {
    position: 'absolute',
    bottom: 22,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  featuredBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  featuredBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  yearText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  langBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  langBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  title: {
    color: colors.text,
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.85)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  genresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  genreText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  bullet: {
    color: colors.textMuted,
    marginHorizontal: 6,
    fontSize: 12,
  },
  overview: {
    color: 'rgba(255, 255, 255, 0.82)',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  primaryBtnText: {
    color: '#000000',
    fontWeight: '800',
    fontSize: 14,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    gap: 6,
  },
  secondaryBtnActive: {
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    borderColor: colors.primary,
  },
  secondaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryBtnTextActive: {
    color: colors.primary,
  },
  iconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    gap: 5,
  },
  iconBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  paginationRow: {
    position: 'absolute',
    bottom: 6,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  paginationDotActive: {
    width: 18,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  btnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});

export default FeaturedBanner;
