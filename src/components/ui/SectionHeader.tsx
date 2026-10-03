import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewProps } from 'react-native';
import { Text } from './Text';
import { theme } from '../../theme';

export interface SectionHeaderProps extends ViewProps {
  title: string;
  subtitle?: string;
  onSeeAll?: () => void;
  seeAllText?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  onSeeAll,
  seeAllText = 'See all',
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, style]} {...props}>
      <View style={styles.textContainer}>
        <Text variant="title" style={styles.title}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" color={theme.colors.textMuted}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {onSeeAll ? (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onSeeAll}
          accessibilityRole="button"
          accessibilityLabel={`${seeAllText} for ${title}`}
          style={styles.seeAllButton}
        >
          <Text variant="subtitle" color={theme.colors.primary} style={styles.seeAllText}>
            {seeAllText}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: theme.colors.text,
  },
  seeAllButton: {
    paddingVertical: theme.spacing.xs,
    paddingLeft: theme.spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  seeAllText: {
    fontSize: 14,
  },
});
