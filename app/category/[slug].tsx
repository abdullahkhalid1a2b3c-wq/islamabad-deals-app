import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../src/components/ui/Screen';
import { Text } from '../../src/components/ui/Text';
import { Skeleton } from '../../src/components/ui/Skeleton';
import { ErrorState } from '../../src/components/ui/ErrorState';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { Button } from '../../src/components/ui/Button';
import { RestaurantCard } from '../../src/components/restaurant/RestaurantCard';
import { AreaPickerSheet } from '../../src/components/common/AreaPickerSheet';
import { useRestaurantList } from '../../src/features/restaurants/useRestaurantList';
import { useCategories } from '../../src/features/deals/hooks';
import { useLocation } from '../../src/features/location/useLocation';
import { RestaurantSummary } from '../../src/types/domain';
import { theme } from '../../src/theme';

export default function CategoryDetailScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { coords, selectedArea } = useLocation();
  const [areaSheetVisible, setAreaSheetVisible] = useState(false);

  const { data: categories = [], isLoading: loadingCategories } = useCategories();

  const currentCategory = useMemo(() => {
    if (!slug) return null;
    return categories.find((c) => c.slug.toLowerCase() === slug.toLowerCase()) || null;
  }, [categories, slug]);

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
    categorySlug: slug,
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

  // Loading state while categories are being checked
  if (loadingCategories) {
    return (
      <Screen style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Skeleton width={140} height={24} borderRadius={4} />
        </View>
        <View style={styles.listContainer}>
          <Skeleton width="100%" height={120} borderRadius={theme.radii.card} style={{ marginBottom: 12 }} />
          <Skeleton width="100%" height={120} borderRadius={theme.radii.card} />
        </View>
      </Screen>
    );
  }

  // Not found category state
  if (!currentCategory && slug !== 'all') {
    return (
      <Screen style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text variant="title">Category</Text>
        </View>
        <EmptyState
          title="Category not found"
          message={`We couldn't find any category matching "${slug}".`}
          action={<Button title="Explore All Deals" onPress={() => router.push('/explore')} size="sm" />}
        />
      </Screen>
    );
  }

  return (
    <Screen style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text variant="title" numberOfLines={1}>
            {currentCategory?.name || 'Category Deals'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.locationPill}
          onPress={() => setAreaSheetVisible(true)}
          accessibilityLabel="Location Area Picker"
        >
          <Ionicons name="location-sharp" size={14} color={theme.colors.primary} />
          <Text variant="caption" style={styles.locationText} numberOfLines={1}>
            {selectedArea ? selectedArea.name : 'Near you'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main List */}
      {isLoading ? (
        <View style={styles.listContainer}>
          <Skeleton width="100%" height={120} borderRadius={theme.radii.card} style={{ marginBottom: 12 }} />
          <Skeleton width="100%" height={120} borderRadius={theme.radii.card} style={{ marginBottom: 12 }} />
          <Skeleton width="100%" height={120} borderRadius={theme.radii.card} />
        </View>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : !restaurants.length ? (
        <EmptyState
          title="No places found"
          message={`No places currently match the "${currentCategory?.name || slug}" category.`}
          action={<Button title="Explore All Places" onPress={() => router.push('/explore')} size="sm" />}
        />
      ) : (
        <FlatList
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
          contentContainerStyle={styles.listContent}
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
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            ) : null
          }
        />
      )}

      {/* Area Picker Sheet */}
      <AreaPickerSheet
        visible={areaSheetVisible}
        onClose={() => setAreaSheetVisible(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  backButton: {
    padding: theme.spacing.xs,
    marginRight: theme.spacing.xs,
  },
  headerTitleContainer: {
    flex: 1,
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
  listContainer: {
    padding: theme.spacing.lg,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },
  footerLoader: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
});
