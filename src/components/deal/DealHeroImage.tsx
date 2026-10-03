import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Share, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { DealBadge } from './DealBadge';
import { DealType } from '../../types/domain';
import { requireAuth } from '../../features/auth/requireAuth';
import { useToast } from '../ui/Toast';
import { theme } from '../../theme';

export interface DealHeroImageProps {
  dealId: string;
  imageUrl?: string;
  title: string;
  dealType: DealType;
  discountPercent?: number;
  onBack: () => void;
  onSignInRequired?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const DealHeroImage: React.FC<DealHeroImageProps> = ({
  dealId,
  imageUrl,
  title,
  dealType,
  discountPercent,
  onBack,
  onSignInRequired,
}) => {
  const { showToast } = useToast();
  const [imageErr, setImageErr] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const fallbackImage =
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80';

  const handleFavoritePress = () => {
    requireAuth(
      () => {
        showToast('Saving deals is coming soon!', 'info');
      },
      () => {
        onSignInRequired?.();
      },
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this deal "${title}" on DealPlate! dealplate://deal/${dealId}`,
        title: title,
      });
    } catch (err) {
      showToast('Could not open share menu', 'error');
    }
  };

  return (
    <View style={styles.heroContainer}>
      <Image
        source={{ uri: imageErr || !imageUrl ? fallbackImage : imageUrl }}
        style={styles.heroImage}
        onError={() => setImageErr(true)}
        contentFit="cover"
      />
      <View style={styles.gradientOverlay} />

      {/* Top Floating Actions Header */}
      <View style={styles.topActionsRow}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onBack}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.rightIconsGroup}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleShare}
            accessibilityLabel="Share deal"
          >
            <Ionicons name="share-outline" size={20} color={theme.colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleFavoritePress}
            accessibilityLabel="Save deal"
          >
            <Ionicons
              name={isSaved ? 'heart' : 'heart-outline'}
              size={22}
              color={isSaved ? theme.colors.danger : theme.colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Deal Badge Overlay */}
      <View style={styles.badgeOverlay}>
        <DealBadge dealType={dealType} discountPercent={discountPercent} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroContainer: {
    width: '100%',
    height: 240,
    position: 'relative',
    backgroundColor: theme.colors.border,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  topActionsRow: {
    position: 'absolute',
    top: theme.spacing.md,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  rightIconsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  badgeOverlay: {
    position: 'absolute',
    bottom: theme.spacing.md,
    left: theme.spacing.lg,
  },
});
