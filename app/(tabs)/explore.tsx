import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../src/components/ui/Screen';
import { Text } from '../../src/components/ui/Text';
import { Skeleton } from '../../src/components/ui/Skeleton';
import { ErrorState } from '../../src/components/ui/ErrorState';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { Button } from '../../src/components/ui/Button';
import { Chip } from '../../src/components/ui/Chip';
import { CategoryChips } from '../../src/components/common/CategoryChips';
import { RestaurantCard } from '../../src/components/restaurant/RestaurantCard';
import { AreaPickerSheet } from '../../src/components/common/AreaPickerSheet';
import { FilterSheet } from '../../src/components/common/FilterSheet';
import { useLocation } from '../../src/features/location/useLocation';
import { useCategories } from '../../src/features/deals/hooks';
import { useRestaurantList } from '../../src/features/restaurants/useRestaurantList';
import { useExploreFiltersStore, RestaurantSortOption } from '../../src/store/exploreFilters';
import { RestaurantSummary } from '../../src/types/domain';
import { theme } from '../../src/theme';

const SORT_OPTIONS: Array<{ label: string; value: RestaurantSortOption }> = [
  { label: 'Popular', value: 'popular' },
  { label: 'Nearest', value: 'nearest' },
  { label: 'Top Rated', value: 'top_rated' },
  { label: 'Newest', value: 'newest' },
];

export default function ExploreScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList<RestaurantSummary>>(null);
  const { coords, selectedArea, isUsingFallback } = useLocation();
  const { data: categories = [] } = useCategories();

  const [areaSheetVisible, setAreaSheetVisible] = useState(false);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);

  const {
    categorySlug,
    areaId,
    priceRange,
    openNow,
    sort,
    setCategorySlug,
    setSort,
    resetFilters,
    getActiveFilterCount,
  } = useExploreFiltersStore();

  const activeFilterCount = getActiveFilterCount();

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRestaurantList({
    coords,
    categorySlug,
    areaId,
    priceRange,
    openNow,
    sort,
  });

  // Flatten & deduplicate items across pages
  const restaurants = useMemo(() => {
    if (!data?.pages) return [];
    const all = data.pages.flatMap((page) => page.items);
    const seen = new Set<string>();
    return all.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [data]);

  // Reset scroll to top when filters change
  useEffect(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [categorySlug, areaId, priceRange, openNow, sort]);

  return (
    <Screen style={styles.screen}>
      {/* Sticky Header */}
      <View style={styles.headerContainer}>
        <View style={styles.topHeader}>
          <View>
            <Text variant="display" style={styles.screenTitle}>
              Explore Places
            </Text>
            <Text variant="caption" color={theme.colors.textMuted}>
              Discover food spots in Islamabad
            </Text>
          </View>

          <View style={styles.headerRightActions}>
            {/* Location Pill */}
            <TouchableOpacity
              style={styles.locationPill}
              onPress={() => setAreaSheetVisible(true)}
              accessibilityLabel="Location Area Selector"
            >
              <Ionicons name="location-sharp" size={14} color={theme.colors.primary} />
              <Text variant="caption" style={styles.locationText} numberOfLines={1}>
                {selectedArea ? selectedArea.name : 'Near you'}
              </Text>
            </TouchableOpacity>

            {/* Filter Button */}
            <TouchableOpacity
              style={[styles.filterButton, activeFilterCount > 0 && styles.activeFilterButton]}
              onPress={() => setFilterSheetVisible(true)}
              accessibilityLabel="Open Filters Sheet"
            >
              <Ionicons
                name="options-outline"
                size={18}
                color={activeFilterCount > 0 ? theme.colors.surface : theme.colors.text}
              />
              {activeFilterCount > 0 ? (
                <View style={styles.filterBadge}>
                  <Text variant="caption" style={styles.filterBadgeText}>
                    {activeFilterCount}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          </View>
        </View>

        {/* Location Fallback Gentle Banner */}
        {isUsingFallback ? (
          <View style={styles.fallbackBanner}>
            <Ionicons name="information-circle-outline" size={14} color={theme.colors.primary} />
            <Text variant="caption" style={styles.fallbackBannerText}>
              Showing places across Islamabad
            </Text>
          </View>
        ) : null}

        {/* Business Type / Category Chips */}
        <CategoryChips
          categories={categories}
          selectedSlug={categorySlug}
          onSelect={(slug) => setCategorySlug(slug)}
        />

        {/* Sort Menu Bar */}
        <View style={styles.sortBar}>
          <Text variant="caption" color={theme.colors.textMuted} style={styles.sortLabel}>
            Sort by:
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortScroll}>
            {SORT_OPTIONS.map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                selected={sort === opt.value}
                onPress={() => setSort(opt.value)}
              />
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Main Content List */}
      {isLoading ? (
        <View style={styles.listPadding}>
          <Skeleton width="100%" height={130} borderRadius={theme.radii.card} style={{ marginBottom: 12 }} />
          <Skeleton width="100%" height={130} borderRadius={theme.radii.card} style={{ marginBottom: 12 }} />
          <Skeleton width="100%" height={130} borderRadius={theme.radii.card} />
        </View>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : !restaurants.length ? (
        <EmptyState
          title="No places match these filters"
          message="Try broadening your filters or selecting a different location area."
          action={<Button title="Reset Filters" onPress={resetFilters} size="sm" />}
        />
      ) : (
        <FlatList
          ref={flatListRef}
          data={restaurants}
          keyExtractor={(item: RestaurantSummary) => item.id}
          renderItem={({ item }: { item: RestaurantSummary }) => (
            <RestaurantCard
              restaurant={item}
              variant="row"
              bestDeal={item.bestDeal}
              onPress={() => router.push(`/restaurant/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.listPadding}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor={theme.colors.primary}
            />
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.footerSpinner}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            ) : null
          }
        />
      )}

      {/* Sheets */}
      <AreaPickerSheet
        visible={areaSheetVisible}
        onClose={() => setAreaSheetVisible(false)}
      />

      <FilterSheet
        visible={filterSheetVisible}
        onClose={() => setFilterSheetVisible(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerContainer: {
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.xs,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: theme.radii.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    maxWidth: 130,
    gap: 4,
  },
  locationText: {
    fontWeight: '600',
    color: theme.colors.text,
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  activeFilterButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: theme.colors.danger,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: theme.colors.surface,
    fontSize: 10,
    fontWeight: '700',
  },
  fallbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 90, 31, 0.08)',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 6,
    gap: 6,
  },
  fallbackBannerText: {
    color: theme.colors.primaryDark,
    fontWeight: '500',
  },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xs,
  },
  sortLabel: {
    fontWeight: '600',
    marginRight: theme.spacing.xs,
  },
  sortScroll: {
    gap: 4,
  },
  listPadding: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xxxl,
  },
  footerSpinner: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
});
