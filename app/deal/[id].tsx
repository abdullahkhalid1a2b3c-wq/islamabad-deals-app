import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../src/components/ui/Screen';
import { Text } from '../../src/components/ui/Text';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Rating } from '../../src/components/ui/Rating';
import { Avatar } from '../../src/components/ui/Avatar';
import { Skeleton } from '../../src/components/ui/Skeleton';
import { ErrorState } from '../../src/components/ui/ErrorState';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { Button } from '../../src/components/ui/Button';
import { DealHeroImage } from '../../src/components/deal/DealHeroImage';
import { PriceBlock } from '../../src/components/deal/PriceBlock';
import { ValidityBlock } from '../../src/components/deal/ValidityBlock';
import { PromoCode } from '../../src/components/deal/PromoCode';
import { TermsAccordion } from '../../src/components/deal/TermsAccordion';
import { StickyCtaBar } from '../../src/components/deal/StickyCtaBar';
import { ReportDealSheet } from '../../src/components/deal/ReportDealSheet';
import { ServiceChips } from '../../src/components/restaurant/ServiceChips';
import { OpeningHoursSheet } from '../../src/components/restaurant/OpeningHoursSheet';
import { SignInPrompt } from '../../src/features/auth/SignInPrompt';
import { useDeal } from '../../src/features/deals/hooks';
import { getOrderAction } from '../../src/features/ordering/getOrderAction';
import { logDealEvent } from '../../src/services/supabase/supabaseDealsService';
import { getOpenStatus } from '../../src/utils/openingHours';
import { formatDistance } from '../../src/utils/distance';
import { buildDirectionsUrl } from '../../src/utils/links';
import { openExternalUrl } from '../../src/utils/openExternal';
import { useToast } from '../../src/components/ui/Toast';
import { theme } from '../../src/theme';

export default function DealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();

  const [reportSheetVisible, setReportSheetVisible] = useState(false);
  const [hoursSheetVisible, setHoursSheetVisible] = useState(false);
  const [signInPromptVisible, setSignInPromptVisible] = useState(false);

  const { data: deal, isLoading, isError, refetch } = useDeal(id || '');

  // Log view event once per mount
  const hasLoggedViewRef = useRef(false);
  useEffect(() => {
    if (deal?.id && !hasLoggedViewRef.current) {
      hasLoggedViewRef.current = true;
      logDealEvent(deal.id, 'view');
    }
  }, [deal?.id]);

  // Loading Skeleton State
  if (isLoading) {
    return (
      <Screen style={styles.screen}>
        <View style={styles.skeletonHero}>
          <Skeleton width="100%" height={240} />
        </View>
        <View style={styles.contentPadding}>
          <Skeleton width="80%" height={28} borderRadius={4} style={{ marginBottom: 12 }} />
          <Skeleton width="50%" height={20} borderRadius={4} style={{ marginBottom: 16 }} />
          <Skeleton width="100%" height={60} borderRadius={theme.radii.card} style={{ marginBottom: 16 }} />
          <Skeleton width="100%" height={100} borderRadius={theme.radii.card} />
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

  // Not Found State (Invalid UUID or inactive deal)
  if (!deal) {
    return (
      <Screen style={styles.screen}>
        <View style={styles.simpleHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        <EmptyState
          title="Deal not found"
          message="We couldn't find this deal or it may no longer be active."
          icon="ticket-outline"
          action={<Button title="Back to Feed" onPress={() => router.push('/')} size="sm" />}
        />
      </Screen>
    );
  }

  const isExpired = new Date(deal.endDate).getTime() <= Date.now();
  const orderAction = getOrderAction(deal.restaurant, { title: deal.title, code: deal.code });
  const { isOpen, label: openLabel } = getOpenStatus(deal.restaurant.openingHours);

  const handleDirectionsPress = () => {
    logDealEvent(deal.id, 'click_directions');
    if (deal.restaurant.location) {
      const url = buildDirectionsUrl({
        lat: deal.restaurant.location.lat,
        lng: deal.restaurant.location.lng,
        name: deal.restaurant.name,
      });
      openExternalUrl(url, showToast);
    }
  };

  return (
    <Screen style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* 1. Hero Image */}
        <DealHeroImage
          dealId={deal.id}
          imageUrl={deal.imageUrl}
          title={deal.title}
          dealType={deal.dealType}
          discountPercent={deal.discountValue}
          onBack={() => router.back()}
          onSignInRequired={() => setSignInPromptVisible(true)}
        />

        <View style={styles.contentPadding}>
          {/* 2. Title & Restaurant Row */}
          <Text variant="display" style={styles.dealTitle}>
            {deal.title}
          </Text>

          <TouchableOpacity
            style={styles.restaurantRow}
            onPress={() => router.push(`/restaurant/${deal.restaurant.id}`)}
            activeOpacity={0.7}
            accessibilityLabel={`Restaurant ${deal.restaurant.name}`}
          >
            <Avatar uri={deal.restaurant.logoUrl} size={40} />
            <View style={styles.restaurantInfo}>
              <Text variant="subtitle" style={styles.restaurantName}>
                {deal.restaurant.name}
              </Text>
              <Text variant="caption" color={theme.colors.textMuted}>
                {deal.restaurant.areaName}
                {deal.restaurant.rating ? ` · ★ ${deal.restaurant.rating.toFixed(1)}` : ''}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>

          {/* 3. Price Block */}
          <PriceBlock
            dealPricePKR={deal.dealPricePKR}
            originalPricePKR={deal.originalPricePKR}
            discountPercent={deal.discountValue}
            dealType={deal.dealType}
          />

          {/* 4. Validity Block */}
          <ValidityBlock
            endDate={deal.endDate}
            startDate={deal.startDate}
            daysOfWeek={deal.daysOfWeek ? (deal.daysOfWeek as any) : undefined}
            dailyStartTime={deal.dailyStartTime}
            dailyEndTime={deal.dailyEndTime}
          />

          {/* Expired State Action Banner */}
          {isExpired ? (
            <Card style={styles.expiredCard}>
              <Text variant="subtitle" color={theme.colors.danger} style={styles.expiredTitle}>
                This deal has ended
              </Text>
              <Text variant="caption" color={theme.colors.textMuted} style={styles.expiredBody}>
                This promotion is no longer redeemable. Explore other active offers from this venue:
              </Text>
              <Button
                title="See other deals from this restaurant"
                variant="secondary"
                size="sm"
                onPress={() => router.push(`/restaurant/${deal.restaurant.id}`)}
                style={styles.seeOtherBtn}
              />
            </Card>
          ) : null}

          {/* 5. Description */}
          {deal.description ? (
            <View style={styles.sectionMargin}>
              <Text variant="subtitle" style={styles.sectionTitle}>
                Deal Overview
              </Text>
              <Text variant="body" color={theme.colors.text} style={styles.descriptionText}>
                {deal.description}
              </Text>
            </View>
          ) : null}

          {/* 6. Service Modes Available */}
          <View style={styles.sectionMargin}>
            <Text variant="subtitle" style={styles.sectionTitle}>
              Available Services
            </Text>
            <ServiceChips availableModes={deal.serviceModes} />
          </View>

          {/* 7. Promo Code (If present) */}
          {deal.code ? <PromoCode code={deal.code} /> : null}

          {/* 8. Terms & Conditions Accordion */}
          {deal.termsAndConditions?.length ? (
            <TermsAccordion terms={deal.termsAndConditions} />
          ) : null}

          {/* 9. Location & Hours Card */}
          <View style={styles.sectionMargin}>
            <Text variant="subtitle" style={styles.sectionTitle}>
              Location & Hours
            </Text>
            <Card style={styles.locationCard}>
              <View style={styles.locationHeaderRow}>
                <Ionicons name="location-sharp" size={20} color={theme.colors.primary} />
                <View style={styles.addressContainer}>
                  <Text variant="subtitle" style={styles.areaTitle}>
                    {deal.restaurant.areaName}
                  </Text>
                  {deal.restaurant.address ? (
                    <Text variant="caption" color={theme.colors.textMuted}>
                      {deal.restaurant.address}
                    </Text>
                  ) : null}
                  {deal.restaurant.distanceM !== undefined ? (
                    <Text variant="caption" color={theme.colors.primary} style={{ marginTop: 2 }}>
                      {formatDistance(deal.restaurant.distanceM)} away
                    </Text>
                  ) : null}
                </View>
              </View>

              {/* Opening Hours info row */}
              <TouchableOpacity
                style={styles.hoursRow}
                onPress={() => setHoursSheetVisible(true)}
                activeOpacity={0.7}
              >
                <Badge label={isOpen ? 'OPEN' : 'CLOSED'} variant={isOpen ? 'open' : 'closed'} />
                <Text variant="caption" style={styles.hoursText} numberOfLines={1}>
                  {openLabel}
                </Text>
                <Ionicons name="chevron-forward" size={14} color={theme.colors.textMuted} />
              </TouchableOpacity>

              <Button
                title="Get Directions"
                variant="secondary"
                size="sm"
                leftIcon={<Ionicons name="navigate-outline" size={16} color={theme.colors.text} />}
                onPress={handleDirectionsPress}
                style={styles.directionsBtn}
              />
            </Card>
          </View>

          {/* 10. Report Deal Link */}
          <View style={styles.reportContainer}>
            <TouchableOpacity
              style={styles.reportLink}
              onPress={() => setReportSheetVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Report this deal"
            >
              <Ionicons name="flag-outline" size={14} color={theme.colors.textMuted} />
              <Text variant="caption" color={theme.colors.textMuted}>
                Report an issue with this deal
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* 11. Sticky Bottom CTA Bar */}
      <StickyCtaBar
        orderAction={orderAction}
        phone={deal.restaurant.phone}
        location={{
          lat: deal.restaurant.location?.lat || 33.7294,
          lng: deal.restaurant.location?.lng || 73.0747,
          name: deal.restaurant.name,
        }}
        isExpired={isExpired}
        onOrderPress={() => logDealEvent(deal.id, 'click_order')}
        onCallPress={() => logDealEvent(deal.id, 'click_call')}
        onDirectionsPress={() => logDealEvent(deal.id, 'click_directions')}
      />

      {/* Modals & Bottom Sheets */}
      <ReportDealSheet
        visible={reportSheetVisible}
        dealId={deal.id}
        onClose={() => setReportSheetVisible(false)}
        onSignInRequired={() => setSignInPromptVisible(true)}
      />

      <OpeningHoursSheet
        visible={hoursSheetVisible}
        onClose={() => setHoursSheetVisible(false)}
        openingHours={deal.restaurant.openingHours}
      />

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
  scrollContent: {
    paddingBottom: theme.spacing.xl,
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
    height: 240,
  },
  contentPadding: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  dealTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  restaurantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.radii.card,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  restaurantInfo: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  restaurantName: {
    fontWeight: '700',
  },
  expiredCard: {
    marginVertical: theme.spacing.md,
    backgroundColor: 'rgba(220, 38, 38, 0.05)',
    borderColor: 'rgba(220, 38, 38, 0.2)',
  },
  expiredTitle: {
    fontWeight: '700',
    marginBottom: 4,
  },
  expiredBody: {
    marginBottom: theme.spacing.sm,
  },
  seeOtherBtn: {
    alignSelf: 'flex-start',
  },
  sectionMargin: {
    marginTop: theme.spacing.md,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
  },
  descriptionText: {
    lineHeight: 22,
  },
  locationCard: {
    padding: theme.spacing.md,
  },
  locationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: theme.spacing.sm,
  },
  addressContainer: {
    flex: 1,
  },
  areaTitle: {
    fontWeight: '700',
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginTop: theme.spacing.xs,
  },
  hoursText: {
    flex: 1,
    fontWeight: '500',
  },
  directionsBtn: {
    marginTop: theme.spacing.sm,
  },
  reportContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  reportLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: theme.spacing.xs,
  },
});
