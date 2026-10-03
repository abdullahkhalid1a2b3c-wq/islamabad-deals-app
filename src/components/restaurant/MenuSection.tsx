import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../ui/Text';
import { Card } from '../ui/Card';
import { MenuSection as MenuSectionType, MenuItem } from '../../types/domain';
import { formatPKR } from '../../utils/price';
import { theme } from '../../theme';

export interface MenuSectionProps {
  section: MenuSectionType;
  initialExpanded?: boolean;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  section,
  initialExpanded = true,
}) => {
  const [expanded, setExpanded] = useState(initialExpanded);

  return (
    <Card style={styles.card}>
      {/* Section Header */}
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${section.title} menu section`}
      >
        <Text variant="subtitle" style={styles.sectionTitle}>
          {section.title} ({section.items.length})
        </Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={theme.colors.textMuted}
        />
      </TouchableOpacity>

      {/* Items List */}
      {expanded ? (
        <View style={styles.itemsContainer}>
          {section.items.map((item: MenuItem, idx: number) => {
            const isLast = idx === section.items.length - 1;
            return (
              <View
                key={item.id}
                style={[
                  styles.itemRow,
                  !isLast && styles.borderBottom,
                  !item.isAvailable && styles.unavailableRow,
                ]}
              >
                <View style={styles.itemInfo}>
                  <View style={styles.titleRow}>
                    <Text
                      variant="subtitle"
                      style={[styles.itemName, !item.isAvailable && styles.dimmedText]}
                    >
                      {item.name}
                    </Text>
                    {!item.isAvailable ? (
                      <View style={styles.unavailableBadge}>
                        <Text variant="caption" style={styles.unavailableBadgeText}>
                          Unavailable
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {item.description ? (
                    <Text
                      variant="caption"
                      color={theme.colors.textMuted}
                      style={[styles.itemDescription, !item.isAvailable && styles.dimmedText]}
                      numberOfLines={2}
                    >
                      {item.description}
                    </Text>
                  ) : null}

                  <Text
                    variant="subtitle"
                    color={theme.colors.primary}
                    style={[styles.itemPrice, !item.isAvailable && styles.dimmedText]}
                  >
                    {formatPKR(item.pricePKR)}
                  </Text>
                </View>

                {item.imageUrl ? (
                  <View style={styles.itemImageContainer}>
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={[styles.itemImage, !item.isAvailable && styles.dimmedImage]}
                      contentFit="cover"
                    />
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      ) : null}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  sectionTitle: {
    fontWeight: '700',
    color: theme.colors.text,
  },
  itemsContainer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingHorizontal: theme.spacing.lg,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  unavailableRow: {
    opacity: 0.65,
  },
  itemInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemName: {
    fontWeight: '600',
    fontSize: 15,
  },
  dimmedText: {
    color: theme.colors.textMuted,
  },
  unavailableBadge: {
    backgroundColor: theme.colors.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radii.sm,
  },
  unavailableBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  itemDescription: {
    marginTop: 2,
  },
  itemPrice: {
    fontWeight: '700',
    marginTop: 6,
  },
  itemImageContainer: {
    width: 72,
    height: 72,
    borderRadius: theme.radii.sm,
    overflow: 'hidden',
    backgroundColor: theme.colors.border,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  dimmedImage: {
    opacity: 0.5,
  },
});
