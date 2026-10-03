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
import { signInSchema, SignInInput } from '../../src/validation/auth';
import { authService } from '../../src/services/api/auth';
import { useToast } from '../../src/components/ui/Toast';
import { AppError } from '../../src/lib/errors';
import { theme } from '../../src/theme';

export default function SignInScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isGoogleEnabled = process.env.EXPO_PUBLIC_ENABLE_GOOGLE_AUTH === 'true';

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignInInput) => {
    setSubmitting(true);
    try {
      await authService.signIn(data);
      showToast('Welcome back!', 'Signed in successfully', 'success');
      router.replace('/(tabs)');
    } catch (err: unknown) {
      const appErr = err as AppError;
      showToast('Sign In Failed', appErr.userMessage || 'Incorrect email or password', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await authService.signInWithGoogle();
    } catch (err: unknown) {
      const appErr = err as AppError;
      showToast(
        'Google Sign-In',
        appErr.userMessage || 'Could not complete Google Sign-In',
        'error',
      );
    }
  };

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
            <Text variant="display" style={styles.title}>
              Sign In
            </Text>
            <Text variant="body" color={theme.colors.textMuted} style={styles.subtitle}>
              Welcome back to DealPlate Islamabad
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email Field */}
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

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text variant="caption" style={styles.label}>
                  Password
                </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                  <Text variant="caption" color={theme.colors.primary} style={styles.forgotLink}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>
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
                      placeholder="••••••••"
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

            {/* Submit Button */}
            <Button
              title="Sign In"
              variant="primary"
              size="lg"
              loading={submitting}
              fullWidth
              onPress={handleSubmit(onSubmit)}
              style={styles.submitButton}
            />

            {/* Optional Google Sign In */}
            {isGoogleEnabled ? (
              <Button
                title="Continue with Google"
                variant="secondary"
                size="lg"
                fullWidth
                onPress={handleGoogleSignIn}
                leftIcon={<Ionicons name="logo-google" size={18} color="#EA4335" />}
                style={styles.googleButton}
              />
            ) : null}

            {/* Sign Up Redirect */}
            <View style={styles.footerRow}>
              <Text variant="body" color={theme.colors.textMuted}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
                <Text variant="body" color={theme.colors.primary} style={styles.signUpText}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            {/* Guest Link */}
            <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.guestButton}>
              <Text variant="subtitle" color={theme.colors.textMuted}>
                Continue as Guest →
              </Text>
            </TouchableOpacity>
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
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  label: {
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  forgotLink: {
    fontWeight: '600',
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
  eyeIcon: {
    padding: theme.spacing.xs,
  },
  errorText: {
    marginTop: 4,
  },
  submitButton: {
    marginTop: theme.spacing.md,
  },
  googleButton: {
    marginTop: theme.spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.xl,
  },
  signUpText: {
    fontWeight: '700',
  },
  guestButton: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
});
