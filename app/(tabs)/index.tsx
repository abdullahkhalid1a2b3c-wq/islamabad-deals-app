import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../src/components/ui/Screen';
import { Text } from '../../src/components/ui/Text';
import { Skeleton } from '../../src/components/ui/Skeleton';
import { ErrorState } from '../../src/components/ui/ErrorState';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { SectionHeader } from '../../src/components/ui/SectionHeader';
import { CategoryChips } from '../../src/components/common/CategoryChips';
import { DealCard } from '../../src/components/deal/DealCard';
import { RestaurantCard } from '../../src/components/restaurant/RestaurantCard';
import {
  useFeaturedDeals,
  useDealsNearby,
  useExpiringDeals,
  useNewDeals,
  useCategories,
} from '../../src/features/deals/hooks';
import { usePopularRestaurants } from '../../src/features/restaurants/hooks';
import { theme } from '../../src/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  // TanStack Query Hooks
  const {
    data: featuredDeals,
    isLoading: loadingFeatured,
    isError: errorFeatured,
    refetch: refetchFeatured,
  } = useFeaturedDeals();

  const {
    data: nearbyDeals,
    isLoading: loadingNearby,
    isError: errorNearby,
    refetch: refetchNearby,
  } = useDealsNearby();

  const {
    data: expiringDeals,
    isLoading: loadingExpiring,
    isError: errorExpiring,
    refetch: refetchExpiring,
  } = useExpiringDeals();

  const {
    data: newDeals,
    isLoading: loadingNew,
    isError: errorNew,
    refetch: refetchNew,
  } = useNewDeals();

  const {
    data: popularRestaurants,
    isLoading: loadingRestaurants,
    isError: errorRestaurants,
    refetch: refetchRestaurants,
  } = usePopularRestaurants();

  const { data: categories } = useCategories();

  const isRefreshing =
    loadingFeatured || loadingNearby || loadingExpiring || loadingNew || loadingRestaurants;

  const handleRefresh = () => {
    refetchFeatured();
    refetchNearby();
    refetchExpiring();
    refetchNew();
    refetchRestaurants();
  };

  const handleHeroScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = SCREEN_WIDTH * 0.85;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setActiveHeroIndex(index);
  };

  return (
    <Screen scrollable refreshing={isRefreshing} onRefresh={handleRefresh}>
      {/* 1. Header with Location & Notification Bell */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.locationPill}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Location: Islamabad"
        >
          <Ionicons name="location-sharp" size={16} color={theme.colors.primary} />
          <Text variant="subtitle" style={styles.locationText}>
            Islamabad
          </Text>
          <Ionicons name="chevron-down" size={14} color={theme.colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bellButton}
          onPress={() => router.push('/notifications')}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
        >
          <Ionicons name="notifications-outline" size={22} color={theme.colors.text} />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      {/* 2. Headline & Search Bar */}
      <View style={styles.heroBanner}>
        <Text variant="display" style={styles.headline}>
          Find the best food deals around Islamabad
        </Text>

        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push('/search')}
          activeOpacity={0.9}
          accessibilityRole="search"
          accessibilityLabel="Search deals and restaurants"
        >
          <Ionicons
            name="search"
            size={20}
            color={theme.colors.textMuted}
            style={styles.searchIcon}
          />
          <Text variant="body" color={theme.colors.textMuted}>
            Search burgers, pizza, Karahi, F-7...
          </Text>
        </TouchableOpacity>
      </View>

      {/* 3. Category Chips */}
      {categories ? (
        <CategoryChips
          categories={categories}
          selectedSlug={selectedCategory}
          onSelectCategory={(slug) => {
            setSelectedCategory(slug);
            if (slug) {
              router.push(`/category/${slug}`);
            }
          }}
        />
      ) : (
        <View style={styles.categorySkeletonRow}>
          <Skeleton
            width={100}
            height={36}
            borderRadius={theme.radii.chip}
            style={{ marginRight: 8 }}
          />
          <Skeleton
            width={120}
            height={36}
            borderRadius={theme.radii.chip}
            style={{ marginRight: 8 }}
          />
          <Skeleton width={110} height={36} borderRadius={theme.radii.chip} />
        </View>
      )}

      {/* 4. Featured Deals Hero Carousel */}
      <SectionHeader title="Featured Deals" subtitle="Top hand-picked discounts today" />
      {loadingFeatured ? (
        <View style={styles.heroSkeletonContainer}>
          <Skeleton width={SCREEN_WIDTH * 0.82} height={260} borderRadius={theme.radii.card} />
        </View>
      ) : errorFeatured ? (
        <ErrorState onRetry={refetchFeatured} />
      ) : !featuredDeals || featuredDeals.length === 0 ? (
        <EmptyState title="No featured deals" />
      ) : (
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={SCREEN_WIDTH * 0.82 + theme.spacing.md}
            decelerationRate="fast"
            onScroll={handleHeroScroll}
            scrollEventThrottle={16}
            contentContainerStyle={styles.horizontalListPadding}
          >
            {featuredDeals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                variant="hero"
                onPress={() => router.push(`/deal/${deal.id}`)}
              />
            ))}
          </ScrollView>
          {/* Page Indicator Dots */}
          <View style={styles.paginationDots}>
            {featuredDeals.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  idx === activeHeroIndex ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            ))}
          </View>
        </View>
      )}

      {/* 5. Deals Near You */}
      <SectionHeader
        title="Deals Near You"
        subtitle="Closest spots in your vicinity"
        onSeeAll={() => router.push('/search')}
      />
      {loadingNearby ? (
        <View style={styles.horizontalSkeletonRow}>
          <Skeleton
            width={220}
            height={210}
            borderRadius={theme.radii.card}
            style={{ marginRight: 12 }}
          />
          <Skeleton width={220} height={210} borderRadius={theme.radii.card} />
        </View>
      ) : errorNearby ? (
        <ErrorState onRetry={refetchNearby} />
      ) : !nearbyDeals || nearbyDeals.length === 0 ? (
        <EmptyState title="No nearby deals found" />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalListPadding}
        >
          {nearbyDeals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              variant="compact"
              onPress={() => router.push(`/deal/${deal.id}`)}
            />
          ))}
        </ScrollView>
      )}

      {/* 6. Expiring Soon */}
      <SectionHeader title="Expiring Soon" subtitle="Claim before time runs out!" />
      {loadingExpiring ? (
        <View style={styles.horizontalSkeletonRow}>
          <Skeleton
            width={220}
            height={210}
            borderRadius={theme.radii.card}
            style={{ marginRight: 12 }}
          />
          <Skeleton width={220} height={210} borderRadius={theme.radii.card} />
        </View>
      ) : errorExpiring ? (
        <ErrorState onRetry={refetchExpiring} />
      ) : !expiringDeals || expiringDeals.length === 0 ? (
        <EmptyState title="No expiring deals right now" />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalListPadding}
        >
          {expiringDeals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              variant="compact"
              onPress={() => router.push(`/deal/${deal.id}`)}
            />
          ))}
        </ScrollView>
      )}

      {/* 7. New Deals */}
      <SectionHeader title="New Deals" subtitle="Freshly added discounts in Islamabad" />
      {loadingNew ? (
        <View style={styles.horizontalSkeletonRow}>
          <Skeleton
            width={220}
            height={210}
            borderRadius={theme.radii.card}
            style={{ marginRight: 12 }}
          />
          <Skeleton width={220} height={210} borderRadius={theme.radii.card} />
        </View>
      ) : errorNew ? (
        <ErrorState onRetry={refetchNew} />
      ) : !newDeals || newDeals.length === 0 ? (
        <EmptyState title="No new deals today" />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalListPadding}
        >
          {newDeals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              variant="compact"
              onPress={() => router.push(`/deal/${deal.id}`)}
            />
          ))}
        </ScrollView>
      )}

      {/* 8. Popular Restaurants */}
      <SectionHeader title="Popular Restaurants" subtitle="Top-rated eateries in town" />
      {loadingRestaurants ? (
        <View style={styles.horizontalSkeletonRow}>
          <Skeleton
            width={200}
            height={190}
            borderRadius={theme.radii.card}
            style={{ marginRight: 12 }}
          />
          <Skeleton width={200} height={190} borderRadius={theme.radii.card} />
        </View>
      ) : errorRestaurants ? (
        <ErrorState onRetry={refetchRestaurants} />
      ) : !popularRestaurants || popularRestaurants.length === 0 ? (
        <EmptyState title="No popular restaurants available" />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.horizontalListPadding,
            { paddingBottom: theme.spacing.xxxl },
          ]}
        >
          {popularRestaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              variant="compact"
              onPress={() => router.push(`/restaurant/${restaurant.id}`)}
            />
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.chip,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 44,
  },
  locationText: {
    fontWeight: '700',
    marginHorizontal: theme.spacing.xs,
    color: theme.colors.text,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: theme.radii.chip,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    ...theme.shadows.sm,
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  heroBanner: {
    paddingHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.md,
  },
  headline: {
    color: theme.colors.text,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    marginBottom: theme.spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.chip,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    height: 48,
    ...theme.shadows.sm,
  },
  searchIcon: {
    marginRight: theme.spacing.xs,
  },
  categorySkeletonRow: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.sm,
  },
  heroSkeletonContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  horizontalSkeletonRow: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
  },
  horizontalListPadding: {
    paddingHorizontal: theme.spacing.lg,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  activeDot: {
    width: 18,
    backgroundColor: theme.colors.primary,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: theme.colors.border,
  },
});
