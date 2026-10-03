import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { theme, TypographyVariant } from '../../theme';

export interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  color = theme.colors.text,
  align = 'left',
  style,
  children,
  ...props
}) => {
  return (
    <RNText
      style={[theme.typography[variant], { color, textAlign: align }, style]}
      maxFontSizeMultiplier={1.3}
      {...props}
    >
      {children}
    </RNText>
  );
};
