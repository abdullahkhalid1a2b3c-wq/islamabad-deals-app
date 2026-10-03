import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../ui/Button';
import { OrderAction } from '../../features/ordering/getOrderAction';
import { normalizePhone, buildDirectionsUrl } from '../../utils/links';
import { openExternalUrl } from '../../utils/openExternal';
import { useToast } from '../ui/Toast';
import { theme } from '../../theme';

export interface StickyCtaBarProps {
  orderAction: OrderAction;
  phone?: string | null;
  location?: { lat: number; lng: number; name?: string } | null;
  isExpired?: boolean;
  onOrderPress?: () => void;
  onCallPress?: () => void;
  onDirectionsPress?: () => void;
}

export const StickyCtaBar: React.FC<StickyCtaBarProps> = ({
  orderAction,
  phone,
  location,
  isExpired = false,
  onOrderPress,
  onCallPress,
  onDirectionsPress,
}) => {
  const { showToast } = useToast();

  const phoneUrl = normalizePhone(phone);
  const directionsUrl = location
    ? buildDirectionsUrl({ lat: location.lat, lng: location.lng, name: location.name })
    : null;

  const handlePrimaryPress = () => {
    onOrderPress?.();

    if (isExpired) {
      showToast('This deal has expired', 'info');
      return;
    }

    if (orderAction.type === 'coming_soon') {
      showToast('Online ordering for this restaurant is coming soon!', 'info');
      return;
    }

    if (orderAction.url) {
      openExternalUrl(orderAction.url, showToast);
    }
  };

  const handleCall = () => {
    onCallPress?.();
    if (phoneUrl) {
      openExternalUrl(phoneUrl, showToast);
    } else {
      showToast('Phone number not available', 'info');
    }
  };

  const handleDirections = () => {
    onDirectionsPress?.();
    if (directionsUrl) {
      openExternalUrl(directionsUrl, showToast);
    } else {
      showToast('Location directions not available', 'info');
    }
  };

  return (
    <View style={styles.container}>
      {/* Secondary Call Button */}
      {phoneUrl ? (
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={handleCall}
          accessibilityLabel="Call restaurant"
        >
          <Ionicons name="call-outline" size={20} color={theme.colors.text} />
        </TouchableOpacity>
      ) : null}

      {/* Secondary Directions Button */}
      {directionsUrl ? (
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={handleDirections}
          accessibilityLabel="Get directions"
        >
          <Ionicons name="location-outline" size={20} color={theme.colors.text} />
        </TouchableOpacity>
      ) : null}

      {/* Primary Action Button */}
      <Button
        title={isExpired ? 'Deal Expired' : orderAction.label}
        variant={isExpired || orderAction.type === 'coming_soon' ? 'secondary' : 'primary'}
        disabled={isExpired}
        onPress={handlePrimaryPress}
        style={styles.primaryBtn}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.sm,
    ...theme.shadows.md,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: theme.radii.button,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtn: {
    flex: 1,
  },
});
