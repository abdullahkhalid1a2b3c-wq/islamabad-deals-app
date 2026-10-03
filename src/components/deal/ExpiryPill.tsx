import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DealSummary } from '../../types/domain';
import { getDealExpiry } from '../../utils/dealStatus';
import { Text } from '../ui/Text';
import { theme } from '../../theme';

export interface ExpiryPillProps {
  deal: DealSummary;
}

export const ExpiryPill: React.FC<ExpiryPillProps> = ({ deal }) => {
  const { state, label } = getDealExpiry(deal);

  const getColors = () => {
    switch (state) {
      case 'ending_soon':
        return { bg: '#FEE2E2', text: theme.colors.danger, icon: theme.colors.danger };
      case 'ending_today':
        return { bg: '#FEF3C7', text: '#92400E', icon: '#D97706' };
      case 'expired':
        return { bg: '#F3F4F6', text: theme.colors.textMuted, icon: theme.colors.textMuted };
      case 'active':
      default:
        return { bg: '#E0F2FE', text: '#075985', icon: '#0284C7' };
    }
  };

  const colors = getColors();

  return (
    <View style={[styles.pill, { backgroundColor: colors.bg }]}>
      <Ionicons name="time-outline" size={12} color={colors.icon} style={styles.icon} />
      <Text variant="caption" color={colors.text} style={styles.text}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radii.chip,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});
