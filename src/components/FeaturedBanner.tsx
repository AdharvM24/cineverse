import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
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
const BANNER_HEIGHT = 480;

interface FeaturedBannerProps {
  movie: Movie;
  onPlayTrailer?: (movie: Movie) => void;
}

export const FeaturedBanner: React.FC<FeaturedBannerProps> = ({
  movie,
  onPlayTrailer,
}) => {
  const { isInWatchlist, toggleWatchlist } = useWatchlistStore();
  const inWatchlist = isInWatchlist(movie.id, 'movie');

  const genres = (movie.genre_ids || [])
    .slice(0, 3)
    .map((id) => GENRE_MAP[id])
    .filter(Boolean);

  const handleToggleWatchlist = () => {
    toggleWatchlist({
      tmdb_id: movie.id,
      media_type: 'movie',
      title: movie.title,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      vote_average: movie.vote_average,
      release_date: movie.release_date,
    });
  };

  const handleViewDetails = () => {
    router.push(`/movie/${movie.id}` as any);
  };

  const backdropUri = getBackdropUrl(movie.backdrop_path || movie.poster_path, 'w1280');

  return (
    <View style={styles.container}>
      {/* Cinematic Backdrop Image */}
      <Image
        source={{ uri: backdropUri }}
        style={styles.backdrop}
        contentFit="cover"
        transition={300}
        cachePolicy="memory-disk"
      />

      {/* Top subtle vignette */}
      <LinearGradient
        colors={['rgba(9, 9, 11, 0.8)', 'rgba(9, 9, 11, 0.2)', 'transparent']}
        style={styles.topVignette}
      />

      {/* Bottom deep gradient fade to page background */}
      <LinearGradient
        colors={[
          'transparent',
          'rgba(9, 9, 11, 0.4)',
          'rgba(9, 9, 11, 0.85)',
          colors.background,
        ]}
        style={styles.bottomGradient}
      />

      {/* Content Overlay */}
      <View style={styles.content}>
        {/* Badges Row */}
        <View style={styles.badgeRow}>
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>FEATURED TODAY</Text>
          </View>
          <RatingBadge rating={movie.vote_average} size="md" />
          <Text style={styles.yearText}>{formatYear(movie.release_date)}</Text>
        </View>

        {/* Title */}
        <Text style={[styles.title, typography.heroTitle]} numberOfLines={2}>
          {movie.title}
        </Text>

        {/* Genres */}
        {genres.length > 0 && (
          <View style={styles.genresRow}>
            {genres.map((genre, idx) => (
              <React.Fragment key={genre}>
                <Text style={styles.genreText}>{genre}</Text>
                {idx < genres.length - 1 && <Text style={styles.bullet}>•</Text>}
              </React.Fragment>
            ))}
          </View>
        )}

        {/* Short Description */}
        <Text style={[styles.overview, typography.body]} numberOfLines={3}>
          {movie.overview}
        </Text>

        {/* Action Buttons Row */}
        <View style={styles.actionRow}>
          {/* Play / Trailer Button */}
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              pressed && styles.btnPressed,
            ]}
            onPress={() => {
              if (onPlayTrailer) {
                onPlayTrailer(movie);
              } else {
                handleViewDetails();
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
            onPress={handleToggleWatchlist}
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
            onPress={handleViewDetails}
          >
            <Info size={18} color="#FFF" />
            <Text style={styles.iconBtnText}>Info</Text>
          </Pressable>
        </View>
      </View>
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
  backdrop: {
    width: '100%',
    height: '100%',
  },
  topVignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  bottomGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 280,
  },
  content: {
    position: 'absolute',
    bottom: 12,
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
  title: {
    color: colors.text,
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  genresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 8,
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
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
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
    borderRadius: 6,
    gap: 6,
  },
  primaryBtnText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 10,
    borderRadius: 6,
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
    fontWeight: '600',
    fontSize: 14,
  },
  secondaryBtnTextActive: {
    color: colors.primary,
  },
  iconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    gap: 5,
  },
  iconBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  btnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});

export default FeaturedBanner;

