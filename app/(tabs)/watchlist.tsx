import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bookmark, Heart, Film, Trash2 } from 'lucide-react-native';
import { router } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { useWatchlistStore } from '../../src/store/watchlistStore';
import MovieCard from '../../src/components/MovieCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_WIDTH = (SCREEN_WIDTH - 16 * 2 - 12 * 2) / 3;

export default function WatchlistScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'watchlist' | 'favorites'>('watchlist');

  const {
    watchlist,
    favorites,
    toggleWatchlist,
    toggleFavorite,
  } = useWatchlistStore();

  const currentList = activeTab === 'watchlist' ? watchlist : favorites;

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      {/* Screen Title */}
      <View style={styles.header}>
        <Text style={[styles.title, typography.screenTitle]}>Saved Library</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <Pressable
          style={[
            styles.tabBtn,
            activeTab === 'watchlist' && styles.tabBtnActive,
          ]}
          onPress={() => setActiveTab('watchlist')}
        >
          <Bookmark
            size={16}
            color={activeTab === 'watchlist' ? '#FFF' : colors.textMuted}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'watchlist' && styles.tabTextActive,
            ]}
          >
            Watchlist ({watchlist.length})
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.tabBtn,
            activeTab === 'favorites' && styles.tabBtnActive,
          ]}
          onPress={() => setActiveTab('favorites')}
        >
          <Heart
            size={16}
            color={activeTab === 'favorites' ? '#FFF' : colors.textMuted}
            fill={activeTab === 'favorites' ? '#FFF' : 'transparent'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'favorites' && styles.tabTextActive,
            ]}
          >
            Favorites ({favorites.length})
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      {currentList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Film size={52} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>
            {activeTab === 'watchlist'
              ? 'Your Watchlist is empty'
              : 'No Favorites saved yet'}
          </Text>
          <Text style={styles.emptyDesc}>
            {activeTab === 'watchlist'
              ? 'Tap the "+ Watchlist" button on any movie or TV series banner to save it here for later.'
              : 'Add your all-time favorite movies and web series to easily find and revisit them.'}
          </Text>
          <Pressable
            style={({ pressed }) => [styles.exploreBtn, pressed && styles.btnPressed]}
            onPress={() => router.push('/(tabs)/' as any)}
          >
            <Text style={styles.exploreBtnText}>Explore Movies & Series</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={currentList}
          keyExtractor={(item) => `${item.media_type}-${item.tmdb_id}`}
          numColumns={3}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const movieItem: any = {
              id: item.tmdb_id,
              title: item.title,
              name: item.title,
              poster_path: item.poster_path,
              backdrop_path: item.backdrop_path,
              vote_average: item.vote_average,
              release_date: item.release_date,
              first_air_date: item.release_date,
            };

            return (
              <View style={styles.gridItemWrapper}>
                <MovieCard
                  item={movieItem}
                  mediaType={item.media_type}
                  width={COLUMN_WIDTH}
                  height={COLUMN_WIDTH * 1.5}
                  showTitle={true}
                />
                <Pressable
                  style={({ pressed }) => [
                    styles.removeIconBtn,
                    pressed && styles.btnPressed,
                  ]}
                  onPress={() => {
                    if (activeTab === 'watchlist') {
                      toggleWatchlist(item);
                    } else {
                      toggleFavorite(item);
                    }
                  }}
                  hitSlop={8}
                >
                  <Trash2 size={13} color="#EF4444" />
                </Pressable>
              </View>
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
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: {
    color: colors.text,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.card,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFF',
  },
  gridContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  gridItemWrapper: {
    position: 'relative',
    marginRight: 12,
    marginBottom: 18,
  },
  removeIconBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    padding: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  emptyDesc: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  exploreBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  exploreBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  btnPressed: {
    opacity: 0.7,
  },
});

