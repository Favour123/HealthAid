import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORY_META } from '../theme/categories';
import { IncidentCategory } from '../types';
import { colors, radius, spacing, typography } from '../theme/theme';

export function CategoryBadge({ category }: { category: IncidentCategory }) {
  const meta = CATEGORY_META[category];
  return (
    <View style={[styles.badge, { backgroundColor: `${meta.color}1A` }]}>
      <Ionicons name={meta.icon} size={13} color={meta.color} style={{ marginRight: 5 }} />
      <Text style={[styles.label, { color: meta.color }]}>{meta.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  label: {
    ...typography.small,
  },
});
