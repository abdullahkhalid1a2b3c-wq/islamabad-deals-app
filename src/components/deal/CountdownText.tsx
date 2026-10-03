import React, { useEffect, useState, useRef } from 'react';
import { Text, TextProps } from '../ui/Text';
import { theme } from '../../theme';

export interface CountdownTextProps extends Omit<TextProps, 'children'> {
  endDate: string | Date;
}

export function formatCountdown(endMs: number, nowMs: number): { label: string; isEndingSoon: boolean } {
  const diffMs = endMs - nowMs;
  if (diffMs <= 0) {
    return { label: 'Expired', isEndingSoon: true };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);

  if (days >= 1) {
    return {
      label: `Ends in ${days} ${days === 1 ? 'day' : 'days'}`,
      isEndingSoon: false,
    };
  }

  const hours = totalHours;
  const mins = totalMinutes % 60;
  const secs = totalSeconds % 60;

  if (hours >= 1) {
    return {
      label: `Ends in ${hours}h ${mins}m`,
      isEndingSoon: hours < 6,
    };
  }

  return {
    label: `Ends in ${mins}m ${secs < 10 ? '0' : ''}${secs}s`,
    isEndingSoon: true,
  };
}

export const CountdownText: React.FC<CountdownTextProps> = ({
  endDate,
  color,
  style,
  ...props
}) => {
  const targetMs = new Date(endDate).getTime();
  const [countdown, setCountdown] = useState(() => formatCountdown(targetMs, Date.now()));
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updateCountdown = () => {
      const currentNow = Date.now();
      const nextFormat = formatCountdown(targetMs, currentNow);
      setCountdown(nextFormat);

      const remainingSecs = Math.floor((targetMs - currentNow) / 1000);

      // Determine next update interval: every 1s if under 1 hour; every 60s if over 1 hour
      const nextInterval = remainingSecs <= 3600 ? 1000 : 60000;

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(updateCountdown, nextInterval);
    };

    updateCountdown();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [targetMs]);

  const textColor = color || (countdown.isEndingSoon ? theme.colors.danger : theme.colors.textMuted);

  return (
    <Text variant="caption" color={textColor} style={style} {...props}>
      {countdown.label}
    </Text>
  );
};
