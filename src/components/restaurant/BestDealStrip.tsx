import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../ui/Text';
import { BestDealSummary } from '../../types/domain';
import { theme } from '../../theme';

export interface BestDealStripProps {
  bestDeal: BestDealSummary;
  activeDealCount?: number;
}

export const BestDealStrip: React.FC<BestDealStripProps> = ({
  bestDeal,
  activeDealCount = 1,
}) => {
  let discountLabel = '';
  if (bestDeal.discountPercent) {
    discountLabel = `${bestDeal.discountPercent}% OFF`;
  } else if (bestDeal.dealType === 'bogo') {
    discountLabel = 'BUY 1 GET 1';
  } else if (bestDeal.title) {
    discountLabel = bestDeal.title;
  } else {
    discountLabel = 'SPECIAL DEAL';
  }

  const extraDealsCount = activeDealCount > 1 ? activeDealCount - 1 : 0;
  const extraDealsLabel =
    extraDealsCount > 0
      ? ` · ${extraDealsCount} more deal${extraDealsCount > 1 ? 's' : ''}`
      : '';

  return (
    <View style={styles.container}>
      <Ionicons name="flame" size={14} color={theme.colors.primary} style={styles.icon} />
      <Text variant="caption" style={styles.text} numberOfLines={1}>
        <Text style={styles.boldDiscount}>{discountLabel}</Text>
        {extraDealsLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 90, 31, 0.08)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radii.sm,
    marginTop: theme.spacing.xs,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    color: theme.colors.primaryDark,
    fontSize: 12,
  },
  boldDiscount: {
    fontWeight: '700',
    color: theme.colors.primary,
  },
});
