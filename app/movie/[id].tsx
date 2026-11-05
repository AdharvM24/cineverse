import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Play,
  Plus,
  Check,
  Heart,
  Tv,
  Star,
  Clock,
  Calendar,
  Share2,
} from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { useMovieDetails } from '../../src/hooks/useMovies';
import { useWatchlistStore } from '../../src/store/watchlistStore';
import {
  getBackdropUrl,
  getPosterUrl,
  getProfileUrl,
} from '../../src/utils/imageUrl';
import {
  formatRuntime,
  formatYear,
  formatDate,
  formatRating,
  formatVoteCount,
} from '../../src/utils/formatters';
import MovieCard from '../../src/components/MovieCard';
import TrailerModal from '../../src/components/TrailerModal';
import WatchProvidersModal from '../../src/components/WatchProvidersModal';
import youtubeService from '../../src/services/youtube';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MovieDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: movie, isLoading, isError } = useMovieDetails(id);

  const { isInWatchlist, toggleWatchlist, isFavorite, toggleFavorite } =
    useWatchlistStore();

  const [trailerModalVisible, setTrailerModalVisible] = useState(false);
  const [providersModalVisible, setProvidersModalVisible] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading Movie Details...</Text>
      </View>
    );
  }

  if (isError || !movie) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Could not load movie information.</Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={18} color="#FFF" />
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const inWatchlist = isInWatchlist(movie.id, 'movie');
  const favorite = isFavorite(movie.id, 'movie');

  // Video trailer resolution
  const videos = (movie as any).videos?.results || [];
  const trailer = youtubeService.getBestTrailer(videos);

  // Watch providers
  const watchProviders = (movie as any)['watch/providers'];

  // Cast members
  const cast = (movie as any).credits?.cast?.slice(0, 15) || [];

  // Similar movies
  const similarMovies = (movie as any).similar?.results?.slice(0, 10) || [];

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

  const handleToggleFavorite = () => {
    toggleFavorite({
      tmdb_id: movie.id,
      media_type: 'movie',
      title: movie.title,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      vote_average: movie.vote_average,
      release_date: movie.release_date,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cinematic Backdrop Header */}
        <View style={styles.backdropContainer}>
          <Image
            source={{ uri: getBackdropUrl(movie.backdrop_path || movie.poster_path) }}
            style={styles.backdropImage}
            contentFit="cover"
          />

          <LinearGradient
            colors={['rgba(9, 9, 11, 0.7)', 'transparent']}
            style={styles.topGradient}
          />
          <LinearGradient
            colors={['transparent', 'rgba(9, 9, 11, 0.8)', colors.background]}
            style={styles.bottomGradient}
          />

          {/* Navigation Bar Over Backdrop */}
          <View style={styles.navBar}>
            <Pressable
              style={({ pressed }) => [styles.navCircleBtn, pressed && styles.btnPressed]}
              onPress={() => router.back()}
              hitSlop={8}
            >
              <ArrowLeft size={20} color="#FFF" />
            </Pressable>

            <View style={styles.navRight}>
              <Pressable
                style={({ pressed }) => [
                  styles.navCircleBtn,
                  favorite && styles.navCircleBtnActive,
                  pressed && styles.btnPressed,
                ]}
                onPress={handleToggleFavorite}
                hitSlop={8}
              >
                <Heart
                  size={20}
                  color={favorite ? colors.primary : '#FFF'}
                  fill={favorite ? colors.primary : 'transparent'}
                />
              </Pressable>
            </View>
          </View>

          {/* Floating Poster & Essential Info */}
          <View style={styles.heroPosterRow}>
            <Image
              source={{ uri: getPosterUrl(movie.poster_path) }}
              style={styles.poster}
              contentFit="cover"
            />
            <View style={styles.heroInfo}>
              <Text style={[styles.title, typography.heroTitle]}>{movie.title}</Text>
              {movie.tagline ? (
                <Text style={styles.tagline}>"{movie.tagline}"</Text>
              ) : null}

              <View style={styles.metaRow}>
                <View style={styles.metaBadge}>
                  <Calendar size={12} color={colors.textSecondary} />
                  <Text style={styles.metaText}>{formatYear(movie.release_date)}</Text>
                </View>

                {Boolean(movie.runtime) && (
                  <View style={styles.metaBadge}>
                    <Clock size={12} color={colors.textSecondary} />
                    <Text style={styles.metaText}>{formatRuntime(movie.runtime)}</Text>
                  </View>
                )}

                {movie.original_language && (
                  <View style={styles.metaBadge}>
                    <Text style={styles.metaText}>
                      {movie.original_language.toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>

              {/* TMDB IMDb-Style Gold Rating */}
              <View style={styles.ratingRow}>
                <View style={styles.ratingPill}>
                  <Star size={16} color="#EAB308" fill="#EAB308" />
                  <Text style={styles.ratingValue}>
                    {formatRating(movie.vote_average)}
                  </Text>
                  <Text style={styles.ratingMax}>/10</Text>
                </View>
                <Text style={styles.voteCountText}>
                  ({formatVoteCount(movie.vote_count)} votes)
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {/* Play Trailer Button */}
          <Pressable
            style={({ pressed }) => [
              styles.primaryPlayBtn,
              pressed && styles.btnPressed,
            ]}
            onPress={() => setTrailerModalVisible(true)}
          >
            <Play size={18} color="#000" fill="#000" />
            <Text style={styles.primaryPlayBtnText}>
              {trailer ? 'Watch Official Trailer' : 'Watch Trailer'}
            </Text>
          </Pressable>

          {/* Secondary Actions Row */}
          <View style={styles.secondaryActionsRow}>
            {/* Watchlist */}
            <Pressable
              style={({ pressed }) => [
                styles.actionItemBtn,
                inWatchlist && styles.actionItemBtnActive,
                pressed && styles.btnPressed,
              ]}
              onPress={handleToggleWatchlist}
            >
              {inWatchlist ? (
                <Check size={20} color={colors.primary} />
              ) : (
                <Plus size={20} color="#FFF" />
              )}
              <Text
                style={[
                  styles.actionItemText,
                  inWatchlist && styles.actionItemTextActive,
                ]}
              >
                {inWatchlist ? 'In Watchlist' : 'Watchlist'}
              </Text>
            </Pressable>

            {/* Where to Watch */}
            <Pressable
              style={({ pressed }) => [
                styles.actionItemBtn,
                pressed && styles.btnPressed,
              ]}
              onPress={() => setProvidersModalVisible(true)}
            >
              <Tv size={20} color="#FFF" />
              <Text style={styles.actionItemText}>Where to Watch</Text>
            </Pressable>

            {/* Favorite */}
            <Pressable
              style={({ pressed }) => [
                styles.actionItemBtn,
                favorite && styles.actionItemBtnActive,
                pressed && styles.btnPressed,
              ]}
              onPress={handleToggleFavorite}
            >
              <Heart
                size={20}
                color={favorite ? colors.primary : '#FFF'}
                fill={favorite ? colors.primary : 'transparent'}
              />
              <Text
                style={[
                  styles.actionItemText,
                  favorite && styles.actionItemTextActive,
                ]}
              >
                {favorite ? 'Favorited' : 'Favorite'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Genres Pill List */}
        {Boolean(movie.genres?.length) && (
          <View style={styles.genreList}>
            {movie.genres!.map((genre) => (
              <View key={genre.id} style={styles.genrePill}>
                <Text style={styles.genrePillText}>{genre.name}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Overview Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Storyline</Text>
          <Text style={styles.overviewText}>
            {movie.overview || 'No synopsis available for this title.'}
          </Text>
        </View>

        {/* Release & Technical Details */}
        <View style={styles.specsCard}>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>Release Date</Text>
            <Text style={styles.specValue}>{formatDate(movie.release_date)}</Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>Status</Text>
            <Text style={styles.specValue}>{movie.status || 'Released'}</Text>
          </View>
          {Boolean(movie.spoken_languages?.length) && (
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Spoken Languages</Text>
              <Text style={styles.specValue}>
                {movie.spoken_languages!.map((l) => l.english_name).join(', ')}
              </Text>
            </View>
          )}
        </View>

        {/* Top Cast Carousel */}
        {cast.length > 0 && (
          <View style={styles.castSection}>
            <Text style={styles.sectionTitle}>Top Cast</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.castScroll}>
              {cast.map((actor: any) => (
                <View key={actor.credit_id || actor.id} style={styles.castCard}>
                  <Image
                    source={{ uri: getProfileUrl(actor.profile_path) }}
                    style={styles.castAvatar}
                    contentFit="cover"
                  />
                  <Text style={styles.castName} numberOfLines={1}>
                    {actor.name}
                  </Text>
                  <Text style={styles.castCharacter} numberOfLines={1}>
                    {actor.character}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Similar Movies Section */}
        {similarMovies.length > 0 && (
          <View style={styles.similarSection}>
            <Text style={styles.sectionTitle}>More Like This</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.similarScroll}>
              {similarMovies.map((similar: any) => (
                <MovieCard
                  key={similar.id}
                  item={similar}
                  width={125}
                  height={185}
                />
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Trailer Modal */}
      <TrailerModal
        visible={trailerModalVisible}
        onClose={() => setTrailerModalVisible(false)}
        videoKey={trailer?.key}
        title={movie.title}
      />

      {/* Watch Providers Modal */}
      <WatchProvidersModal
        visible={providersModalVisible}
        onClose={() => setProvidersModalVisible(false)}
        providers={watchProviders}
        title={movie.title}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    color: colors.text,
    fontSize: 16,
    marginBottom: 16,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  backdropContainer: {
    width: SCREEN_WIDTH,
    height: 380,
    position: 'relative',
  },
  backdropImage: {
    width: '100%',
    height: '100%',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
  },
  navBar: {
    position: 'absolute',
    top: 48,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  navCircleBtnActive: {
    borderColor: colors.primary,
  },
  navRight: {
    flexDirection: 'row',
    gap: 10,
  },
  heroPosterRow: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 14,
  },
  poster: {
    width: 100,
    height: 150,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  heroInfo: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
  },
  tagline: {
    color: colors.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
    flexWrap: 'wrap',
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  metaText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.4)',
  },
  ratingValue: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 13,
  },
  ratingMax: {
    color: colors.textMuted,
    fontSize: 11,
  },
  voteCountText: {
    color: colors.textMuted,
    fontSize: 11,
  },
  actionsContainer: {
    paddingHorizontal: 16,
    marginTop: 18,
  },
  primaryPlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  primaryPlayBtnText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionItemBtn: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  actionItemBtnActive: {},
  actionItemText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  actionItemTextActive: {
    color: colors.primary,
  },
  genreList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 14,
  },
  genrePill: {
    backgroundColor: colors.card,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  genrePillText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginTop: 18,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  overviewText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    lineHeight: 20,
  },
  specsCard: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    gap: 8,
  },
  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  specLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  specValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '500',
    maxWidth: 200,
    textAlign: 'right',
  },
  castSection: {
    marginTop: 22,
    paddingLeft: 16,
  },
  castScroll: {
    marginTop: 4,
  },
  castCard: {
    width: 90,
    marginRight: 12,
    alignItems: 'center',
  },
  castAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.card,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  castName: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    width: '100%',
  },
  castCharacter: {
    color: colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
    width: '100%',
  },
  similarSection: {
    marginTop: 22,
    paddingLeft: 16,
  },
  similarScroll: {
    marginTop: 4,
  },
  bottomSpacer: {
    height: 50,
  },
  btnPressed: {
    opacity: 0.7,
  },
});

