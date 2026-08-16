import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { colors, radius, typography } from '../theme/theme';

interface Props {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline' | 'danger';
  style?: ViewStyle;
}

export function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
  variant = 'primary',
  style,
}: Props) {
  const isOutline = variant === 'outline';
  const isDanger = variant === 'danger';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        isOutline && styles.outline,
        isDanger && styles.danger,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? colors.primary : colors.white} />
      ) : (
        <Text style={[styles.label, isOutline && styles.labelOutline]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  disabled: {
    opacity: 0.6,
  },
  label: {
    color: colors.white,
    ...typography.bodyBold,
  },
  labelOutline: {
    color: colors.primary,
  },
});
