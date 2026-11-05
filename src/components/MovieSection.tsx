import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import MovieCard from './MovieCard';
import { Movie } from '../types/movie';
import { TVShow } from '../types/tv';

interface MovieSectionProps {
  title: string;
  badge?: string;
  items: (Movie | TVShow)[];
  mediaType?: 'movie' | 'tv';
  cardWidth?: number;
  cardHeight?: number;
  showRank?: boolean;
  categoryType?: string;
  isLoading?: boolean;
}

export const MovieSection: React.FC<MovieSectionProps> = ({
  title,
  badge,
  items,
  mediaType = 'movie',
  cardWidth = 125,
  cardHeight = 185,
  showRank = false,
  categoryType,
  isLoading = false,
}) => {
  if (!isLoading && (!items || items.length === 0)) {
    return null;
  }

  const handleSeeAll = () => {
    if (categoryType) {
      router.push({
        pathname: '/category/[type]',
        params: { type: categoryType, title, mediaType },
      } as any);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Text style={[styles.title, typography.sectionTitle]}>{title}</Text>
          {badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>

        {categoryType && (
          <Pressable
            style={({ pressed }) => [styles.seeAllBtn, pressed && styles.seeAllPressed]}
            onPress={handleSeeAll}
            hitSlop={8}
          >
            <Text style={styles.seeAllText}>See All</Text>
            <ChevronRight size={14} color={colors.primary} />
          </Pressable>
        )}
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={items}
        keyExtractor={(item) => `${item.id}-${item.vote_average}`}
        contentContainerStyle={styles.listContent}
        initialNumToRender={5}
        maxToRenderPerBatch={8}
        windowSize={5}
        renderItem={({ item, index }) => (
          <MovieCard
            item={item}
            mediaType={mediaType}
            width={cardWidth}
            height={cardHeight}
            rank={showRank ? index + 1 : undefined}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: colors.text,
  },
  badge: {
    backgroundColor: 'rgba(229, 9, 20, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.35)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllPressed: {
    opacity: 0.7,
  },
  seeAllText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingLeft: 16,
    paddingRight: 6,
  },
});

export default MovieSection;

