import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../ui/Text';
import { theme } from '../../theme';

export interface FeatureChipsProps {
  features?: string[];
}

export const FeatureChips: React.FC<FeatureChipsProps> = ({ features = [] }) => {
  if (!features || features.length === 0) return null;

  return (
    <View style={styles.container}>
      {features.map((feat, idx) => (
        <View key={idx} style={styles.chip}>
          <Ionicons name="sparkles" size={12} color={theme.colors.primary} />
          <Text variant="caption" style={styles.chipText}>
            {feat}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginVertical: theme.spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.chip,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 6,
  },
  chipText: {
    fontWeight: '500',
    color: theme.colors.text,
  },
});
