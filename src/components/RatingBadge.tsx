import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { formatRating } from '../utils/formatters';

interface RatingBadgeProps {
  rating?: number | null;
  size?: 'sm' | 'md' | 'lg';
  showStar?: boolean;
}

export const RatingBadge: React.FC<RatingBadgeProps> = ({
  rating,
  size = 'md',
  showStar = true,
}) => {
  const formatted = formatRating(rating);
  const iconSize = size === 'sm' ? 10 : size === 'lg' ? 14 : 12;

  return (
    <View style={[styles.badge, styles[size]]}>
      {showStar && <Star size={iconSize} color="#EAB308" fill="#EAB308" />}
      <Text style={[styles.text, styles[`${size}Text`]]}>{formatted}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 4,
  },
  sm: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  md: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  lg: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 5,
  },
  text: {
    color: colors.text,
    fontWeight: '700',
  },
  smText: {
    fontSize: 10,
  },
  mdText: {
    fontSize: 11,
  },
  lgText: {
    fontSize: 13,
  },
});

export default RatingBadge;

