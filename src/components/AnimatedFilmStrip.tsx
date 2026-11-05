import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Image } from 'expo-image';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FilmStripItem {
  id: string | number;
  uri: string;
}

interface FilmStripRowProps {
  items: FilmStripItem[];
  direction?: 'left' | 'right';
  speed?: number;
  itemWidth?: number;
  itemHeight?: number;
}

// Sprocket holes perforations bar (top and bottom of 35mm film reel)
const SprocketHolesBar: React.FC<{ count: number }> = ({ count }) => {
  return (
    <View style={styles.sprocketBar}>
      {Array.from({ length: count }).map((_, idx) => (
        <View key={idx} style={styles.sprocketHole} />
      ))}
    </View>
  );
};

export const FilmStripRow: React.FC<FilmStripRowProps> = ({
  items,
  direction = 'left',
  speed = 28000,
  itemWidth = 96,
  itemHeight = 136,
}) => {
  // Duplicate list to achieve continuous seamless loop
  const duplicatedItems = [...items, ...items, ...items];
  const totalWidth = items.length * (itemWidth + 10);

  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animatedValue.setValue(0);
    const startValue = direction === 'left' ? 0 : -totalWidth;
    const endValue = direction === 'left' ? -totalWidth : 0;

    animatedValue.setValue(startValue);

    const animation = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: endValue,
        duration: speed,
        useNativeDriver: true,
      })
    );

    animation.start();
    return () => animation.stop();
  }, [animatedValue, direction, speed, totalWidth]);

  return (
    <View style={[styles.stripContainer, { height: itemHeight + 36 }]}>
      <Animated.View
        style={[
          styles.animatedRow,
          {
            transform: [{ translateX: animatedValue }],
          },
        ]}
      >
        <View style={styles.stripTrack}>
          {/* Top Sprocket Holes */}
          <SprocketHolesBar count={duplicatedItems.length * 4} />

          {/* Posters Row */}
          <View style={styles.postersRow}>
            {duplicatedItems.map((item, index) => (
              <View
                key={`${item.id}-${index}`}
                style={[styles.posterFrame, { width: itemWidth, height: itemHeight }]}
              >
                <Image
                  source={{ uri: item.uri }}
                  style={styles.posterImage}
                  contentFit="cover"
                  transition={200}
                  cachePolicy="memory-disk"
                />
              </View>
            ))}
          </View>

          {/* Bottom Sprocket Holes */}
          <SprocketHolesBar count={duplicatedItems.length * 4} />
        </View>
      </Animated.View>
    </View>
  );
};

export const AnimatedFilmStripReels: React.FC<{
  row1: FilmStripItem[];
  row2: FilmStripItem[];
  row3: FilmStripItem[];
  row4?: FilmStripItem[];
}> = ({ row1, row2, row3, row4 }) => {
  return (
    <View style={styles.reelsWrapper}>
      <View style={styles.tiltedCanvas}>
        <FilmStripRow items={row1} direction="left" speed={26000} />
        <FilmStripRow items={row2} direction="right" speed={29000} />
        <FilmStripRow items={row3} direction="left" speed={24000} />
        {row4 && <FilmStripRow items={row4} direction="right" speed={28000} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  reelsWrapper: {
    width: SCREEN_WIDTH * 1.5,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  tiltedCanvas: {
    transform: [{ rotate: '-11deg' }, { scale: 1.15 }],
    gap: 14,
  },
  stripContainer: {
    width: '100%',
    justifyContent: 'center',
  },
  animatedRow: {
    flexDirection: 'row',
  },
  stripTrack: {
    backgroundColor: 'rgba(24, 24, 28, 0.95)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sprocketBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    gap: 6,
  },
  sprocketHole: {
    width: 8,
    height: 5,
    backgroundColor: 'rgba(9, 9, 11, 0.9)',
    borderRadius: 1.5,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  postersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  posterFrame: {
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#1E1E24',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
});

export default AnimatedFilmStripReels;
