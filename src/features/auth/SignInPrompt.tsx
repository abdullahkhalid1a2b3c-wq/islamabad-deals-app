import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { theme } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

export interface SignInPromptProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export const SignInPrompt: React.FC<SignInPromptProps> = ({
  visible,
  onClose,
  title = 'Sign in to Continue',
  message = 'Claim exclusive deals, save favorite restaurants, and earn rewards by signing in to DealPlate.',
}) => {
  const router = useRouter();

  const handleSignIn = () => {
    onClose();
    router.push('/(auth)/sign-in');
  };

  const handleSignUp = () => {
    onClose();
    router.push('/(auth)/sign-up');
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <View style={styles.iconCircle}>
          <Ionicons name="lock-closed" size={32} color={theme.colors.primary} />
        </View>

        <Text variant="title" style={styles.title}>
          {title}
        </Text>

        <Text variant="body" color={theme.colors.textMuted} style={styles.message}>
          {message}
        </Text>

        <Button
          title="Sign In"
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleSignIn}
          style={styles.button}
        />

        <Button
          title="Create an Account"
          variant="secondary"
          size="lg"
          fullWidth
          onPress={handleSignUp}
          style={styles.button}
        />

        <Button title="Continue as Guest" variant="ghost" size="md" fullWidth onPress={onClose} />
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: theme.radii.full,
    backgroundColor: '#FFF0EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
    color: theme.colors.text,
  },
  message: {
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
  button: {
    marginBottom: theme.spacing.md,
  },
});
