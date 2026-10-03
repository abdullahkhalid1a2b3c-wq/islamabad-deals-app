import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Text';
import { Button } from './Button';
import { theme } from '../../theme';

export interface ErrorStateProps extends ViewProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to load content',
  message = 'Please check your connection and try again.',
  onRetry,
  retryText = 'Try again',
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, style]} {...props}>
      <View style={styles.iconCircle}>
        <Ionicons name="alert-circle-outline" size={40} color={theme.colors.danger} />
      </View>
      <Text variant="subtitle" style={styles.title}>
        {title}
      </Text>
      <Text variant="body" color={theme.colors.textMuted} style={styles.message}>
        {message}
      </Text>
      {onRetry ? (
        <Button
          title={retryText}
          variant="primary"
          size="md"
          onPress={onRetry}
          leftIcon={<Ionicons name="refresh" size={18} color={theme.colors.surface} />}
        />
      ) : null}
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
    backgroundColor: '#FEE2E2', // light red tint derived from theme danger
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
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
});
