import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Text';
import { theme } from '../../theme';

export interface RatingProps extends ViewProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md';
}

export const Rating: React.FC<RatingProps> = ({
  rating,
  reviewCount,
  size = 'sm',
  style,
  ...props
}) => {
  const iconSize = size === 'sm' ? 14 : 18;
  const formattedRating = rating ? rating.toFixed(1) : '0.0';

  return (
    <View style={[styles.container, style]} {...props}>
      <Ionicons name="star" size={iconSize} color={theme.colors.accent} />
      <Text variant="caption" color={theme.colors.text} style={styles.ratingText}>
        {formattedRating}
      </Text>
      {reviewCount !== undefined ? (
        <Text variant="caption" color={theme.colors.textMuted} style={styles.countText}>
          ({reviewCount})
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontWeight: '700',
    marginLeft: theme.spacing.xs,
  },
  countText: {
    marginLeft: 2,
  },
});
