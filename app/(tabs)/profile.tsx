import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../src/components/ui/Screen';
import { Text } from '../../src/components/ui/Text';
import { Button } from '../../src/components/ui/Button';
import { Avatar } from '../../src/components/ui/Avatar';
import { Badge } from '../../src/components/ui/Badge';
import { Card } from '../../src/components/ui/Card';
import { useSessionStore, selectIsAdmin, selectIsOwner } from '../../src/store/session';
import { authService } from '../../src/services/api/auth';
import { useToast } from '../../src/components/ui/Toast';
import { theme } from '../../src/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const status = useSessionStore((state) => state.status);
  const profile = useSessionStore((state) => state.profile);
  const isAdmin = useSessionStore(selectIsAdmin);
  const isOwner = useSessionStore(selectIsOwner);

  const handleLogOut = async () => {
    try {
      await authService.signOut();
      showToast('Signed Out', 'You have been logged out successfully', 'info');
    } catch (err) {
      showToast('Sign Out Failed', 'Could not sign out completely', 'error');
    }
  };

  if (status !== 'authenticated' || !profile) {
    return (
      <Screen style={styles.screen}>
        <View style={styles.guestContainer}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={48} color={theme.colors.textMuted} />
          </View>
          <Text variant="title" style={styles.guestTitle}>
            Welcome to DealPlate
          </Text>
          <Text variant="body" color={theme.colors.textMuted} style={styles.guestSubtitle}>
            Sign in or create an account to unlock exclusive Islamabad food deals, save favorites,
            and track redemptions.
          </Text>

          <Button
            title="Sign In"
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => router.push('/(auth)/sign-in')}
            style={styles.guestButton}
          />
          <Button
            title="Create Account"
            variant="secondary"
            size="lg"
            fullWidth
            onPress={() => router.push('/(auth)/sign-up')}
            style={styles.guestButton}
          />
        </View>
      </Screen>
    );
  }

  const getRoleBadgeVariant = () => {
    if (isAdmin) return 'discount' as const;
    if (isOwner) return 'featured' as const;
    return 'neutral' as const;
  };

  return (
    <Screen style={styles.screen} scrollable>
      {/* Header Profile Card */}
      <Card style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <Avatar uri={profile.avatarUrl} size={64} />
          <View style={styles.profileInfo}>
            <Text variant="title" style={styles.nameText}>
              {profile.fullName}
            </Text>
            <Text variant="body" color={theme.colors.textMuted} style={styles.emailText}>
              {profile.email}
            </Text>
            <View style={styles.roleBadgeRow}>
              <Badge label={profile.role} variant={getRoleBadgeVariant()} />
              {profile.phone ? (
                <Text variant="caption" color={theme.colors.textMuted} style={styles.phoneText}>
                  {profile.phone}
                </Text>
              ) : null}
            </View>
          </View>
        </View>
      </Card>

      {/* Account Actions Section */}
      <View style={styles.sectionContainer}>
        <Text variant="caption" color={theme.colors.textMuted} style={styles.sectionTitle}>
          ACCOUNT PREFERENCES
        </Text>

        <Card style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <Ionicons
              name="notifications-outline"
              size={20}
              color={theme.colors.text}
              style={styles.menuIcon}
            />
            <Text variant="subtitle" style={styles.menuLabel}>
              Push Notifications
            </Text>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <Ionicons
              name="location-outline"
              size={20}
              color={theme.colors.text}
              style={styles.menuIcon}
            />
            <Text variant="subtitle" style={styles.menuLabel}>
              Preferred Sector / Area
            </Text>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </Card>
      </View>

      {/* Log Out Button */}
      <Button
        title="Log Out"
        variant="ghost"
        size="lg"
        fullWidth
        onPress={handleLogOut}
        leftIcon={<Ionicons name="log-out-outline" size={20} color={theme.colors.danger} />}
        style={styles.logOutButton}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  guestTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  guestSubtitle: {
    textAlign: 'center',
    marginBottom: theme.spacing.xxl,
    lineHeight: 22,
  },
  guestButton: {
    marginBottom: theme.spacing.md,
  },
  profileCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  nameText: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  emailText: {
    marginVertical: 2,
  },
  roleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  phoneText: {
    marginLeft: theme.spacing.sm,
  },
  sectionContainer: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
  menuCard: {
    borderRadius: theme.radii.card,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    minHeight: 52,
  },
  menuIcon: {
    marginRight: theme.spacing.md,
  },
  menuLabel: {
    flex: 1,
    color: theme.colors.text,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.md,
  },
  logOutButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xxxl,
  },
});
