import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { colors } from '../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ShimmerItem: React.FC<{
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}> = ({ width, height, borderRadius = 6, style }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.skeleton,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const HomeSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Hero Banner Skeleton */}
      <View style={styles.heroSkeleton}>
        <ShimmerItem width={SCREEN_WIDTH} height={440} borderRadius={0} />
      </View>

      {/* Row 1 Skeleton */}
      <View style={styles.sectionSkeleton}>
        <ShimmerItem width={160} height={18} style={styles.titleShimmer} />
        <View style={styles.cardsRow}>
          {[1, 2, 3, 4].map((i) => (
            <ShimmerItem
              key={i}
              width={125}
              height={185}
              borderRadius={8}
              style={{ marginRight: 12 }}
            />
          ))}
        </View>
      </View>

      {/* Row 2 Skeleton */}
      <View style={styles.sectionSkeleton}>
        <ShimmerItem width={200} height={18} style={styles.titleShimmer} />
        <View style={styles.cardsRow}>
          {[1, 2, 3, 4].map((i) => (
            <ShimmerItem
              key={i}
              width={125}
              height={185}
              borderRadius={8}
              style={{ marginRight: 12 }}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroSkeleton: {
    marginBottom: 20,
  },
  sectionSkeleton: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  titleShimmer: {
    marginBottom: 12,
  },
  cardsRow: {
    flexDirection: 'row',
  },
});

export default HomeSkeleton;

