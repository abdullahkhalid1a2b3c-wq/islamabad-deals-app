import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from '../ui/BottomSheet';
import { Text } from '../ui/Text';
import { OpeningHours, Weekday } from '../../types/domain';
import { format12HourTime, getKarachiParts } from '../../utils/time';
import { theme } from '../../theme';

export interface OpeningHoursSheetProps {
  visible: boolean;
  onClose: () => void;
  openingHours?: OpeningHours | null;
}

const ALL_WEEKDAYS: Array<{ key: Weekday; label: string }> = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

export const OpeningHoursSheet: React.FC<OpeningHoursSheetProps> = ({
  visible,
  onClose,
  openingHours,
}) => {
  const currentWeekday = getKarachiParts(new Date()).weekday;

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="title" style={styles.headerTitle}>
            Opening Hours
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Schedule List */}
        <View style={styles.scheduleList}>
          {ALL_WEEKDAYS.map((day) => {
            const isToday = day.key === currentWeekday;
            const slots = openingHours?.[day.key];
            const isClosed = !slots || slots.length === 0;

            const formattedSlots = isClosed
              ? 'Closed'
              : slots
                  .map((s) => `${format12HourTime(s.open)} – ${format12HourTime(s.close)}`)
                  .join(', ');

            return (
              <View
                key={day.key}
                style={[styles.row, isToday && styles.todayRow]}
              >
                <View style={styles.dayLabelGroup}>
                  <Text
                    variant="body"
                    style={[styles.dayText, isToday && styles.todayDayText]}
                  >
                    {day.label}
                  </Text>
                  {isToday ? (
                    <View style={styles.todayBadge}>
                      <Text variant="caption" style={styles.todayBadgeText}>
                        TODAY
                      </Text>
                    </View>
                  ) : null}
                </View>

                <Text
                  variant="body"
                  style={[
                    styles.hoursText,
                    isToday && styles.todayHoursText,
                    isClosed && styles.closedText,
                  ]}
                >
                  {formattedSlots}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  scheduleList: {
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.sm,
  },
  todayRow: {
    backgroundColor: 'rgba(255, 90, 31, 0.08)',
  },
  dayLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayText: {
    fontWeight: '500',
    color: theme.colors.text,
  },
  todayDayText: {
    fontWeight: '700',
    color: theme.colors.primary,
  },
  todayBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radii.full,
  },
  todayBadgeText: {
    color: theme.colors.surface,
    fontSize: 10,
    fontWeight: '800',
  },
  hoursText: {
    fontWeight: '500',
    color: theme.colors.text,
  },
  todayHoursText: {
    fontWeight: '700',
    color: theme.colors.primaryDark,
  },
  closedText: {
    color: theme.colors.danger,
    fontWeight: '600',
  },
});
