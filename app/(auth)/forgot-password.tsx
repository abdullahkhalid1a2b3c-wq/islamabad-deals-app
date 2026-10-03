import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../src/components/ui/Screen';
import { Text } from '../../src/components/ui/Text';
import { Button } from '../../src/components/ui/Button';
import { forgotPasswordSchema, ForgotPasswordInput } from '../../src/validation/auth';
import { authService } from '../../src/services/api/auth';
import { useToast } from '../../src/components/ui/Toast';
import { AppError } from '../../src/lib/errors';
import { theme } from '../../src/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setSubmitting(true);
    try {
      await authService.sendPasswordReset(data.email);
      setSentEmail(data.email);
      setSent(true);
    } catch (err: unknown) {
      const appErr = err as AppError;
      showToast('Reset Failed', appErr.userMessage || 'Could not send reset email', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <Screen style={styles.screen}>
        <View style={styles.cardContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="key" size={40} color={theme.colors.primary} />
          </View>
          <Text variant="display" style={styles.title}>
            Reset Link Sent
          </Text>
          <Text variant="body" color={theme.colors.textMuted} style={styles.message}>
            If an account exists for{' '}
            <Text variant="subtitle" color={theme.colors.text}>
              {sentEmail}
            </Text>
            , you will receive password reset instructions shortly.
          </Text>
          <Button
            title="Back to Sign In"
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => router.replace('/(auth)/sign-in')}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text variant="display" style={styles.title}>
              Reset Password
            </Text>
            <Text variant="body" color={theme.colors.textMuted} style={styles.subtitle}>
              Enter your registered email and we'll send you password recovery instructions.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text variant="caption" style={styles.label}>
                Email Address
              </Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={theme.colors.textMuted}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="name@example.com"
                      placeholderTextColor={theme.colors.textMuted}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  </View>
                )}
              />
              {errors.email ? (
                <Text variant="caption" color={theme.colors.danger} style={styles.errorText}>
                  {errors.email.message}
                </Text>
              ) : null}
            </View>

            <Button
              title="Send Reset Link"
              variant="primary"
              size="lg"
              loading={submitting}
              fullWidth
              onPress={handleSubmit(onSubmit)}
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: theme.spacing.lg,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  title: {
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 15,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.button,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    height: 52,
  },
  inputError: {
    borderColor: theme.colors.danger,
  },
  inputIcon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 15,
    color: theme.colors.text,
  },
  errorText: {
    marginTop: 4,
  },
  submitButton: {
    marginTop: theme.spacing.md,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: theme.radii.full,
    backgroundColor: '#FFF0EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  message: {
    textAlign: 'center',
    marginBottom: theme.spacing.xxl,
    lineHeight: 22,
  },
});
