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
  Calendar,
  Layers,
  ChevronDown,
} from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { useTVDetails, useTVSeason } from '../../src/hooks/useMovies';
import { useWatchlistStore } from '../../src/store/watchlistStore';
import {
  getBackdropUrl,
  getPosterUrl,
  getProfileUrl,
} from '../../src/utils/imageUrl';
import {
  formatYear,
  formatRating,
  formatVoteCount,
} from '../../src/utils/formatters';
import MovieCard from '../../src/components/MovieCard';
import TrailerModal from '../../src/components/TrailerModal';
import WatchProvidersModal from '../../src/components/WatchProvidersModal';
import youtubeService from '../../src/services/youtube';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function TVDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: tvShow, isLoading, isError } = useTVDetails(id);

  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState(1);
  const { data: seasonDetail, isLoading: isLoadingSeason } = useTVSeason(
    id,
    selectedSeasonNumber
  );

  const { isInWatchlist, toggleWatchlist, isFavorite, toggleFavorite } =
    useWatchlistStore();

  const [trailerModalVisible, setTrailerModalVisible] = useState(false);
  const [providersModalVisible, setProvidersModalVisible] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading Series Details...</Text>
      </View>
    );
  }

  if (isError || !tvShow) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Could not load TV series information.</Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={18} color="#FFF" />
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const inWatchlist = isInWatchlist(tvShow.id, 'tv');
  const favorite = isFavorite(tvShow.id, 'tv');

  // Video trailer
  const videos = (tvShow as any).videos?.results || [];
  const trailer = youtubeService.getBestTrailer(videos);

  // Watch providers
  const watchProviders = (tvShow as any)['watch/providers'];

  // Cast
  const cast = (tvShow as any).credits?.cast?.slice(0, 15) || [];

  // Similar TV shows
  const similarTV = (tvShow as any).similar?.results?.slice(0, 10) || [];

  // Seasons list
  const seasons = (tvShow.seasons || []).filter((s) => s.season_number > 0);

  const handleToggleWatchlist = () => {
    toggleWatchlist({
      tmdb_id: tvShow.id,
      media_type: 'tv',
      title: tvShow.name,
      poster_path: tvShow.poster_path,
      backdrop_path: tvShow.backdrop_path,
      vote_average: tvShow.vote_average,
      release_date: tvShow.first_air_date,
    });
  };

  const handleToggleFavorite = () => {
    toggleFavorite({
      tmdb_id: tvShow.id,
      media_type: 'tv',
      title: tvShow.name,
      poster_path: tvShow.poster_path,
      backdrop_path: tvShow.backdrop_path,
      vote_average: tvShow.vote_average,
      release_date: tvShow.first_air_date,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        decelerationRate="normal"
        scrollEventThrottle={16}
      >
        {/* Cinematic Backdrop */}
        <View style={styles.backdropContainer}>
          <Image
            source={{ uri: getBackdropUrl(tvShow.backdrop_path || tvShow.poster_path) }}
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

          {/* Navigation Bar */}
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

          {/* Floating Poster & Info */}
          <View style={styles.heroPosterRow}>
            <Image
              source={{ uri: getPosterUrl(tvShow.poster_path) }}
              style={styles.poster}
              contentFit="cover"
            />
            <View style={styles.heroInfo}>
              <View style={styles.seriesBadge}>
                <Text style={styles.seriesBadgeText}>WEB SERIES</Text>
              </View>
              <Text style={[styles.title, typography.heroTitle]}>{tvShow.name}</Text>

              <View style={styles.metaRow}>
                <View style={styles.metaBadge}>
                  <Calendar size={12} color={colors.textSecondary} />
                  <Text style={styles.metaText}>{formatYear(tvShow.first_air_date)}</Text>
                </View>

                {tvShow.number_of_seasons ? (
                  <View style={styles.metaBadge}>
                    <Layers size={12} color={colors.textSecondary} />
                    <Text style={styles.metaText}>
                      {tvShow.number_of_seasons} {tvShow.number_of_seasons === 1 ? 'Season' : 'Seasons'}
                    </Text>
                  </View>
                ) : null}

                {tvShow.original_language && (
                  <View style={styles.metaBadge}>
                    <Text style={styles.metaText}>
                      {tvShow.original_language.toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>

              {/* Rating */}
              <View style={styles.ratingRow}>
                <View style={styles.ratingPill}>
                  <Star size={16} color="#EAB308" fill="#EAB308" />
                  <Text style={styles.ratingValue}>
                    {formatRating(tvShow.vote_average)}
                  </Text>
                  <Text style={styles.ratingMax}>/10</Text>
                </View>
                <Text style={styles.voteCountText}>
                  ({formatVoteCount(tvShow.vote_count)} votes)
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryPlayBtn,
              pressed && styles.btnPressed,
            ]}
            onPress={() => setTrailerModalVisible(true)}
          >
            <Play size={18} color="#000" fill="#000" />
            <Text style={styles.primaryPlayBtnText}>
              {trailer ? 'Watch Official Series Trailer' : 'Watch Trailer'}
            </Text>
          </Pressable>

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

        {/* Genres */}
        {Boolean(tvShow.genres?.length) && (
          <View style={styles.genreList}>
            {tvShow.genres!.map((genre) => (
              <View key={genre.id} style={styles.genrePill}>
                <Text style={styles.genrePillText}>{genre.name}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Storyline Overview */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.overviewText}>
            {tvShow.overview || 'No overview available for this series.'}
          </Text>
        </View>

        {/* Seasons & Episodes Explorer */}
        {seasons.length > 0 && (
          <View style={styles.seasonSection}>
            <Text style={styles.sectionTitle}>Episodes</Text>

            {/* Season Selector Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.seasonChipsRow}>
              {seasons.map((s) => (
                <Pressable
                  key={s.id}
                  style={[
                    styles.seasonChip,
                    selectedSeasonNumber === s.season_number && styles.seasonChipActive,
                  ]}
                  onPress={() => setSelectedSeasonNumber(s.season_number)}
                >
                  <Text
                    style={[
                      styles.seasonChipText,
                      selectedSeasonNumber === s.season_number && styles.seasonChipTextActive,
                    ]}
                  >
                    Season {s.season_number}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Episode List */}
            {isLoadingSeason ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
            ) : seasonDetail?.episodes && seasonDetail.episodes.length > 0 ? (
              <View style={styles.episodeList}>
                {seasonDetail.episodes.map((ep) => (
                  <View key={ep.id} style={styles.episodeCard}>
                    <Image
                      source={{
                        uri: ep.still_path
                          ? getBackdropUrl(ep.still_path, 'w300')
                          : getBackdropUrl(tvShow.backdrop_path, 'w300'),
                      }}
                      style={styles.episodeStill}
                      contentFit="cover"
                    />
                    <View style={styles.episodeInfo}>
                      <View style={styles.episodeHeader}>
                        <Text style={styles.episodeNumber}>
                          {ep.episode_number}. {ep.name}
                        </Text>
                        {Boolean(ep.runtime) && (
                          <Text style={styles.episodeRuntime}>{ep.runtime}m</Text>
                        )}
                      </View>
                      <Text style={styles.episodeOverview} numberOfLines={2}>
                        {ep.overview || 'Episode synopsis coming soon.'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noEpisodesText}>
                Episode details unavailable for this season.
              </Text>
            )}
          </View>
        )}

        {/* Cast */}
        {cast.length > 0 && (
          <View style={styles.castSection}>
            <Text style={styles.sectionTitle}>Series Cast</Text>
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

        {/* Similar Shows */}
        {similarTV.length > 0 && (
          <View style={styles.similarSection}>
            <Text style={styles.sectionTitle}>More Web Series Like This</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.similarScroll}>
              {similarTV.map((show: any) => (
                <MovieCard
                  key={show.id}
                  item={show}
                  mediaType="tv"
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
        title={tvShow.name}
      />

      {/* Watch Providers Modal */}
      <WatchProvidersModal
        visible={providersModalVisible}
        onClose={() => setProvidersModalVisible(false)}
        providers={watchProviders}
        title={tvShow.name}
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
  seriesBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  seriesBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
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
    marginBottom: 10,
  },
  overviewText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    lineHeight: 20,
  },
  seasonSection: {
    paddingHorizontal: 16,
    marginTop: 22,
  },
  seasonChipsRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  seasonChip: {
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  seasonChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  seasonChipText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  seasonChipTextActive: {
    color: '#FFF',
  },
  episodeList: {
    gap: 12,
  },
  episodeCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  episodeStill: {
    width: 110,
    height: 75,
    backgroundColor: colors.surface,
  },
  episodeInfo: {
    flex: 1,
    padding: 8,
    justifyContent: 'center',
  },
  episodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  episodeNumber: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    marginRight: 6,
  },
  episodeRuntime: {
    color: colors.textMuted,
    fontSize: 11,
  },
  episodeOverview: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },
  noEpisodesText: {
    color: colors.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
    paddingVertical: 10,
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

