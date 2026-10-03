import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../src/components/ui/Screen';
import { Text } from '../../src/components/ui/Text';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Rating } from '../../src/components/ui/Rating';
import { Skeleton } from '../../src/components/ui/Skeleton';
import { ErrorState } from '../../src/components/ui/ErrorState';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { Button } from '../../src/components/ui/Button';
import { SectionHeader } from '../../src/components/ui/SectionHeader';
import { DealCard } from '../../src/components/deal/DealCard';
import { RestaurantHero } from '../../src/components/restaurant/RestaurantHero';
import { ActionRow } from '../../src/components/restaurant/ActionRow';
import { OpeningHoursSheet } from '../../src/components/restaurant/OpeningHoursSheet';
import { MenuSection } from '../../src/components/restaurant/MenuSection';
import { GalleryStrip } from '../../src/components/restaurant/GalleryStrip';
import { ServiceChips } from '../../src/components/restaurant/ServiceChips';
import { FeatureChips } from '../../src/components/restaurant/FeatureChips';
import { SignInPrompt } from '../../src/features/auth/SignInPrompt';
import { useRestaurant } from '../../src/features/restaurants/hooks';
import { getOpenStatus } from '../../src/utils/openingHours';
import { formatDistance } from '../../src/utils/distance';
import { useToast } from '../../src/components/ui/Toast';
import { theme } from '../../src/theme';

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();

  const [hoursSheetVisible, setHoursSheetVisible] = useState(false);
  const [signInPromptVisible, setSignInPromptVisible] = useState(false);
  const [readMore, setReadMore] = useState(false);

  const { data: restaurant, isLoading, isError, refetch } = useRestaurant(id || '');

  // Loading Skeleton State
  if (isLoading) {
    return (
      <Screen style={styles.screen}>
        <View style={styles.skeletonHero}>
          <Skeleton width="100%" height={180} />
        </View>
        <View style={styles.contentPadding}>
          <Skeleton width={200} height={24} borderRadius={4} style={{ marginBottom: 8 }} />
          <Skeleton width={140} height={16} borderRadius={4} style={{ marginBottom: 16 }} />
          <Skeleton width="100%" height={44} borderRadius={22} style={{ marginBottom: 20 }} />
          <Skeleton width="100%" height={120} borderRadius={theme.radii.card} style={{ marginBottom: 16 }} />
          <Skeleton width="100%" height={120} borderRadius={theme.radii.card} />
        </View>
      </Screen>
    );
  }

  // Error State
  if (isError) {
    return (
      <Screen style={styles.screen}>
        <View style={styles.simpleHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        <ErrorState onRetry={refetch} />
      </Screen>
    );
  }

  // Not Found State (Invalid UUID or inactive restaurant)
  if (!restaurant) {
    return (
      <Screen style={styles.screen}>
        <View style={styles.simpleHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        <EmptyState
          title="Restaurant not found"
          message="We couldn't find this place or it may no longer be active."
          icon="restaurant-outline"
          action={<Button title="Back to Explore" onPress={() => router.push('/explore')} size="sm" />}
        />
      </Screen>
    );
  }

  const { isOpen, label: openLabel } = getOpenStatus(restaurant.openingHours);
  const priceRangeStr = '$'.repeat(restaurant.priceRange || 2);
  const cuisineStr = restaurant.cuisine ? restaurant.cuisine.join(' • ') : '';
  const activeDeals = restaurant.activeDeals || [];
  const menuSections = restaurant.menuSections || [];
  const images = restaurant.images || [];

  return (
    <Screen style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* 1. Hero Header */}
        <RestaurantHero
          coverUrl={restaurant.coverUrl}
          logoUrl={restaurant.logoUrl}
          name={restaurant.name}
          onBack={() => router.back()}
          onSignInRequired={() => setSignInPromptVisible(true)}
        />

        {/* 2. Restaurant Main Information */}
        <View style={styles.contentPadding}>
          <Text variant="display" style={styles.restaurantName}>
            {restaurant.name}
          </Text>

          {/* Rating, Cuisine, Price */}
          <View style={styles.metaRow}>
            <Rating rating={restaurant.rating} reviewCount={restaurant.reviewCount} />
            <Text variant="caption" color={theme.colors.textMuted}>
              •
            </Text>
            <Text variant="caption" color={theme.colors.textMuted}>
              {cuisineStr}
            </Text>
            <Text variant="caption" color={theme.colors.textMuted}>
              •
            </Text>
            <Text variant="caption" color={theme.colors.primary} style={styles.priceText}>
              {priceRangeStr}
            </Text>
          </View>

          {/* Opening Hours Badge (Tap opens OpeningHoursSheet) */}
          <TouchableOpacity
            style={styles.hoursTouchable}
            onPress={() => setHoursSheetVisible(true)}
            activeOpacity={0.7}
            accessibilityLabel="View Opening Hours"
          >
            <Badge label={isOpen ? 'OPEN' : 'CLOSED'} variant={isOpen ? 'open' : 'closed'} />
            <Text variant="caption" color={theme.colors.text} style={styles.hoursLabel}>
              {openLabel}
            </Text>
            <Ionicons name="chevron-forward" size={14} color={theme.colors.textMuted} />
          </TouchableOpacity>

          {/* Address and Distance */}
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={16} color={theme.colors.textMuted} />
            <Text variant="caption" color={theme.colors.textMuted} style={styles.addressText}>
              {restaurant.areaName} · {restaurant.address}
              {restaurant.distanceM !== undefined ? ` (${formatDistance(restaurant.distanceM)})` : ''}
            </Text>
          </View>
        </View>

        {/* 3. Action Row (Call, Directions, Website, Instagram) */}
        <ActionRow
          phone={restaurant.phone}
          location={{ lat: restaurant.location.lat, lng: restaurant.location.lng, name: restaurant.name }}
          website={restaurant.website}
          instagram={restaurant.instagram}
        />

        {/* 4. Active Deals Section (Most Prominent Content Section) */}
        <View style={styles.sectionContainer}>
          <SectionHeader
            title={`Active Deals (${activeDeals.length})`}
            subtitle="Exclusive discounts at this venue"
          />
          {activeDeals.length > 0 ? (
            <View style={styles.dealsStack}>
              {activeDeals.map((deal) => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  variant="hero"
                  onPress={() => router.push(`/deal/${deal.id}`)}
                />
              ))}
            </View>
          ) : (
            <Card style={styles.emptyDealsCard}>
              <Ionicons name="pricetag-outline" size={28} color={theme.colors.textMuted} />
              <Text variant="subtitle" style={styles.emptyDealsTitle}>
                No active deals right now
              </Text>
              <Text variant="caption" color={theme.colors.textMuted}>
                Check back later for new promotional offers from {restaurant.name}.
              </Text>
            </Card>
          )}
        </View>

        {/* 5. Menu Section */}
        <View style={styles.sectionContainer}>
          <SectionHeader title="Menu" subtitle="Dishes & pricing" />
          {menuSections.length > 0 ? (
            menuSections.map((sec) => (
              <MenuSection key={sec.id} section={sec} />
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Text variant="caption" color={theme.colors.textMuted}>
                Menu not available yet for this restaurant.
              </Text>
            </Card>
          )}
        </View>

        {/* 6. Gallery Section */}
        {images.length > 0 ? (
          <View style={styles.sectionContainer}>
            <SectionHeader title="Gallery" subtitle="Photos of food & ambience" />
            <GalleryStrip images={images} />
          </View>
        ) : null}

        {/* 7. About Section */}
        {restaurant.description ? (
          <View style={styles.sectionContainer}>
            <SectionHeader title="About" />
            <Card style={styles.aboutCard}>
              <Text
                variant="body"
                color={theme.colors.text}
                numberOfLines={readMore ? undefined : 4}
              >
                {restaurant.description}
              </Text>
              <TouchableOpacity
                onPress={() => setReadMore(!readMore)}
                style={styles.readMoreBtn}
              >
                <Text variant="caption" color={theme.colors.primary} style={styles.readMoreText}>
                  {readMore ? 'Show less' : 'Read more'}
                </Text>
              </TouchableOpacity>
            </Card>
          </View>
        ) : null}

        {/* 8. Services and Features Chips */}
        <View style={styles.sectionContainer}>
          <SectionHeader title="Services & Amenities" />
          <ServiceChips availableModes={restaurant.serviceModes} />
          <FeatureChips features={restaurant.features} />
        </View>

        {/* 9. Report Place Footer */}
        <View style={styles.reportFooter}>
          <TouchableOpacity
            onPress={() => showToast('Reporting places coming soon!', 'info')}
            style={styles.reportButton}
          >
            <Ionicons name="flag-outline" size={14} color={theme.colors.textMuted} />
            <Text variant="caption" color={theme.colors.textMuted}>
              Something wrong? Report this place
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Opening Hours Modal Sheet */}
      <OpeningHoursSheet
        visible={hoursSheetVisible}
        onClose={() => setHoursSheetVisible(false)}
        openingHours={restaurant.openingHours}
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
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    paddingBottom: theme.spacing.xxxl,
  },
  simpleHeader: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  backBtn: {
    padding: theme.spacing.xs,
  },
  skeletonHero: {
    width: '100%',
    height: 180,
  },
  contentPadding: {
    paddingHorizontal: theme.spacing.lg,
  },
  restaurantName: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginVertical: theme.spacing.xs,
    gap: 6,
  },
  priceText: {
    fontWeight: '700',
  },
  hoursTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.xs,
    gap: 8,
  },
  hoursLabel: {
    fontWeight: '600',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  addressText: {
    flex: 1,
  },
  sectionContainer: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  dealsStack: {
    gap: theme.spacing.md,
  },
  emptyDealsCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    textAlign: 'center',
  },
  emptyDealsTitle: {
    fontWeight: '700',
    marginVertical: theme.spacing.xs,
  },
  emptyCard: {
    padding: theme.spacing.lg,
  },
  aboutCard: {
    padding: theme.spacing.lg,
  },
  readMoreBtn: {
    marginTop: theme.spacing.xs,
  },
  readMoreText: {
    fontWeight: '700',
  },
  reportFooter: {
    alignItems: 'center',
    marginTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xl,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: theme.spacing.xs,
  },
});
