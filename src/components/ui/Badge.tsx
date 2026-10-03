import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { Text } from './Text';
import { theme } from '../../theme';

export type BadgeVariant = 'discount' | 'expiring' | 'open' | 'closed' | 'featured' | 'neutral';

export interface BadgeProps extends ViewProps {
  label: string;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  icon,
  style,
  ...props
}) => {
  const getBadgeStyle = () => {
    switch (variant) {
      case 'discount':
        return { backgroundColor: theme.colors.primary, textColor: theme.colors.surface };
      case 'expiring':
        return { backgroundColor: theme.colors.warning, textColor: theme.colors.text };
      case 'open':
        return { backgroundColor: theme.colors.success, textColor: theme.colors.surface };
      case 'closed':
        return { backgroundColor: theme.colors.danger, textColor: theme.colors.surface };
      case 'featured':
        return { backgroundColor: theme.colors.accent, textColor: theme.colors.text };
      case 'neutral':
      default:
        return { backgroundColor: theme.colors.surface, textColor: theme.colors.textMuted };
    }
  };

  const { backgroundColor, textColor } = getBadgeStyle();

  return (
    <View style={[styles.badge, { backgroundColor }, style]} {...props}>
      {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
      <Text variant="caption" color={textColor} style={styles.text}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.sm,
    alignSelf: 'flex-start',
  },
  iconContainer: {
    marginRight: theme.spacing.xs,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    textTransform: 'uppercase',
  },
});
