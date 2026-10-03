import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../ui/Text';
import { useToast } from '../ui/Toast';
import { theme } from '../../theme';

export interface PromoCodeProps {
  code?: string;
}

export const PromoCode: React.FC<PromoCodeProps> = ({ code }) => {
  const { showToast } = useToast();

  if (!code) return null;

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(code);
      showToast('Code copied to clipboard!', 'success');
    } catch (err) {
      showToast('Failed to copy code', 'error');
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="caption" color={theme.colors.textMuted} style={styles.label}>
        PROMO CODE
      </Text>
      <View style={styles.dashedBox}>
        <Text variant="subtitle" style={styles.codeText}>
          {code}
        </Text>
        <TouchableOpacity
          style={styles.copyButton}
          onPress={handleCopy}
          accessibilityRole="button"
          accessibilityLabel="Copy promo code"
        >
          <Ionicons name="copy-outline" size={16} color={theme.colors.primary} />
          <Text variant="caption" style={styles.copyButtonText}>
            Copy
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.md,
  },
  label: {
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
    letterSpacing: 0.5,
  },
  dashedBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    borderRadius: theme.radii.card,
    backgroundColor: 'rgba(255, 90, 31, 0.05)',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  codeText: {
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: 1,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 4,
  },
  copyButtonText: {
    fontWeight: '700',
    color: theme.colors.primary,
  },
});
