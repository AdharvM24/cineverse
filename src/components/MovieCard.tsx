import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { getPosterUrl } from '../utils/imageUrl';
import { formatYear } from '../utils/formatters';
import RatingBadge from './RatingBadge';
import { Movie } from '../types/movie';
import { TVShow } from '../types/tv';

interface MovieCardProps {
  item: Movie | TVShow;
  mediaType?: 'movie' | 'tv';
  width?: number;
  height?: number;
  showTitle?: boolean;
  rank?: number;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  item,
  mediaType,
  width = 125,
  height = 185,
  showTitle = true,
  rank,
}) => {
  const isTV =
    mediaType === 'tv' ||
    ('name' in item && Boolean((item as TVShow).first_air_date));

  const resolvedMediaType = isTV ? 'tv' : 'movie';
  const title = isTV ? (item as TVShow).name : (item as Movie).title;
  const releaseDate = isTV
    ? (item as TVShow).first_air_date
    : (item as Movie).release_date;

  const handlePress = () => {
    if (resolvedMediaType === 'tv') {
      router.push(`/tv/${item.id}` as any);
    } else {
      router.push(`/movie/${item.id}` as any);
    }
  };

  const posterUri = getPosterUrl(item.poster_path, 'w342');

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { width },
        pressed && styles.pressed,
      ]}
      onPress={handlePress}
    >
      <View style={[styles.posterWrapper, { height }]}>
        <Image
          source={{ uri: posterUri }}
          style={styles.poster}
          contentFit="cover"
          transition={250}
          cachePolicy="memory-disk"
        />

        {/* Rating Badge */}
        {item.vote_average !== undefined && item.vote_average > 0 && (
          <View style={styles.ratingContainer}>
            <RatingBadge rating={item.vote_average} size="sm" />
          </View>
        )}

        {/* Media Type Tag (TV / Movie) */}
        {isTV && (
          <View style={styles.tvBadge}>
            <Text style={styles.tvBadgeText}>SERIES</Text>
          </View>
        )}

        {/* Rank Number for Top 10 (Netflix style) */}
        {rank !== undefined && (
          <View style={styles.rankContainer}>
            <Text style={styles.rankNumber}>{rank}</Text>
          </View>
        )}
      </View>

      {showTitle && (
        <View style={styles.infoContainer}>
          <Text style={[styles.title, typography.cardTitle]} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.year}>{formatYear(releaseDate)}</Text>
            {item.original_language && (
              <Text style={styles.langBadge}>
                {item.original_language.toUpperCase()}
              </Text>
            )}
          </View>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 12,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.95 }],
  },
  posterWrapper: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: colors.card,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  ratingContainer: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  tvBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tvBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  rankContainer: {
    position: 'absolute',
    bottom: -10,
    left: 4,
  },
  rankNumber: {
    fontSize: 54,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.9)',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
  },
  infoContainer: {
    marginTop: 6,
    paddingHorizontal: 2,
  },
  title: {
    color: colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  year: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  langBadge: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
});

export default MovieCard;

