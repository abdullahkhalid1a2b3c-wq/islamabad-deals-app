import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Text } from './Text';
import { theme } from '../../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  accessibilityLabel,
  ...props
}) => {
  const isInteractive = !loading && !disabled;

  const getContainerStyle = (): ViewStyle => {
    let bgStyle: ViewStyle = {};
    if (variant === 'primary') {
      bgStyle = { backgroundColor: theme.colors.primary };
    } else if (variant === 'secondary') {
      bgStyle = {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
      };
    } else if (variant === 'ghost') {
      bgStyle = { backgroundColor: 'transparent' };
    }

    let sizeStyle: ViewStyle = {};
    if (size === 'sm') {
      sizeStyle = {
        paddingVertical: theme.spacing.xs,
        paddingHorizontal: theme.spacing.md,
        minHeight: 44,
      };
    } else if (size === 'md') {
      sizeStyle = {
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.lg,
        minHeight: 44,
      };
    } else if (size === 'lg') {
      sizeStyle = {
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.xl,
        minHeight: 52,
      };
    }

    return {
      borderRadius: theme.radii.button,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      opacity: disabled ? 0.5 : 1,
      width: fullWidth ? '100%' : undefined,
      ...bgStyle,
      ...sizeStyle,
    };
  };

  const getTextColor = (): string => {
    if (variant === 'primary') return theme.colors.surface;
    if (variant === 'secondary') return theme.colors.text;
    return theme.colors.primary;
  };

  const getTextVariant = () => {
    if (size === 'sm') return 'caption' as const;
    if (size === 'lg') return 'subtitle' as const;
    return 'body' as const;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={!isInteractive}
      style={[getContainerStyle(), style]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled, busy: loading }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}
          <Text variant={getTextVariant()} color={getTextColor()} style={styles.text}>
            {title}
          </Text>
          {rightIcon ? <View style={styles.iconRight}>{rightIcon}</View> : null}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: theme.spacing.xs,
  },
  iconRight: {
    marginLeft: theme.spacing.xs,
  },
  text: {
    fontWeight: '600',
  },
});
