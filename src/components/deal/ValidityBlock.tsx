import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../ui/Text';
import { CountdownText } from './CountdownText';
import { formatDealSchedule } from '../../utils/time';
import { isDealActiveNow } from '../../utils/dealStatus';
import { theme } from '../../theme';

export interface ValidityBlockProps {
  endDate: string;
  startDate?: string;
  daysOfWeek?: number[];
  dailyStartTime?: string;
  dailyEndTime?: string;
}

export const ValidityBlock: React.FC<ValidityBlockProps> = ({
  endDate,
  startDate,
  daysOfWeek,
  dailyStartTime,
  dailyEndTime,
}) => {
  const endMs = new Date(endDate).getTime();
  const nowMs = Date.now();
  const diffMs = endMs - nowMs;

  const isExpired = diffMs <= 0;
  const isEndingWithin24h = !isExpired && diffMs <= 24 * 60 * 60 * 1000;

  const scheduleText = formatDealSchedule({
    daysOfWeek,
    dailyStartTime,
    dailyEndTime,
  });

  if (isExpired) {
    return (
      <View style={styles.expiredBanner}>
        <Ionicons name="alert-circle-outline" size={18} color={theme.colors.textMuted} />
        <Text variant="caption" style={styles.expiredText}>
          This deal has ended
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Prominent Red Banner when ending within 24 hours */}
      {isEndingWithin24h ? (
        <View style={styles.urgentBanner}>
          <Ionicons name="alarm" size={18} color={theme.colors.surface} />
          <Text variant="subtitle" style={styles.urgentBannerText}>
            Ends in <CountdownText targetDate={endDate} textStyle={styles.urgentCountdown} />
          </Text>
        </View>
      ) : (
        <View style={styles.standardCountdownRow}>
          <Ionicons name="time-outline" size={16} color={theme.colors.primary} />
          <Text variant="caption" style={styles.standardLabel}>
            Expires in:{' '}
          </Text>
          <CountdownText targetDate={endDate} textStyle={styles.standardCountdown} />
        </View>
      )}

      {/* Schedule timing string */}
      {scheduleText ? (
        <View style={styles.scheduleRow}>
          <Ionicons name="calendar-outline" size={14} color={theme.colors.textMuted} />
          <Text variant="caption" color={theme.colors.textMuted} style={styles.scheduleText}>
            {scheduleText}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.sm,
  },
  urgentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.danger,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.card,
    gap: theme.spacing.xs,
  },
  urgentBannerText: {
    color: theme.colors.surface,
    fontWeight: '700',
  },
  urgentCountdown: {
    color: theme.colors.surface,
    fontWeight: '800',
  },
  standardCountdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 90, 31, 0.08)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.sm,
    alignSelf: 'flex-start',
  },
  standardLabel: {
    fontWeight: '600',
    color: theme.colors.primaryDark,
  },
  standardCountdown: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  expiredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.sm,
    gap: 6,
    alignSelf: 'flex-start',
  },
  expiredText: {
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    gap: 6,
  },
  scheduleText: {
    fontWeight: '500',
  },
});
