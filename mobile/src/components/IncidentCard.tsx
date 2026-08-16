import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Incident } from '../types';
import { CategoryBadge } from './CategoryBadge';
import { colors, radius, shadow, spacing, typography } from '../theme/theme';
import { formatRelativeTime } from '../utils/formatTime';

interface Props {
  incident: Incident;
  onPress: () => void;
}

export function IncidentCard({ incident, onPress }: Props) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.card}>
      {incident.imageUrl ? (
        <Image source={{ uri: incident.imageUrl }} style={styles.image} contentFit="cover" />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Ionicons name="image-outline" size={28} color={colors.textMuted} />
        </View>
      )}
      <View style={styles.body}>
        <CategoryBadge category={incident.category} />
        <Text style={styles.title} numberOfLines={1}>
          {incident.title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {incident.description}
        </Text>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={13} color={colors.textMuted} />
          <Text style={styles.metaText} numberOfLines={1}>
            {incident.address ?? `${incident.latitude.toFixed(3)}, ${incident.longitude.toFixed(3)}`}
          </Text>
        </View>
        <View style={styles.footerRow}>
          <Text style={styles.reporter}>Reported by {incident.reporter.name}</Text>
          <Text style={styles.time}>{formatRelativeTime(incident.createdAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadow.card,
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: colors.border,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  metaText: {
    ...typography.caption,
    color: colors.textMuted,
    marginLeft: 4,
    flexShrink: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  reporter: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  time: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
