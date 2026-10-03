import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { RestaurantSummary } from '../../types/domain';
import { Card } from '../ui/Card';
import { Text } from '../ui/Text';
import { Rating } from '../ui/Rating';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { getOpenStatus } from '../../utils/openingHours';
import { formatDistance } from '../../utils/distance';
import { theme } from '../../theme';

export type RestaurantCardVariant = 'compact' | 'row';

export interface RestaurantCardProps {
  restaurant: RestaurantSummary;
  variant?: RestaurantCardVariant;
  onPress?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  variant = 'compact',
  onPress,
}) => {
  const [coverErr, setCoverErr] = useState(false);
  const fallbackCover =
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80';

  const { isOpen, label: openStatusLabel } = getOpenStatus(restaurant.openingHours);
  const priceRangeStr = '$'.repeat(restaurant.priceRange || 2);
  const cuisineStr = restaurant.cuisine ? restaurant.cuisine.slice(0, 2).join(' • ') : '';

  if (variant === 'row') {
    return (
      <Card
        onPress={onPress}
        style={styles.rowCard}
        accessibilityLabel={`Restaurant: ${restaurant.name}`}
      >
        <View style={styles.rowCoverContainer}>
          <Image
            source={{ uri: coverErr || !restaurant.coverUrl ? fallbackCover : restaurant.coverUrl }}
            style={styles.rowCover}
            onError={() => setCoverErr(true)}
            contentFit="cover"
          />
          <View style={styles.rowLogoBadge}>
            <Avatar uri={restaurant.logoUrl} size={36} />
          </View>
        </View>

        <View style={styles.rowContent}>
          <View style={styles.rowHeader}>
            <Text variant="subtitle" numberOfLines={1} style={styles.nameText}>
              {restaurant.name}
            </Text>
            <Badge label={isOpen ? 'OPEN' : 'CLOSED'} variant={isOpen ? 'open' : 'closed'} />
          </View>

          <View style={styles.subRow}>
            <Rating rating={restaurant.rating} reviewCount={restaurant.reviewCount} />
            <Text variant="caption" color={theme.colors.textMuted} style={styles.dotSeparator}>
              •
            </Text>
            <Text variant="caption" color={theme.colors.textMuted}>
              {cuisineStr}
            </Text>
            <Text variant="caption" color={theme.colors.textMuted} style={styles.dotSeparator}>
              •
            </Text>
            <Text variant="caption" color={theme.colors.primary}>
              {priceRangeStr}
            </Text>
          </View>

          <View style={styles.rowFooter}>
            <Text variant="caption" color={theme.colors.textMuted}>
              {restaurant.areaName}
            </Text>
            {restaurant.distanceM !== undefined ? (
              <Text variant="caption" color={theme.colors.textMuted}>
                {formatDistance(restaurant.distanceM)}
              </Text>
            ) : null}
          </View>
        </View>
      </Card>
    );
  }

  // Compact variant
  return (
    <Card
      onPress={onPress}
      style={styles.compactCard}
      accessibilityLabel={`Restaurant: ${restaurant.name}`}
    >
      <View style={styles.compactCoverContainer}>
        <Image
          source={{ uri: coverErr || !restaurant.coverUrl ? fallbackCover : restaurant.coverUrl }}
          style={styles.compactCover}
          onError={() => setCoverErr(true)}
          contentFit="cover"
        />
        <View style={styles.compactLogoContainer}>
          <Avatar uri={restaurant.logoUrl} size={32} />
        </View>
        <View style={styles.openBadgeOverlay}>
          <Badge label={isOpen ? 'OPEN' : 'CLOSED'} variant={isOpen ? 'open' : 'closed'} />
        </View>
      </View>

      <View style={styles.compactContent}>
        <Text variant="subtitle" numberOfLines={1} style={styles.nameText}>
          {restaurant.name}
        </Text>

        <View style={styles.ratingRow}>
          <Rating rating={restaurant.rating} reviewCount={restaurant.reviewCount} />
          <Text variant="caption" color={theme.colors.primary} style={styles.priceTag}>
            {priceRangeStr}
          </Text>
        </View>

        <View style={styles.compactFooter}>
          <Text variant="caption" color={theme.colors.textMuted} numberOfLines={1}>
            {restaurant.areaName}{' '}
            {restaurant.distanceM ? `• ${formatDistance(restaurant.distanceM)}` : ''}
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  compactCard: {
    width: 200,
    marginRight: theme.spacing.md,
  },
  compactCoverContainer: {
    height: 110,
    width: '100%',
    position: 'relative',
    backgroundColor: theme.colors.border,
  },
  compactCover: {
    width: '100%',
    height: '100%',
  },
  compactLogoContainer: {
    position: 'absolute',
    bottom: -12,
    left: theme.spacing.sm,
    borderRadius: theme.radii.full,
    borderWidth: 2,
    borderColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
  openBadgeOverlay: {
    position: 'absolute',
    top: theme.spacing.xs,
    right: theme.spacing.xs,
  },
  compactContent: {
    padding: theme.spacing.sm,
    paddingTop: theme.spacing.md,
  },
  nameText: {
    fontWeight: '700',
    color: theme.colors.text,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  priceTag: {
    fontWeight: '700',
  },
  compactFooter: {
    marginTop: 2,
  },

  // Row Variant
  rowCard: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    padding: theme.spacing.sm,
  },
  rowCoverContainer: {
    width: 90,
    height: 90,
    borderRadius: theme.radii.sm,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: theme.colors.border,
  },
  rowCover: {
    width: '100%',
    height: '100%',
  },
  rowLogoBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
  },
  rowContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
    justifyContent: 'space-between',
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  dotSeparator: {
    marginHorizontal: 4,
  },
  rowFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
