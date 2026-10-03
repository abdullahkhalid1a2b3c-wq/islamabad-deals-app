import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
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
import { AreaPickerSheet } from '../../src/components/common/AreaPickerSheet';
import { SignInPrompt } from '../../src/features/auth/SignInPrompt';
import { requireAuth } from '../../src/features/auth/requireAuth';
import {
  useHomeFeed,
  useFeaturedDeals,
  useDealsNearby,
  useExpiringDeals,
  useNewDeals,
  useCategories,
} from '../../src/features/deals/hooks';
import { usePopularRestaurants } from '../../src/features/restaurants/hooks';
import { useLocation } from '../../src/features/location/useLocation';
import { useToast } from '../../src/components/ui/Toast';
import { isDealActiveNow } from '../../src/utils/dealStatus';
import { DealSummary, RestaurantSummary } from '../../src/types/domain';
import { theme } from '../../src/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_CARD_WIDTH = SCREEN_WIDTH * 0.82;
const HERO_SNAP_INTERVAL = HERO_CARD_WIDTH + theme.spacing.md;

export default function HomeScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { coords, selectedArea, mode, isUsingFallback } = useLocation();

  const [areaSheetVisible, setAreaSheetVisible] = useState(false);
  const [signInPromptVisible, setSignInPromptVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  const heroScrollRef = useRef<ScrollView>(null);
  const isUserTouchingRef = useRef(false);

  // Queries
  const {
    data: homeFeedData,
    isLoading: loadingHomeFeed,
    isError: errorHomeFeed,
    refetch: refetchHomeFeed,
  } = useHomeFeed(coords);

  const {
    data: featuredDealsFallback,
    isLoading: loadingFeatured,
    isError: errorFeatured,
    refetch: refetchFeatured,
  } = useFeaturedDeals();

  const {
    data: nearbyDealsFallback,
    isLoading: loadingNearby,
    isError: errorNearby,
    refetch: refetchNearby,
  } = useDealsNearby();

  const {
    data: expiringDealsFallback,
    isLoading: loadingExpiring,
    isError: errorExpiring,
    refetch: refetchExpiring,
  } = useExpiringDeals();

  const {
    data: newDealsFallback,
    isLoading: loadingNew,
    isError: errorNew,
    refetch: refetchNew,
  } = useNewDeals();

  const {
    data: popularRestaurantsFallback,
    isLoading: loadingRestaurants,
    isError: errorRestaurants,
    refetch: refetchRestaurants,
  } = usePopularRestaurants();

  const { data: categories } = useCategories();

  // Combine feed datasets (real RPC or service fallback)
  const featuredDeals = (homeFeedData?.featured || featuredDealsFallback || []).filter(isDealActiveNow);
  const nearbyDeals = (homeFeedData?.nearby || nearbyDealsFallback || []).filter(isDealActiveNow);
  const expiringDeals = (homeFeedData?.expiring_soon || expiringDealsFallback || [])
    .filter(isDealActiveNow)
    .sort((a: DealSummary, b: DealSummary) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
  const newDeals = (homeFeedData?.new || newDealsFallback || []).filter(isDealActiveNow);
  const popularRestaurants = homeFeedData?.popular_restaurants || popularRestaurantsFallback || [];

  const isRefreshing =
    loadingHomeFeed || loadingFeatured || loadingNearby || loadingExpiring || loadingNew || loadingRestaurants;

  const handleRefresh = useCallback(() => {
    refetchHomeFeed();
    refetchFeatured();
    refetchNearby();
    refetchExpiring();
    refetchNew();
    refetchRestaurants();
  }, [refetchHomeFeed, refetchFeatured, refetchNearby, refetchExpiring, refetchNew, refetchRestaurants]);

  // Auto-advance hero carousel every 5s unless user is touching
  useEffect(() => {
    if (!featuredDeals || featuredDeals.length <= 1) return;

    const timer = setInterval(() => {
      if (!isUserTouchingRef.current && heroScrollRef.current) {
        const nextIndex = (activeHeroIndex + 1) % featuredDeals.length;
        setActiveHeroIndex(nextIndex);
        heroScrollRef.current.scrollTo({
          x: nextIndex * HERO_SNAP_INTERVAL,
          animated: true,
        });
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [activeHeroIndex, featuredDeals]);

  const handleHeroScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / HERO_SNAP_INTERVAL);
    setActiveHeroIndex(index);
  };

  const handleFavoriteClick = () => {
    requireAuth(
      () => {
        showToast('Favorites', 'Bookmark saving is coming in Prompt 10', 'info');
      },
      () => {
        setSignInPromptVisible(true);
      },
    );
  };

  const locationDisplayLabel =
    mode === 'area' && selectedArea ? selectedArea.name : isUsingFallback ? 'Islamabad' : 'Near You';

  return (
    <Screen scrollable refreshing={isRefreshing} onRefresh={handleRefresh}>
      {/* 1. Header with Location Pill & Notification Bell */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.locationPill}
          onPress={() => setAreaSheetVisible(true)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Location: ${locationDisplayLabel}`}
        >
          <Ionicons name="location-sharp" size={16} color={theme.colors.primary} />
          <Text variant="subtitle" style={styles.locationText} numberOfLines={1}>
            {locationDisplayLabel}
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

      {/* Fallback Location Banner */}
      {isUsingFallback ? (
        <View style={styles.fallbackBanner}>
          <Ionicons name="information-circle-outline" size={16} color={theme.colors.primary} style={{ marginRight: 6 }} />
          <Text variant="caption" color={theme.colors.primary} style={{ fontWeight: '600' }}>
            Showing food deals across Islamabad
          </Text>
        </View>
      ) : null}

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
          <Ionicons name="search" size={20} color={theme.colors.textMuted} style={styles.searchIcon} />
          <Text variant="body" color={theme.colors.textMuted}>
            Search burgers, pizza, Biryani, F-7...
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
          <Skeleton width={100} height={36} borderRadius={theme.radii.chip} style={{ marginRight: 8 }} />
          <Skeleton width={120} height={36} borderRadius={theme.radii.chip} style={{ marginRight: 8 }} />
          <Skeleton width={110} height={36} borderRadius={theme.radii.chip} />
        </View>
      )}

      {/* 4. Featured Deals Hero Carousel */}
      <SectionHeader title="Featured Deals" subtitle="Top hand-picked discounts today" />
      {loadingFeatured || loadingHomeFeed ? (
        <View style={styles.heroSkeletonContainer}>
          <Skeleton width={HERO_CARD_WIDTH} height={260} borderRadius={theme.radii.card} />
        </View>
      ) : errorFeatured && !featuredDeals.length ? (
        <ErrorState onRetry={refetchFeatured} />
      ) : !featuredDeals.length ? (
        <EmptyState title="No featured deals" />
      ) : (
        <View>
          <ScrollView
            ref={heroScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={HERO_SNAP_INTERVAL}
            decelerationRate="fast"
            onScroll={handleHeroScroll}
            scrollEventThrottle={16}
            onTouchStart={() => {
              isUserTouchingRef.current = true;
            }}
            onTouchEnd={() => {
              isUserTouchingRef.current = false;
            }}
            onScrollBeginDrag={() => {
              isUserTouchingRef.current = true;
            }}
            onScrollEndDrag={() => {
              isUserTouchingRef.current = false;
            }}
            contentContainerStyle={styles.horizontalListPadding}
          >
            {featuredDeals.map((deal: DealSummary) => (
              <DealCard
                key={deal.id}
                deal={deal}
                variant="hero"
                onPress={() => router.push(`/deal/${deal.id}`)}
                onFavoritePress={handleFavoriteClick}
              />
            ))}
          </ScrollView>
          {/* Pagination Dots */}
          <View style={styles.paginationDots}>
            {featuredDeals.map((_: DealSummary, idx: number) => (
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
        onSeeAll={() => router.push('/search?sort=distance&activeNow=1')}
      />
      {loadingNearby || loadingHomeFeed ? (
        <View style={styles.horizontalSkeletonRow}>
          <Skeleton width={220} height={210} borderRadius={theme.radii.card} style={{ marginRight: 12 }} />
          <Skeleton width={220} height={210} borderRadius={theme.radii.card} />
        </View>
      ) : errorNearby && !nearbyDeals.length ? (
        <ErrorState onRetry={refetchNearby} />
      ) : !nearbyDeals.length ? (
        <EmptyState title="No nearby deals found" />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalListPadding}
        >
          {nearbyDeals.map((deal: DealSummary) => (
            <DealCard
              key={deal.id}
              deal={deal}
              variant="compact"
              onPress={() => router.push(`/deal/${deal.id}`)}
              onFavoritePress={handleFavoriteClick}
            />
          ))}
        </ScrollView>
      )}

      {/* 6. Expiring Soon */}
      {expiringDeals.length > 0 ? (
        <>
          <SectionHeader
            title="Expiring Soon"
            subtitle="Claim before time runs out!"
          />
          {loadingExpiring || loadingHomeFeed ? (
            <View style={styles.horizontalSkeletonRow}>
              <Skeleton width={220} height={210} borderRadius={theme.radii.card} style={{ marginRight: 12 }} />
              <Skeleton width={220} height={210} borderRadius={theme.radii.card} />
            </View>
          ) : errorExpiring && !expiringDeals.length ? (
            <ErrorState onRetry={refetchExpiring} />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalListPadding}
            >
              {expiringDeals.map((deal: DealSummary) => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  variant="compact"
                  onPress={() => router.push(`/deal/${deal.id}`)}
                  onFavoritePress={handleFavoriteClick}
                />
              ))}
            </ScrollView>
          )}
        </>
      ) : null}

      {/* 7. New Deals */}
      <SectionHeader
        title="New Deals"
        subtitle="Freshly added discounts in Islamabad"
      />
      {loadingNew || loadingHomeFeed ? (
        <View style={styles.horizontalSkeletonRow}>
          <Skeleton width={220} height={210} borderRadius={theme.radii.card} style={{ marginRight: 12 }} />
          <Skeleton width={220} height={210} borderRadius={theme.radii.card} />
        </View>
      ) : errorNew && !newDeals.length ? (
        <ErrorState onRetry={refetchNew} />
      ) : !newDeals.length ? (
        <EmptyState title="No new deals today" />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalListPadding}
        >
          {newDeals.map((deal: DealSummary) => (
            <DealCard
              key={deal.id}
              deal={deal}
              variant="compact"
              onPress={() => router.push(`/deal/${deal.id}`)}
              onFavoritePress={handleFavoriteClick}
            />
          ))}
        </ScrollView>
      )}

      {/* 8. Popular Restaurants */}
      <SectionHeader
        title="Popular Restaurants"
        subtitle="Top-rated eateries in town"
      />
      {loadingRestaurants || loadingHomeFeed ? (
        <View style={styles.horizontalSkeletonRow}>
          <Skeleton width={200} height={190} borderRadius={theme.radii.card} style={{ marginRight: 12 }} />
          <Skeleton width={200} height={190} borderRadius={theme.radii.card} />
        </View>
      ) : errorRestaurants && !popularRestaurants.length ? (
        <ErrorState onRetry={refetchRestaurants} />
      ) : !popularRestaurants.length ? (
        <EmptyState title="No popular restaurants available" />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.horizontalListPadding, { paddingBottom: theme.spacing.xxxl }]}
        >
          {popularRestaurants.map((restaurant: RestaurantSummary) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              variant="compact"
              onPress={() => router.push(`/restaurant/${restaurant.id}`)}
            />
          ))}
        </ScrollView>
      )}

      {/* Area Selection Sheet */}
      <AreaPickerSheet
        visible={areaSheetVisible}
        onClose={() => setAreaSheetVisible(false)}
      />

      {/* Guest Sign In Prompt */}
      <SignInPrompt
        visible={signInPromptVisible}
        onClose={() => setSignInPromptVisible(false)}
      />
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
    maxWidth: SCREEN_WIDTH * 0.65,
  },
  locationText: {
    fontWeight: '700',
    marginHorizontal: theme.spacing.xs,
    color: theme.colors.text,
  },
  fallbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0EA',
    paddingVertical: 6,
    paddingHorizontal: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.sm,
    marginTop: theme.spacing.xs,
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
