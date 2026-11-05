import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Search as SearchIcon,
  X,
  SlidersHorizontal,
  History,
  TrendingUp,
  Clock,
  Film,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { useSearch, SearchFilters } from '../../src/hooks/useSearch';
import MovieCard from '../../src/components/MovieCard';
import { POPULAR_SEARCH_TERMS, LANGUAGE_NAMES } from '../../src/utils/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_WIDTH = (SCREEN_WIDTH - 16 * 2 - 12 * 2) / 3;

const GENRE_FILTERS = [
  { id: 28, name: 'Action' },
  { id: 35, name: 'Comedy' },
  { id: 18, name: 'Drama' },
  { id: 53, name: 'Thriller' },
  { id: 27, name: 'Horror' },
  { id: 878, name: 'Sci-Fi' },
  { id: 16, name: 'Animation' },
  { id: 9648, name: 'Mystery' },
];

const LANGUAGE_FILTERS = [
  { code: 'ml', name: 'Malayalam' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'en', name: 'English' },
  { code: 'ko', name: 'Korean' },
];

const YEAR_FILTERS = [2025, 2024, 2023, 2022, 2020];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    mediaType: 'all',
  });

  const { debouncedQuery, searchResults } = useSearch(query, filters);

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem('@search_history');
      if (stored) {
        setSearchHistory(JSON.parse(stored));
      }
    } catch {}
  };

  const saveToHistory = async (term: string) => {
    if (!term.trim()) return;
    const clean = term.trim();
    const updated = [clean, ...searchHistory.filter((i) => i.toLowerCase() !== clean.toLowerCase())].slice(0, 10);
    setSearchHistory(updated);
    await AsyncStorage.setItem('@search_history', JSON.stringify(updated));
  };

  const clearHistory = async () => {
    setSearchHistory([]);
    await AsyncStorage.removeItem('@search_history');
  };

  const handleSelectTerm = (term: string) => {
    setQuery(term);
    saveToHistory(term);
  };

  const handleClearQuery = () => {
    setQuery('');
  };

  const results = searchResults.data?.results || [];

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      {/* Top Search Bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.inputWrapper}>
          <SearchIcon size={18} color={colors.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="Search movies, Malayalam, actors..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={(text) => {
              setQuery(text);
              if (text.length > 2) saveToHistory(text);
            }}
            returnKeyType="search"
            onSubmitEditing={() => saveToHistory(query)}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <Pressable onPress={handleClearQuery} hitSlop={8}>
              <X size={18} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>

        <Pressable
          style={[
            styles.filterToggleBtn,
            Boolean(showFilters || filters.genreId || filters.language || filters.year) &&
              styles.filterToggleBtnActive,
          ]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal
            size={18}
            color={
              Boolean(showFilters || filters.genreId || filters.language || filters.year)
                ? colors.primary
                : colors.textSecondary
            }
          />
        </Pressable>
      </View>

      {/* Expandable Filter Panel */}
      {showFilters && (
        <View style={styles.filterPanel}>
          {/* Media Type Tabs */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Type</Text>
            <View style={styles.pillRow}>
              {(['all', 'movie', 'tv'] as const).map((type) => (
                <Pressable
                  key={type}
                  style={[
                    styles.pill,
                    filters.mediaType === type && styles.pillActive,
                  ]}
                  onPress={() => setFilters({ ...filters, mediaType: type })}
                >
                  <Text
                    style={[
                      styles.pillText,
                      filters.mediaType === type && styles.pillTextActive,
                    ]}
                  >
                    {type.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Languages */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Language</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
              <Pressable
                style={[
                  styles.pill,
                  !filters.language && styles.pillActive,
                ]}
                onPress={() => setFilters({ ...filters, language: undefined })}
              >
                <Text style={[styles.pillText, !filters.language && styles.pillTextActive]}>
                  All
                </Text>
              </Pressable>
              {LANGUAGE_FILTERS.map((lang) => (
                <Pressable
                  key={lang.code}
                  style={[
                    styles.pill,
                    filters.language === lang.code && styles.pillActive,
                  ]}
                  onPress={() =>
                    setFilters({
                      ...filters,
                      language: filters.language === lang.code ? undefined : lang.code,
                    })
                  }
                >
                  <Text
                    style={[
                      styles.pillText,
                      filters.language === lang.code && styles.pillTextActive,
                    ]}
                  >
                    {lang.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Genres */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Genre</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
              {GENRE_FILTERS.map((g) => (
                <Pressable
                  key={g.id}
                  style={[
                    styles.pill,
                    filters.genreId === g.id && styles.pillActive,
                  ]}
                  onPress={() =>
                    setFilters({
                      ...filters,
                      genreId: filters.genreId === g.id ? undefined : g.id,
                    })
                  }
                >
                  <Text
                    style={[
                      styles.pillText,
                      filters.genreId === g.id && styles.pillTextActive,
                    ]}
                  >
                    {g.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Main Content Area */}
      {searchResults.isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Searching CineVerse...</Text>
        </View>
      ) : query.length === 0 && !filters.genreId && !filters.language ? (
        <ScrollView style={styles.emptyStateContainer} showsVerticalScrollIndicator={false}>
          {/* Recent Search History */}
          {searchHistory.length > 0 && (
            <View style={styles.historySection}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.headerTitleGroup}>
                  <History size={16} color={colors.textSecondary} />
                  <Text style={styles.sectionHeaderTitle}>Recent Searches</Text>
                </View>
                <Pressable onPress={clearHistory} hitSlop={8}>
                  <Text style={styles.clearText}>Clear</Text>
                </Pressable>
              </View>

              <View style={styles.tagWrap}>
                {searchHistory.map((term, index) => (
                  <Pressable
                    key={index}
                    style={styles.historyTag}
                    onPress={() => handleSelectTerm(term)}
                  >
                    <Clock size={12} color={colors.textMuted} />
                    <Text style={styles.historyTagText}>{term}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Popular Searches */}
          <View style={styles.popularSection}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.headerTitleGroup}>
                <TrendingUp size={16} color={colors.primary} />
                <Text style={styles.sectionHeaderTitle}>Popular in India & Malayalam</Text>
              </View>
            </View>

            <View style={styles.tagWrap}>
              {POPULAR_SEARCH_TERMS.map((term, index) => (
                <Pressable
                  key={index}
                  style={styles.popularTag}
                  onPress={() => handleSelectTerm(term)}
                >
                  <Text style={styles.popularTagRank}>{index + 1}</Text>
                  <Text style={styles.popularTagText}>{term}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      ) : results.length === 0 ? (
        <View style={styles.noResultsContainer}>
          <Film size={48} color={colors.textMuted} />
          <Text style={styles.noResultsTitle}>No titles found</Text>
          <Text style={styles.noResultsDesc}>
            Try searching for another movie title, actor, or clearing filters.
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.id}-${item.vote_average}`}
          numColumns={3}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.gridItem}>
              <MovieCard
                item={item as any}
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
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 10,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
  },
  filterToggleBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterToggleBtnActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
  },
  filterPanel: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  filterSection: {
    gap: 6,
  },
  filterLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pillScroll: {
    flexDirection: 'row',
  },
  pill: {
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 6,
  },
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  pillTextActive: {
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
  emptyStateContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  historySection: {
    marginBottom: 24,
  },
  popularSection: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionHeaderTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  clearText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  historyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyTagText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  popularTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  popularTagRank: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 12,
  },
  popularTagText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 10,
  },
  noResultsTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  noResultsDesc: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
  gridContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  gridItem: {
    marginRight: 12,
    marginBottom: 16,
  },
});
