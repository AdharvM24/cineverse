import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Bell,
  Calendar,
  Heart,
  Tv,
  Check,
  Plus,
  Flame,
  CheckCheck,
} from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';
import tmdb from '../src/services/tmdb';
import { useWatchlistStore } from '../src/store/watchlistStore';
import { getPosterUrl } from '../src/utils/imageUrl';
import { formatDate, formatYear } from '../src/utils/formatters';

type FilterType = 'all' | 'upcoming' | 'favorites' | 'series';

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [markedRead, setMarkedRead] = useState(false);

  const { favorites, watchlist, isInWatchlist, toggleWatchlist } = useWatchlistStore();

  // Fetch upcoming movies from TMDB
  const { data: upcomingData, isLoading: isLoadingUpcoming } = useQuery({
    queryKey: ['notifications', 'upcoming'],
    queryFn: () => tmdb.getUpcomingMovies(1),
  });

  // Fetch airing series from TMDB
  const { data: airingData, isLoading: isLoadingAiring } = useQuery({
    queryKey: ['notifications', 'airing'],
    queryFn: () => tmdb.getAiringTodayTV(1),
  });

  // Combine and structure notifications
  const upcomingMovies = upcomingData?.results || [];
  const airingSeries = airingData?.results || [];

  // 1. Upcoming Releases Notifications
  const upcomingNotifications = upcomingMovies.slice(0, 8).map((movie) => ({
    id: `upcoming-${movie.id}`,
    tmdb_id: movie.id,
    media_type: 'movie' as const,
    type: 'upcoming' as const,
    title: movie.title,
    badgeText: `Releasing ${formatDate(movie.release_date)}`,
    description: `Upcoming theatrical release: ${movie.overview?.substring(0, 95)}...`,
    poster_path: movie.poster_path,
    date: movie.release_date,
    vote_average: movie.vote_average,
  }));

  // 2. Airing / Series Updates Notifications
  const seriesNotifications = airingSeries.slice(0, 6).map((show) => ({
    id: `series-${show.id}`,
    tmdb_id: show.id,
    media_type: 'tv' as const,
    type: 'series' as const,
    title: show.name,
    badgeText: 'New Episode Airing',
    description: `Latest episodes now streaming on legal providers. Explore season guide.`,
    poster_path: show.poster_path,
    date: show.first_air_date,
    vote_average: show.vote_average,
  }));

  // 3. Personalized Favorites Updates
  const favoriteNotifications = favorites.map((fav) => ({
    id: `fav-${fav.tmdb_id}`,
    tmdb_id: fav.tmdb_id,
    media_type: fav.media_type,
    type: 'favorite' as const,
    title: fav.title,
    badgeText: 'In Your Favorites',
    description: `Check out official trailers, streaming availability, and similar titles for ${fav.title}.`,
    poster_path: fav.poster_path,
    date: fav.release_date,
    vote_average: fav.vote_average,
  }));

  // Merge list based on filter
  let notifications = [];
  if (activeFilter === 'upcoming') {
    notifications = upcomingNotifications;
  } else if (activeFilter === 'series') {
    notifications = seriesNotifications;
  } else if (activeFilter === 'favorites') {
    notifications = favoriteNotifications;
  } else {
    notifications = [
      ...favoriteNotifications.slice(0, 3),
      ...upcomingNotifications.slice(0, 6),
      ...seriesNotifications.slice(0, 4),
    ];
  }

  const handleItemPress = (item: (typeof notifications)[0]) => {
    if (item.media_type === 'tv') {
      router.push(`/tv/${item.tmdb_id}` as any);
    } else {
      router.push(`/movie/${item.tmdb_id}` as any);
    }
  };

  const handleToggleWatchlist = (item: (typeof notifications)[0], e: any) => {
    e.stopPropagation();
    toggleWatchlist({
      tmdb_id: item.tmdb_id,
      media_type: item.media_type,
      title: item.title,
      poster_path: item.poster_path,
      backdrop_path: item.poster_path,
      vote_average: item.vote_average,
      release_date: item.date,
    });
  };

  const isLoading = isLoadingUpcoming || isLoadingAiring;

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.btnPressed]}
          onPress={() => router.back()}
          hitSlop={8}
        >
          <ArrowLeft size={20} color="#FFF" />
        </Pressable>

        <View style={styles.headerTitleGroup}>
          <Text style={[styles.title, typography.sectionTitle]}>Notifications & Alerts</Text>
          <View style={styles.unreadCountBadge}>
            <Text style={styles.unreadCountText}>
              {markedRead ? '0' : notifications.length}
            </Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.markReadBtn, pressed && styles.btnPressed]}
          onPress={() => setMarkedRead(true)}
          hitSlop={8}
        >
          <CheckCheck size={18} color={markedRead ? colors.textMuted : colors.primary} />
        </Pressable>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <Pressable
            style={[styles.filterChip, activeFilter === 'all' && styles.filterChipActive]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[styles.filterText, activeFilter === 'all' && styles.filterTextActive]}>
              All ({notifications.length})
            </Text>
          </Pressable>

          <Pressable
            style={[styles.filterChip, activeFilter === 'upcoming' && styles.filterChipActive]}
            onPress={() => setActiveFilter('upcoming')}
          >
            <Calendar size={13} color={activeFilter === 'upcoming' ? '#FFF' : colors.textMuted} />
            <Text style={[styles.filterText, activeFilter === 'upcoming' && styles.filterTextActive]}>
              Upcoming Releases
            </Text>
          </Pressable>

          <Pressable
            style={[styles.filterChip, activeFilter === 'series' && styles.filterChipActive]}
            onPress={() => setActiveFilter('series')}
          >
            <Tv size={13} color={activeFilter === 'series' ? '#FFF' : colors.textMuted} />
            <Text style={[styles.filterText, activeFilter === 'series' && styles.filterTextActive]}>
              Series & Episodes
            </Text>
          </Pressable>

          <Pressable
            style={[styles.filterChip, activeFilter === 'favorites' && styles.filterChipActive]}
            onPress={() => setActiveFilter('favorites')}
          >
            <Heart size={13} color={activeFilter === 'favorites' ? '#FFF' : colors.textMuted} />
            <Text style={[styles.filterText, activeFilter === 'favorites' && styles.filterTextActive]}>
              My Favorites ({favorites.length})
            </Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* Main Notifications List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Fetching Latest Movie & Series Alerts...</Text>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Bell size={48} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No Notifications</Text>
          <Text style={styles.emptyDesc}>
            Add movies to your Favorites to receive personalized release notifications and episode alerts.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const inList = isInWatchlist(item.tmdb_id, item.media_type);

            return (
              <Pressable
                style={({ pressed }) => [
                  styles.notificationCard,
                  pressed && styles.cardPressed,
                ]}
                onPress={() => handleItemPress(item)}
              >
                {/* Poster Image */}
                <Image
                  source={{ uri: getPosterUrl(item.poster_path, 'w185') }}
                  style={styles.poster}
                  contentFit="cover"
                />

                {/* Content */}
                <View style={styles.contentWrap}>
                  <View style={styles.badgeRow}>
                    <View
                      style={[
                        styles.typeBadge,
                        item.type === 'upcoming'
                          ? styles.upcomingBadge
                          : item.type === 'favorite'
                          ? styles.favoriteBadge
                          : styles.seriesBadge,
                      ]}
                    >
                      {item.type === 'upcoming' ? (
                        <Calendar size={10} color="#3B82F6" />
                      ) : item.type === 'favorite' ? (
                        <Heart size={10} color="#EC4899" />
                      ) : (
                        <Tv size={10} color={colors.primary} />
                      )}
                      <Text
                        style={[
                          styles.typeBadgeText,
                          item.type === 'upcoming'
                            ? styles.upcomingBadgeText
                            : item.type === 'favorite'
                            ? styles.favoriteBadgeText
                            : styles.seriesBadgeText,
                        ]}
                      >
                        {item.badgeText}
                      </Text>
                    </View>
                    <Text style={styles.mediaTag}>
                      {item.media_type.toUpperCase()}
                    </Text>
                  </View>

                  <Text style={styles.movieTitle} numberOfLines={1}>
                    {item.title}
                  </Text>

                  <Text style={styles.description} numberOfLines={2}>
                    {item.description}
                  </Text>

                  {/* Action Row */}
                  <View style={styles.actionRow}>
                    <Pressable
                      style={[
                        styles.watchlistToggleBtn,
                        inList && styles.watchlistToggleBtnActive,
                      ]}
                      onPress={(e) => handleToggleWatchlist(item, e)}
                    >
                      {inList ? (
                        <Check size={13} color={colors.primary} />
                      ) : (
                        <Plus size={13} color="#FFF" />
                      )}
                      <Text
                        style={[
                          styles.watchlistToggleText,
                          inList && styles.watchlistToggleTextActive,
                        ]}
                      >
                        {inList ? 'In Watchlist' : 'Add to Watchlist'}
                      </Text>
                    </Pressable>

                    <Text style={styles.viewDetailsText}>View Details &rarr;</Text>
                  </View>
                </View>
              </Pressable>
            );
          }}
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
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: colors.text,
  },
  unreadCountBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadCountText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  markReadBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFF',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 10,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  emptyDesc: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardPressed: {
    opacity: 0.85,
    backgroundColor: '#1E1E24',
  },
  poster: {
    width: 85,
    height: 125,
    backgroundColor: colors.surface,
  },
  contentWrap: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  upcomingBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  upcomingBadgeText: {
    color: '#60A5FA',
    fontSize: 10,
    fontWeight: '700',
  },
  seriesBadge: {
    backgroundColor: 'rgba(229, 9, 20, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.3)',
  },
  seriesBadgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '700',
  },
  favoriteBadge: {
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.3)',
  },
  favoriteBadgeText: {
    color: '#F472B6',
    fontSize: 10,
    fontWeight: '700',
  },
  typeBadgeText: {
    fontSize: 10,
  },
  mediaTag: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
  },
  movieTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  watchlistToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  watchlistToggleBtnActive: {
    backgroundColor: 'rgba(229, 9, 20, 0.15)',
  },
  watchlistToggleText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  watchlistToggleTextActive: {
    color: colors.primary,
  },
  viewDetailsText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  btnPressed: {
    opacity: 0.7,
  },
});
