import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../ui/Text';
import {
  normalizePhone,
  normalizeUrl,
  normalizeInstagram,
  buildDirectionsUrl,
} from '../../utils/links';
import { openExternalUrl } from '../../utils/openExternal';
import { useToast } from '../ui/Toast';
import { theme } from '../../theme';

export interface ActionRowProps {
  phone?: string | null;
  location?: { lat: number; lng: number; name?: string } | null;
  website?: string | null;
  instagram?: string | null;
}

export const ActionRow: React.FC<ActionRowProps> = ({
  phone,
  location,
  website,
  instagram,
}) => {
  const { showToast } = useToast();

  const phoneUrl = normalizePhone(phone);
  const websiteUrl = normalizeUrl(website);
  const instagramUrl = normalizeInstagram(instagram);
  const directionsUrl = location
    ? buildDirectionsUrl({ lat: location.lat, lng: location.lng, name: location.name })
    : null;

  const actions = [
    phoneUrl && {
      key: 'call',
      label: 'Call',
      icon: 'call-outline' as const,
      onPress: () => openExternalUrl(phoneUrl, showToast),
    },
    directionsUrl && {
      key: 'directions',
      label: 'Directions',
      icon: 'location-outline' as const,
      onPress: () => openExternalUrl(directionsUrl, showToast),
    },
    websiteUrl && {
      key: 'website',
      label: 'Website',
      icon: 'globe-outline' as const,
      onPress: () => openExternalUrl(websiteUrl, showToast),
    },
    instagramUrl && {
      key: 'instagram',
      label: 'Instagram',
      icon: 'logo-instagram' as const,
      onPress: () => openExternalUrl(instagramUrl, showToast),
    },
  ].filter(Boolean) as Array<{
    key: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
  }>;

  if (!actions.length) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {actions.map((act) => (
          <TouchableOpacity
            key={act.key}
            style={styles.actionPill}
            onPress={act.onPress}
            accessibilityRole="button"
            accessibilityLabel={act.label}
          >
            <Ionicons name={act.icon} size={16} color={theme.colors.primary} />
            <Text variant="caption" style={styles.actionText}>
              {act.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.md,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 40,
    gap: 6,
    ...theme.shadows.sm,
  },
  actionText: {
    fontWeight: '600',
    color: theme.colors.text,
  },
});
