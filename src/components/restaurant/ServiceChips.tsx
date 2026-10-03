import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../ui/Text';
import { ServiceMode } from '../../types/domain';
import { theme } from '../../theme';

export interface ServiceChipsProps {
  availableModes?: ServiceMode[];
}

const ALL_SERVICES: Array<{ mode: ServiceMode; label: string }> = [
  { mode: 'dine_in', label: 'Dine-in' },
  { mode: 'takeaway', label: 'Takeaway' },
  { mode: 'delivery', label: 'Delivery' },
];

export const ServiceChips: React.FC<ServiceChipsProps> = ({
  availableModes = ['dine_in', 'takeaway', 'delivery'],
}) => {
  return (
    <View style={styles.container}>
      {ALL_SERVICES.map((srv) => {
        const isAvailable = availableModes.includes(srv.mode);
        return (
          <View
            key={srv.mode}
            style={[styles.chip, isAvailable ? styles.availableChip : styles.unavailableChip]}
          >
            <Ionicons
              name={isAvailable ? 'checkmark-circle' : 'close-circle'}
              size={16}
              color={isAvailable ? theme.colors.success : theme.colors.textMuted}
            />
            <Text
              variant="caption"
              style={[styles.chipText, !isAvailable && styles.unavailableText]}
            >
              {srv.label}
            </Text>
          </View>
        );
      })}
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
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.full,
    borderWidth: 1,
    gap: 6,
  },
  availableChip: {
    backgroundColor: 'rgba(22, 163, 74, 0.08)',
    borderColor: 'rgba(22, 163, 74, 0.2)',
  },
  unavailableChip: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
  chipText: {
    fontWeight: '600',
    color: theme.colors.text,
  },
  unavailableText: {
    color: theme.colors.textMuted,
    textDecorationLine: 'line-through',
  },
});
