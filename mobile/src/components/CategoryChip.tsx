import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORY_META } from '../theme/categories';
import { IncidentCategory } from '../types';
import { colors, radius, spacing, typography } from '../theme/theme';

interface Props {
  category: IncidentCategory | 'ALL';
  selected: boolean;
  onPress: () => void;
}

export function CategoryChip({ category, selected, onPress }: Props) {
  const meta = category === 'ALL' ? null : CATEGORY_META[category];
  const tint = meta?.color ?? colors.primary;
  const label = meta?.label ?? 'All';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.chip,
        { borderColor: selected ? tint : colors.border, backgroundColor: selected ? tint : colors.surface },
      ]}
    >
      {meta ? (
        <Ionicons
          name={meta.icon}
          size={14}
          color={selected ? colors.white : tint}
          style={styles.icon}
        />
      ) : null}
      <Text style={[styles.label, { color: selected ? colors.white : colors.textPrimary }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    marginRight: spacing.sm,
  },
  icon: {
    marginRight: 6,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
  },
});
