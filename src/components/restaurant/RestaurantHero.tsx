import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Share, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../ui/Avatar';
import { requireAuth } from '../../features/auth/requireAuth';
import { useToast } from '../ui/Toast';
import { theme } from '../../theme';

export interface RestaurantHeroProps {
  coverUrl?: string;
  logoUrl?: string;
  name: string;
  onBack: () => void;
  onSignInRequired?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const RestaurantHero: React.FC<RestaurantHeroProps> = ({
  coverUrl,
  logoUrl,
  name,
  onBack,
  onSignInRequired,
}) => {
  const { showToast } = useToast();
  const [coverErr, setCoverErr] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const fallbackCover =
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80';

  const handleFavoritePress = () => {
    requireAuth(
      () => {
        showToast('Saving places is coming soon!', 'info');
      },
      () => {
        onSignInRequired?.();
      },
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${name} on DealPlate!`,
        title: name,
      });
    } catch (err) {
      showToast('Could not open share menu', 'error');
    }
  };

  return (
    <View style={styles.heroContainer}>
      {/* Cover Image */}
      <View style={styles.coverWrapper}>
        <Image
          source={{ uri: coverErr || !coverUrl ? fallbackCover : coverUrl }}
          style={styles.coverImage}
          onError={() => setCoverErr(true)}
          contentFit="cover"
        />
        <View style={styles.gradientOverlay} />
      </View>

      {/* Top Floating Buttons Header */}
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
            accessibilityLabel="Share restaurant"
          >
            <Ionicons name="share-outline" size={20} color={theme.colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleFavoritePress}
            accessibilityLabel="Favorite restaurant"
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite ? theme.colors.danger : theme.colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Overlapping Logo */}
      <View style={styles.logoBadgeContainer}>
        <Avatar uri={logoUrl} size={64} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroContainer: {
    width: '100%',
    height: 210,
    position: 'relative',
    backgroundColor: theme.colors.border,
    marginBottom: theme.spacing.xl,
  },
  coverWrapper: {
    width: '100%',
    height: 180,
    overflow: 'hidden',
    position: 'relative',
  },
  coverImage: {
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
  logoBadgeContainer: {
    position: 'absolute',
    bottom: 0,
    left: theme.spacing.lg,
    borderRadius: theme.radii.full,
    borderWidth: 3,
    borderColor: theme.colors.surface,
    ...theme.shadows.md,
  },
});
