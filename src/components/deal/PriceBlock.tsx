import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../ui/Text';
import { formatPKR, calcSavings, calcDiscountPercent } from '../../utils/price';
import { DealType } from '../../types/domain';
import { theme } from '../../theme';

export interface PriceBlockProps {
  dealPricePKR?: number | null;
  originalPricePKR?: number | null;
  discountPercent?: number | null;
  dealType?: DealType;
}

export const PriceBlock: React.FC<PriceBlockProps> = ({
  dealPricePKR,
  originalPricePKR,
  discountPercent,
  dealType,
}) => {
  const hasOriginalPrice = originalPricePKR !== undefined && originalPricePKR !== null && originalPricePKR > 0;
  const hasDealPrice = dealPricePKR !== undefined && dealPricePKR !== null && dealPricePKR > 0;

  const savingsPKR = hasOriginalPrice && hasDealPrice ? calcSavings(originalPricePKR!, dealPricePKR!) : 0;
  const computedPercent =
    discountPercent ||
    (hasOriginalPrice && hasDealPrice ? calcDiscountPercent(originalPricePKR!, dealPricePKR!) : 0);

  // Scenario 1: No numeric prices (e.g. Percentage off or BOGO without price tags)
  if (!hasDealPrice && !hasOriginalPrice) {
    if (computedPercent > 0) {
      return (
        <View style={styles.container}>
          <Text variant="display" color={theme.colors.primary} style={styles.discountOnlyTitle}>
            {computedPercent}% OFF
          </Text>
        </View>
      );
    }
    if (dealType === 'bogo') {
      return (
        <View style={styles.container}>
          <Text variant="display" color={theme.colors.primary} style={styles.discountOnlyTitle}>
            BUY 1 GET 1 FREE
          </Text>
        </View>
      );
    }
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.priceRow}>
        {hasDealPrice ? (
          <Text variant="display" color={theme.colors.primary} style={styles.dealPriceText}>
            {formatPKR(dealPricePKR!)}
          </Text>
        ) : null}

        {hasOriginalPrice && originalPricePKR! > (dealPricePKR || 0) ? (
          <Text variant="title" color={theme.colors.textMuted} style={styles.originalPriceText}>
            {formatPKR(originalPricePKR!)}
          </Text>
        ) : null}
      </View>

      {/* Savings pill / text */}
      {savingsPKR > 0 || computedPercent > 0 ? (
        <View style={styles.savingsBadge}>
          <Text variant="caption" style={styles.savingsBadgeText}>
            {savingsPKR > 0
              ? `You save ${formatPKR(savingsPKR)}${computedPercent > 0 ? ` (${computedPercent}%)` : ''}`
              : `${computedPercent}% OFF`}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: theme.spacing.sm,
  },
  dealPriceText: {
    fontSize: 28,
    fontWeight: '800',
  },
  originalPriceText: {
    textDecorationLine: 'line-through',
    fontSize: 18,
    fontWeight: '500',
  },
  discountOnlyTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  savingsBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
    borderRadius: theme.radii.full,
    marginTop: theme.spacing.xs,
  },
  savingsBadgeText: {
    color: theme.colors.success,
    fontWeight: '700',
    fontSize: 13,
  },
});
