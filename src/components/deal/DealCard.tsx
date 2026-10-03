import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { DealSummary } from '../../types/domain';
import { Card } from '../ui/Card';
import { Text } from '../ui/Text';
import { DealBadge } from './DealBadge';
import { ExpiryPill } from './ExpiryPill';
import { formatPKR } from '../../utils/price';
import { formatDistance } from '../../utils/distance';
import { theme } from '../../theme';

export type DealCardVariant = 'hero' | 'compact' | 'row';

export interface DealCardProps {
  deal: DealSummary;
  variant?: DealCardVariant;
  onPress?: () => void;
  onFavoritePress?: () => void;
  isFavorite?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const DealCard: React.FC<DealCardProps> = ({
  deal,
  variant = 'compact',
  onPress,
  onFavoritePress,
  isFavorite = false,
}) => {
  const [imgError, setImgError] = useState(false);
  const fallbackImage =
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80';

  const hasOriginalPrice = deal.originalPricePKR && deal.originalPricePKR > deal.dealPricePKR;

  if (variant === 'hero') {
    return (
      <Card onPress={onPress} style={styles.heroCard} accessibilityLabel={`Deal: ${deal.title}`}>
        <View style={styles.heroImageContainer}>
          <Image
            source={{ uri: imgError ? fallbackImage : deal.imageUrl }}
            style={styles.heroImage}
            onError={() => setImgError(true)}
            contentFit="cover"
            transition={300}
          />
          <View style={styles.badgeOverlay}>
            <DealBadge
              dealType={deal.dealType}
              discountValue={deal.discountValue}
              dealPricePKR={deal.dealPricePKR}
            />
          </View>
          <TouchableOpacity
            style={styles.heartOverlay}
            onPress={onFavoritePress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Toggle Favorite"
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite ? theme.colors.danger : theme.colors.text}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.heroContent}>
          <View style={styles.restaurantRow}>
            <Text variant="caption" color={theme.colors.textMuted} numberOfLines={1}>
              {deal.restaurant.name} • {deal.restaurant.areaName}
            </Text>
            {deal.restaurant.distanceM !== undefined ? (
              <Text variant="caption" color={theme.colors.textMuted}>
                {formatDistance(deal.restaurant.distanceM)}
              </Text>
            ) : null}
          </View>

          <Text variant="subtitle" numberOfLines={2} style={styles.title}>
            {deal.title}
          </Text>

          <View style={styles.footerRow}>
            <View style={styles.priceContainer}>
              <Text variant="title" color={theme.colors.primary} style={styles.dealPrice}>
                {formatPKR(deal.dealPricePKR)}
              </Text>
              {hasOriginalPrice ? (
                <Text variant="caption" color={theme.colors.textMuted} style={styles.originalPrice}>
                  {formatPKR(deal.originalPricePKR)}
                </Text>
              ) : null}
            </View>
            <ExpiryPill deal={deal} />
          </View>
        </View>
      </Card>
    );
  }

  if (variant === 'row') {
    return (
      <Card onPress={onPress} style={styles.rowCard} accessibilityLabel={`Deal: ${deal.title}`}>
        <View style={styles.rowImageContainer}>
          <Image
            source={{ uri: imgError ? fallbackImage : deal.imageUrl }}
            style={styles.rowImage}
            onError={() => setImgError(true)}
            contentFit="cover"
          />
          <View style={styles.rowBadgeOverlay}>
            <DealBadge dealType={deal.dealType} discountValue={deal.discountValue} />
          </View>
        </View>

        <View style={styles.rowContent}>
          <Text variant="caption" color={theme.colors.textMuted} numberOfLines={1}>
            {deal.restaurant.name} • {deal.restaurant.areaName}
          </Text>

          <Text variant="body" numberOfLines={2} style={styles.rowTitle}>
            {deal.title}
          </Text>

          <View style={styles.rowFooter}>
            <View style={styles.priceContainer}>
              <Text variant="subtitle" color={theme.colors.primary} style={styles.boldText}>
                {formatPKR(deal.dealPricePKR)}
              </Text>
              {hasOriginalPrice ? (
                <Text variant="caption" color={theme.colors.textMuted} style={styles.originalPrice}>
                  {formatPKR(deal.originalPricePKR)}
                </Text>
              ) : null}
            </View>
            <ExpiryPill deal={deal} />
          </View>
        </View>
      </Card>
    );
  }

  // Compact card (horizontal scroll lists)
  return (
    <Card onPress={onPress} style={styles.compactCard} accessibilityLabel={`Deal: ${deal.title}`}>
      <View style={styles.compactImageContainer}>
        <Image
          source={{ uri: imgError ? fallbackImage : deal.imageUrl }}
          style={styles.compactImage}
          onError={() => setImgError(true)}
          contentFit="cover"
        />
        <View style={styles.badgeOverlay}>
          <DealBadge dealType={deal.dealType} discountValue={deal.discountValue} />
        </View>
        <TouchableOpacity style={styles.heartOverlay} onPress={onFavoritePress} activeOpacity={0.8}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={18}
            color={isFavorite ? theme.colors.danger : theme.colors.text}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.compactContent}>
        <Text variant="caption" color={theme.colors.textMuted} numberOfLines={1}>
          {deal.restaurant.name} • {deal.restaurant.areaName}
        </Text>

        <Text variant="subtitle" numberOfLines={2} style={styles.compactTitle}>
          {deal.title}
        </Text>

        <View style={styles.compactFooter}>
          <View style={styles.priceContainer}>
            <Text variant="subtitle" color={theme.colors.primary} style={styles.boldText}>
              {formatPKR(deal.dealPricePKR)}
            </Text>
            {hasOriginalPrice ? (
              <Text variant="caption" color={theme.colors.textMuted} style={styles.originalPrice}>
                {formatPKR(deal.originalPricePKR)}
              </Text>
            ) : null}
          </View>
          <ExpiryPill deal={deal} />
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    width: SCREEN_WIDTH * 0.82,
    marginRight: theme.spacing.md,
  },
  heroImageContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
    backgroundColor: theme.colors.border,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  badgeOverlay: {
    position: 'absolute',
    top: theme.spacing.sm,
    left: theme.spacing.sm,
  },
  heartOverlay: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    width: 32,
    height: 32,
    borderRadius: theme.radii.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  heroContent: {
    padding: theme.spacing.md,
  },
  restaurantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  dealPrice: {
    fontWeight: '700',
    marginRight: theme.spacing.xs,
  },
  boldText: {
    fontWeight: '700',
    marginRight: theme.spacing.xs,
  },
  originalPrice: {
    textDecorationLine: 'line-through',
  },

  // Row Variant
  rowCard: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    padding: theme.spacing.sm,
  },
  rowImageContainer: {
    width: 100,
    height: 100,
    borderRadius: theme.radii.sm,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: theme.colors.border,
  },
  rowImage: {
    width: '100%',
    height: '100%',
  },
  rowBadgeOverlay: {
    position: 'absolute',
    top: 4,
    left: 4,
  },
  rowContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
    justifyContent: 'space-between',
  },
  rowTitle: {
    fontWeight: '600',
    color: theme.colors.text,
  },
  rowFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Compact Variant
  compactCard: {
    width: 220,
    marginRight: theme.spacing.md,
  },
  compactImageContainer: {
    height: 130,
    width: '100%',
    position: 'relative',
    backgroundColor: theme.colors.border,
  },
  compactImage: {
    width: '100%',
    height: '100%',
  },
  compactContent: {
    padding: theme.spacing.sm,
  },
  compactTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    marginVertical: 4,
    height: 36,
  },
  compactFooter: {
    marginTop: theme.spacing.xs,
  },
});
