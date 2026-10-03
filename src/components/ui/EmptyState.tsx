import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Text';
import { theme } from '../../theme';

export interface EmptyStateProps extends ViewProps {
  title: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon = 'fast-food-outline',
  action,
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, style]} {...props}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={36} color={theme.colors.textMuted} />
      </View>
      <Text variant="subtitle" style={styles.title}>
        {title}
      </Text>
      {message ? (
        <Text variant="body" color={theme.colors.textMuted} style={styles.message}>
          {message}
        </Text>
      ) : null}
      {action ? <View style={styles.actionContainer}>{action}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  title: {
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
    color: theme.colors.text,
  },
  message: {
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  actionContainer: {
    marginTop: theme.spacing.sm,
  },
});
