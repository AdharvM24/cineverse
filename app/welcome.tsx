import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';
import AnimatedFilmStripReels from '../src/components/AnimatedFilmStrip';
import tmdb from '../src/services/tmdb';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// High-resolution posters representing Malayalam, Indian, and International cinema
const DEFAULT_POSTERS_ROW1 = [
  { id: '1', uri: 'https://image.tmdb.org/t/p/w342/9cqNFs91ezj7zrhtGqGIZpB7t0.jpg' }, // Iron Man
  { id: '2', uri: 'https://image.tmdb.org/t/p/w342/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg' }, // Oppenheimer
  { id: '3', uri: 'https://image.tmdb.org/t/p/w342/gKkl37BQuKTanygYQG1pyYgLVgf.jpg' }, // Interstellar
  { id: '4', uri: 'https://image.tmdb.org/t/p/w342/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg' }, // Pulp Fiction
  { id: '5', uri: 'https://image.tmdb.org/t/p/w342/r2J02Z2OpNTctetOs21Yw50WDuF.jpg' }, // Spirited Away
  { id: '6', uri: 'https://image.tmdb.org/t/p/w342/qJ2tW6WMUDux911r6m7haRef0WH.jpg' }, // The Dark Knight
];

const DEFAULT_POSTERS_ROW2 = [
  { id: '7', uri: 'https://image.tmdb.org/t/p/w342/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg' }, // Stranger Things
  { id: '8', uri: 'https://image.tmdb.org/t/p/w342/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg' }, // Infinity War
  { id: '9', uri: 'https://image.tmdb.org/t/p/w342/A4j8UQbt4EDOUqrlum1f2X2kSkg.jpg' }, // Spider-Man
  { id: '10', uri: 'https://image.tmdb.org/t/p/w342/4m1Au3YkjqsxF8iwQy0fPYSxE0h.jpg' }, // Breaking Bad
  { id: '11', uri: 'https://image.tmdb.org/t/p/w342/hZkgoQYus5vegHoetLkCJzb17zJ.jpg' }, // Fight Club
  { id: '12', uri: 'https://image.tmdb.org/t/p/w342/b1xCNnyrPebIc7vNdp9fGQaqZwm.jpg' }, // Inception
];

const DEFAULT_POSTERS_ROW3 = [
  { id: '13', uri: 'https://image.tmdb.org/t/p/w342/velWPhVMQeQKcxggNEU8YmIo52R.jpg' }, // Dune
  { id: '14', uri: 'https://image.tmdb.org/t/p/w342/fiVW06jE7z9YnO4trhaMEdclSiC.jpg' }, // Fast X
  { id: '15', uri: 'https://image.tmdb.org/t/p/w342/8xV47NDrjdMSpkz2FIYYKOkY4Z4.jpg' }, // Avatar
  { id: '16', uri: 'https://image.tmdb.org/t/p/w342/3bhkrj58Vtu7enYsRolD1fZdja1.jpg' }, // Godfather
  { id: '17', uri: 'https://image.tmdb.org/t/p/w342/6MKr3KgOLmzOP6MSuZERO41Lpkt.jpg' }, // Parasite
  { id: '18', uri: 'https://image.tmdb.org/t/p/w342/vqzNJRH4YyloGxsIObu0vEsuQIx.jpg' }, // The Matrix
];

const SLIDES = [
  {
    titlePrefix: 'Brings ',
    titleHighlight: 'Limitless',
    titleSuffix: ' Streaming to Your Devices',
    subtitle:
      'Unleash a world of cinematic entertainment. Discover Malayalam, Indian & Global blockbusters all in one place.',
  },
  {
    titlePrefix: 'Watch ',
    titleHighlight: 'Official',
    titleSuffix: ' HD Trailers & Previews',
    subtitle:
      'Stream verified trailers, teasers, and exclusive clips in crisp high-definition without leaving the app.',
  },
  {
    titlePrefix: 'Find Where to Stream ',
    titleHighlight: 'Legally',
    titleSuffix: '',
    subtitle:
      'Instantly know whether your favorite movie is streaming on Netflix, Prime Video, Disney+ Hotstar, or Zee5.',
  },
];

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const [activeSlide, setActiveSlide] = useState(0);
  const [row1, setRow1] = useState(DEFAULT_POSTERS_ROW1);
  const [row2, setRow2] = useState(DEFAULT_POSTERS_ROW2);
  const [row3, setRow3] = useState(DEFAULT_POSTERS_ROW3);

  // Auto advance slides every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4200);
    return () => clearInterval(timer);
  }, []);

  // Fetch live TMDB posters for dynamic freshness if available
  useEffect(() => {
    async function loadDynamicPosters() {
      try {
        const [trending, malayalam, popular] = await Promise.all([
          tmdb.getTrendingDay().catch(() => null),
          tmdb.getMalayalamMovies().catch(() => null),
          tmdb.getPopularMovies().catch(() => null),
        ]);

        if (trending?.results && trending.results.length >= 6) {
          const items = trending.results.slice(0, 8).map((m) => ({
            id: String(m.id),
            uri: `https://image.tmdb.org/t/p/w342${m.poster_path}`,
          }));
          setRow1(items);
        }

        if (malayalam?.results && malayalam.results.length >= 6) {
          const items = malayalam.results.slice(0, 8).map((m) => ({
            id: String(m.id),
            uri: `https://image.tmdb.org/t/p/w342${m.poster_path}`,
          }));
          setRow2(items);
        }

        if (popular?.results && popular.results.length >= 6) {
          const items = popular.results.slice(8, 16).map((m) => ({
            id: String(m.id),
            uri: `https://image.tmdb.org/t/p/w342${m.poster_path}`,
          }));
          setRow3(items);
        }
      } catch {}
    }
    loadDynamicPosters();
  }, []);

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem('@has_seen_welcome', 'true');
    } catch {}
    router.replace('/(tabs)/' as any);
  };

  const currentSlide = SLIDES[activeSlide];

  return (
    <View style={styles.container}>
      {/* Background Animated Filmstrip Reels */}
      <View style={styles.filmstripLayer}>
        <AnimatedFilmStripReels
          row1={row1}
          row2={row2}
          row3={row3}
          row4={row1}
        />
      </View>

      {/* Top Vignette Gradient */}
      <LinearGradient
        colors={['rgba(9, 9, 11, 0.95)', 'rgba(9, 9, 11, 0.4)', 'transparent']}
        style={[styles.topGradient, { height: Math.max(insets.top + 70, 100) }]}
      />

      {/* Center to Bottom Deep Gradient */}
      <LinearGradient
        colors={[
          'transparent',
          'rgba(9, 9, 11, 0.5)',
          'rgba(9, 9, 11, 0.92)',
          colors.background,
        ]}
        style={styles.bottomGradient}
      />

      {/* Top Header Logo */}
      <View style={[styles.topHeader, { paddingTop: Math.max(insets.top + 10, 24) }]}>
        <View style={styles.logoRow}>
          <Text style={styles.logoRed}>CINE</Text>
          <Text style={styles.logoWhite}>VERSE</Text>
        </View>
        <Text style={styles.tagline}>PREMIUM MOVIE DISCOVERY</Text>
      </View>

      {/* Bottom Elevated Content Card */}
      <View style={[styles.bottomCard, { paddingBottom: Math.max(insets.bottom + 16, 28) }]}>
        {/* Animated Carousel Text */}
        <View style={styles.textContainer}>
          <Text style={styles.headline}>
            {currentSlide.titlePrefix}
            <Text style={styles.headlineRed}>{currentSlide.titleHighlight}</Text>
            {currentSlide.titleSuffix}
          </Text>

          <Text style={styles.subtitle}>
            {currentSlide.subtitle}
          </Text>
        </View>

        {/* Carousel Pagination Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, index) => (
            <Pressable
              key={index}
              onPress={() => setActiveSlide(index)}
              hitSlop={8}
            >
              <View
                style={[
                  styles.dot,
                  activeSlide === index && styles.dotActive,
                ]}
              />
            </Pressable>
          ))}
        </View>

        {/* Primary "Get Started" CTA Button */}
        <Pressable
          style={({ pressed }) => [
            styles.getStartedBtn,
            pressed && styles.btnPressed,
          ]}
          onPress={handleGetStarted}
        >
          <Text style={styles.getStartedBtnText}>Get Started</Text>
        </Pressable>

        {/* Skip button */}
        <Pressable
          style={({ pressed }) => [
            styles.skipBtn,
            pressed && styles.btnPressed,
          ]}
          onPress={handleGetStarted}
        >
          <Text style={styles.skipBtnText}>Explore Directly as Guest</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    position: 'relative',
    overflow: 'hidden',
  },
  filmstripLayer: {
    position: 'absolute',
    top: -20,
    left: -SCREEN_WIDTH * 0.25,
    right: 0,
    bottom: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 5,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 220,
    left: 0,
    right: 0,
    height: 320,
    zIndex: 4,
  },
  topHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoRed: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
    textShadowColor: 'rgba(229, 9, 20, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  logoWhite: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },
  tagline: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2.5,
    marginTop: 3,
  },
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#121216',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 24,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 20,
    zIndex: 10,
  },
  textContainer: {
    alignItems: 'center',
    minHeight: 125,
    justifyContent: 'center',
  },
  headline: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 31,
    letterSpacing: -0.3,
  },
  headlineRed: {
    color: colors.primary,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginVertical: 18,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  dotActive: {
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  getStartedBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
  getStartedBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  skipBtn: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 4,
  },
  skipBtnText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
