import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from '../ui/BottomSheet';
import { Text } from '../ui/Text';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Chip';
import { reportSchema, ReportFormValues, REPORT_REASONS } from '../../validation/reports';
import { requireAuth } from '../../features/auth/requireAuth';
import { supabase } from '../../lib/supabase';
import { useToast } from '../ui/Toast';
import { theme } from '../../theme';

export interface ReportDealSheetProps {
  visible: boolean;
  dealId: string;
  onClose: () => void;
  onSignInRequired?: () => void;
}

export const ReportDealSheet: React.FC<ReportDealSheetProps> = ({
  visible,
  dealId,
  onClose,
  onSignInRequired,
}) => {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      reason: 'Wrong price',
      note: '',
    },
  });

  const onSubmit = async (values: ReportFormValues) => {
    if (cooldown) {
      showToast('Please wait a moment before submitting another report.', 'info');
      return;
    }

    requireAuth(
      async (session) => {
        try {
          setSubmitting(true);
          const { error } = await supabase.from('reports').insert({
            user_id: session.user.id,
            target_type: 'deal',
            target_id: dealId,
            reason: values.reason,
            details: values.note || null,
          });

          if (error) throw error;

          showToast('Thank you! Report submitted for review.', 'success');
          reset();
          onClose();

          // 10-second spam prevention cooldown
          setCooldown(true);
          setTimeout(() => setCooldown(false), 10000);
        } catch (err) {
          showToast('Failed to submit report. Please try again.', 'error');
        } finally {
          setSubmitting(false);
        }
      },
      () => {
        onClose();
        onSignInRequired?.();
      },
    );
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="title" style={styles.title}>
            Report this Deal
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <Text variant="caption" color={theme.colors.textMuted} style={styles.subtitle}>
          Help us keep DealPlate accurate. Select a reason for your report:
        </Text>

        {/* Reason Chip Options */}
        <Controller
          control={control}
          name="reason"
          render={({ field: { value, onChange } }) => (
            <View style={styles.reasonsRow}>
              {REPORT_REASONS.map((r) => (
                <Chip
                  key={r}
                  label={r}
                  selected={value === r}
                  onPress={() => onChange(r)}
                />
              ))}
            </View>
          )}
        />
        {errors.reason ? (
          <Text variant="caption" color={theme.colors.danger} style={styles.errorText}>
            {errors.reason.message}
          </Text>
        ) : null}

        {/* Optional Note Text Input */}
        <Text variant="caption" style={styles.noteLabel}>
          Additional details (optional)
        </Text>
        <Controller
          control={control}
          name="note"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              style={styles.textInput}
              value={value || ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Provide any additional details (max 300 chars)..."
              placeholderTextColor={theme.colors.textMuted}
              multiline
              maxLength={300}
              numberOfLines={3}
            />
          )}
        />
        {errors.note ? (
          <Text variant="caption" color={theme.colors.danger} style={styles.errorText}>
            {errors.note.message}
          </Text>
        ) : null}

        {/* Submit Button */}
        <Button
          title="Submit Report"
          variant="primary"
          loading={submitting}
          disabled={submitting || cooldown}
          onPress={handleSubmit(onSubmit)}
          style={styles.submitBtn}
        />
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
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: theme.spacing.xs,
  },
  subtitle: {
    marginBottom: theme.spacing.md,
  },
  reasonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: theme.spacing.md,
  },
  noteLabel: {
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  textInput: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    padding: theme.spacing.md,
    fontSize: 14,
    color: theme.colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: theme.spacing.lg,
  },
  errorText: {
    marginTop: -theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  submitBtn: {
    marginTop: theme.spacing.xs,
  },
});
