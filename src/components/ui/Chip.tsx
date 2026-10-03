import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { theme } from '../../theme';

export interface ChipProps extends TouchableOpacityProps {
  label: string;
  selected?: boolean;
  icon?: React.ReactNode;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  icon,
  style,
  onPress,
  accessibilityLabel,
  ...props
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel || label}
      style={[styles.chip, selected ? styles.selectedChip : styles.unselectedChip, style]}
      {...props}
    >
      {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
      <Text
        variant="caption"
        color={selected ? theme.colors.surface : theme.colors.text}
        style={styles.label}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.chip,
    minHeight: 44,
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  selectedChip: {
    backgroundColor: theme.colors.primary,
  },
  unselectedChip: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  iconContainer: {
    marginRight: theme.spacing.xs,
  },
  label: {
    fontWeight: '600',
  },
});
