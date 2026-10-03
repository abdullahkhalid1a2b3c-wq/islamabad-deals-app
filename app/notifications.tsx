import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../src/components/ui/Screen';
import { Text } from '../src/components/ui/Text';
import { EmptyState } from '../src/components/ui/EmptyState';
import { theme } from '../src/theme';

export default function NotificationsScreen() {
  const router = useRouter();

  return (
    <Screen style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text variant="subtitle" style={styles.headerTitle}>
          Notifications
        </Text>
      </View>

      <EmptyState
        title="No New Alerts"
        message="Deal drops, flash sales, and order updates will appear here. Coming in a later step."
        icon="notifications-outline"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  backButton: {
    padding: theme.spacing.xs,
    marginRight: theme.spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  headerTitle: {
    fontWeight: '700',
  },
});
