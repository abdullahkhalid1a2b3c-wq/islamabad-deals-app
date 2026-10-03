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
import { signUpSchema, SignUpInput } from '../../src/validation/auth';
import { authService } from '../../src/services/api/auth';
import { useToast } from '../../src/components/ui/Toast';
import { AppError } from '../../src/lib/errors';
import { theme } from '../../src/theme';

export default function SignUpScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: SignUpInput) => {
    setSubmitting(true);
    try {
      const res = await authService.signUp(data);
      if (res.requiresEmailVerification) {
        setRegisteredEmail(data.email);
        setNeedsVerification(true);
      } else {
        showToast('Welcome!', 'Account created successfully', 'success');
        router.replace('/(tabs)');
      }
    } catch (err: unknown) {
      const appErr = err as AppError;
      showToast('Sign Up Failed', appErr.userMessage || 'Could not create account', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (needsVerification) {
    return (
      <Screen style={styles.screen}>
        <View style={styles.verifyContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="mail-unread" size={44} color={theme.colors.primary} />
          </View>

          <Text variant="display" style={styles.verifyTitle}>
            Check Your Email
          </Text>

          <Text variant="body" color={theme.colors.textMuted} style={styles.verifyMessage}>
            We've sent a verification link to{' '}
            <Text variant="subtitle" color={theme.colors.text}>
              {registeredEmail}
            </Text>
            . Please click the link to confirm your account and sign in.
          </Text>

          <Button
            title="Back to Sign In"
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => router.replace('/(auth)/sign-in')}
            style={styles.verifyButton}
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
          {/* Header */}
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
              Create Account
            </Text>
            <Text variant="body" color={theme.colors.textMuted} style={styles.subtitle}>
              Join DealPlate to discover & redeem Islamabad's top food deals
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text variant="caption" style={styles.label}>
                Full Name
              </Text>
              <Controller
                control={control}
                name="fullName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={[styles.inputWrapper, errors.fullName && styles.inputError]}>
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color={theme.colors.textMuted}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Abdullah Khalid"
                      placeholderTextColor={theme.colors.textMuted}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  </View>
                )}
              />
              {errors.fullName ? (
                <Text variant="caption" color={theme.colors.danger} style={styles.errorText}>
                  {errors.fullName.message}
                </Text>
              ) : null}
            </View>

            {/* Email */}
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

            {/* Phone (Optional) */}
            <View style={styles.inputGroup}>
              <Text variant="caption" style={styles.label}>
                Phone Number (Optional)
              </Text>
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={[styles.inputWrapper, errors.phone && styles.inputError]}>
                    <Ionicons
                      name="call-outline"
                      size={20}
                      color={theme.colors.textMuted}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="0300 1234567"
                      placeholderTextColor={theme.colors.textMuted}
                      keyboardType="phone-pad"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  </View>
                )}
              />
              {errors.phone ? (
                <Text variant="caption" color={theme.colors.danger} style={styles.errorText}>
                  {errors.phone.message}
                </Text>
              ) : null}
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text variant="caption" style={styles.label}>
                Password
              </Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={theme.colors.textMuted}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Min 8 chars, letters & numbers"
                      placeholderTextColor={theme.colors.textMuted}
                      secureTextEntry={!showPassword}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={theme.colors.textMuted}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              />
              {errors.password ? (
                <Text variant="caption" color={theme.colors.danger} style={styles.errorText}>
                  {errors.password.message}
                </Text>
              ) : null}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text variant="caption" style={styles.label}>
                Confirm Password
              </Text>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputError]}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={theme.colors.textMuted}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Re-enter password"
                      placeholderTextColor={theme.colors.textMuted}
                      secureTextEntry={!showPassword}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  </View>
                )}
              />
              {errors.confirmPassword ? (
                <Text variant="caption" color={theme.colors.danger} style={styles.errorText}>
                  {errors.confirmPassword.message}
                </Text>
              ) : null}
            </View>

            {/* Submit Button */}
            <Button
              title="Create Account"
              variant="primary"
              size="lg"
              loading={submitting}
              fullWidth
              onPress={handleSubmit(onSubmit)}
              style={styles.submitButton}
            />

            {/* Sign In Redirect */}
            <View style={styles.footerRow}>
              <Text variant="body" color={theme.colors.textMuted}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
                <Text variant="body" color={theme.colors.primary} style={styles.signInText}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
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
    paddingVertical: theme.spacing.xl,
  },
  header: {
    marginBottom: theme.spacing.lg,
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
    fontSize: 14,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
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
    height: 50,
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
    fontSize: 14,
    color: theme.colors.text,
  },
  eyeIcon: {
    padding: theme.spacing.xs,
  },
  errorText: {
    marginTop: 4,
  },
  submitButton: {
    marginTop: theme.spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  signInText: {
    fontWeight: '700',
  },

  // Verification Screen State
  verifyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: theme.radii.full,
    backgroundColor: '#FFF0EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  verifyTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  verifyMessage: {
    textAlign: 'center',
    marginBottom: theme.spacing.xxl,
    lineHeight: 22,
  },
  verifyButton: {
    marginTop: theme.spacing.md,
  },
});
