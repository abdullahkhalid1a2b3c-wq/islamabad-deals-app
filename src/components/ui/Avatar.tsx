import React, { useState } from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

export interface AvatarProps extends ViewProps {
  uri?: string;
  size?: number;
  fallbackIcon?: keyof typeof Ionicons.glyphMap;
}

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  size = 40,
  fallbackIcon = 'person',
  style,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  return (
    <View
      style={[styles.container, { width: size, height: size, borderRadius: size / 2 }, style]}
      {...props}
    >
      {uri && !hasError ? (
        <Image
          source={{ uri }}
          style={styles.image}
          onError={() => setHasError(true)}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <Ionicons name={fallbackIcon} size={size * 0.5} color={theme.colors.textMuted} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
