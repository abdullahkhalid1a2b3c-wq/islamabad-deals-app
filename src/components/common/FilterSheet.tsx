import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../ui/Text';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Chip';
import { useExploreFiltersStore, RestaurantSortOption } from '../../store/exploreFilters';
import { useCategories } from '../../features/deals/hooks';
import { useAreas } from '../../features/location/useAreas';
import { Area } from '../../types/domain';
import { theme } from '../../theme';

export interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply?: () => void;
}

const SORT_OPTIONS: Array<{ label: string; value: RestaurantSortOption }> = [
  { label: 'Popular', value: 'popular' },
  { label: 'Nearest', value: 'nearest' },
  { label: 'Top Rated', value: 'top_rated' },
  { label: 'Newest', value: 'newest' },
];

const PRICE_OPTIONS = [
  { label: '$ (Budget)', value: 1 },
  { label: '$$ (Moderate)', value: 2 },
  { label: '$$$ (Expensive)', value: 3 },
  { label: '$$$$ (Splurge)', value: 4 },
];

export const FilterSheet: React.FC<FilterSheetProps> = ({ visible, onClose, onApply }) => {
  const store = useExploreFiltersStore();
  const { data: categories = [] } = useCategories();
  const { data: areas = [] } = useAreas();

  // Local draft filter state before user taps Apply
  const [draftCategorySlug, setDraftCategorySlug] = useState<string | null>(store.categorySlug);
  const [draftAreaId, setDraftAreaId] = useState<string | null>(store.areaId);
  const [draftPriceRange, setDraftPriceRange] = useState<number | null>(store.priceRange);
  const [draftOpenNow, setDraftOpenNow] = useState<boolean>(store.openNow);
  const [draftSort, setDraftSort] = useState<RestaurantSortOption>(store.sort);

  useEffect(() => {
    if (visible) {
      setDraftCategorySlug(store.categorySlug);
      setDraftAreaId(store.areaId);
      setDraftPriceRange(store.priceRange);
      setDraftOpenNow(store.openNow);
      setDraftSort(store.sort);
    }
  }, [visible, store.categorySlug, store.areaId, store.priceRange, store.openNow, store.sort]);

  const handleApply = () => {
    store.setCategorySlug(draftCategorySlug);
    store.setAreaId(draftAreaId);
    store.setPriceRange(draftPriceRange);
    store.setOpenNow(draftOpenNow);
    store.setSort(draftSort);
    onApply?.();
    onClose();
  };

  const handleReset = () => {
    setDraftCategorySlug(null);
    setDraftAreaId(null);
    setDraftPriceRange(null);
    setDraftOpenNow(false);
    setDraftSort('popular');
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <View style={styles.sheetContainer}>
        <View style={styles.dragHandle} />

        {/* Header */}
        <View style={styles.header}>
          <Text variant="title" style={styles.headerTitle}>
            Filter Places
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Section: Sort By */}
          <Text variant="subtitle" style={styles.sectionTitle}>
            Sort By
          </Text>
          <View style={styles.chipRow}>
            {SORT_OPTIONS.map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                selected={draftSort === opt.value}
                onPress={() => setDraftSort(opt.value)}
              />
            ))}
          </View>

          {/* Section: Open Now Toggle */}
          <View style={styles.toggleRow}>
            <View>
              <Text variant="subtitle" style={styles.toggleLabel}>
                Open Now Only
              </Text>
              <Text variant="caption" color={theme.colors.textMuted}>
                Show places currently accepting orders
              </Text>
            </View>
            <Switch
              value={draftOpenNow}
              onValueChange={setDraftOpenNow}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.surface}
            />
          </View>

          {/* Section: Category */}
          <Text variant="subtitle" style={styles.sectionTitle}>
            Category
          </Text>
          <View style={styles.chipRow}>
            <Chip
              label="All Categories"
              selected={draftCategorySlug === null || draftCategorySlug === 'all'}
              onPress={() => setDraftCategorySlug(null)}
            />
            {categories.map((cat) => (
              <Chip
                key={cat.id}
                label={cat.name}
                selected={draftCategorySlug === cat.slug}
                onPress={() => setDraftCategorySlug(cat.slug)}
              />
            ))}
          </View>

          {/* Section: Price Range */}
          <Text variant="subtitle" style={styles.sectionTitle}>
            Price Range
          </Text>
          <View style={styles.chipRow}>
            <Chip
              label="Any Price"
              selected={draftPriceRange === null}
              onPress={() => setDraftPriceRange(null)}
            />
            {PRICE_OPTIONS.map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                selected={draftPriceRange === opt.value}
                onPress={() => setDraftPriceRange(opt.value)}
              />
            ))}
          </View>

          {/* Section: Area */}
          <Text variant="subtitle" style={styles.sectionTitle}>
            Location Area
          </Text>
          <View style={styles.chipRow}>
            <Chip
              label="All Areas"
              selected={draftAreaId === null}
              onPress={() => setDraftAreaId(null)}
            />
            {areas.map((a: Area) => (
              <Chip
                key={a.id}
                label={a.name}
                selected={draftAreaId === a.id}
                onPress={() => setDraftAreaId(a.id)}
              />
            ))}
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <Button
            title="Reset All"
            variant="secondary"
            onPress={handleReset}
            style={styles.resetButton}
          />
          <Button
            title="Apply Filters"
            variant="primary"
            onPress={handleApply}
            style={styles.applyButton}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
  },
  sheetContainer: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: theme.spacing.xl,
    ...theme.shadows.lg,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    alignSelf: 'center',
    marginTop: theme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  sectionTitle: {
    fontWeight: '700',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginTop: theme.spacing.sm,
  },
  toggleLabel: {
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  resetButton: {
    flex: 1,
  },
  applyButton: {
    flex: 2,
  },
});
