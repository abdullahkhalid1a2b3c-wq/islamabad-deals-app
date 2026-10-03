import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../ui/Text';
import { Card } from '../ui/Card';
import { theme } from '../../theme';

export interface TermsAccordionProps {
  terms?: string[];
}

export const TermsAccordion: React.FC<TermsAccordionProps> = ({ terms = [] }) => {
  const [expanded, setExpanded] = useState(false);

  if (!terms || terms.length === 0) return null;

  return (
    <Card style={styles.card}>
      <TouchableOpacity
        style={styles.headerRow}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Terms and Conditions"
      >
        <Text variant="subtitle" style={styles.title}>
          Terms & Conditions
        </Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={theme.colors.textMuted}
        />
      </TouchableOpacity>

      {expanded ? (
        <View style={styles.termsContent}>
          {terms.map((term, idx) => (
            <View key={idx} style={styles.termRow}>
              <Text variant="caption" color={theme.colors.primary} style={styles.bullet}>
                •
              </Text>
              <Text variant="caption" color={theme.colors.text} style={styles.termText}>
                {term}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: theme.spacing.sm,
    padding: 0,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  title: {
    fontWeight: '700',
  },
  termsContent: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  termRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bullet: {
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 18,
  },
  termText: {
    flex: 1,
    lineHeight: 18,
  },
});
