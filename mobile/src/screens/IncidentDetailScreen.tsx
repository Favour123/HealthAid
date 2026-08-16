import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fetchIncident, deleteIncident } from '../api/incidents';
import { extractErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Incident } from '../types';
import { CategoryBadge } from '../components/CategoryBadge';
import { colors, radius, spacing, typography } from '../theme/theme';
import { RootStackParamList } from '../navigation/types';
import { formatRelativeTime } from '../utils/formatTime';

type Props = NativeStackScreenProps<RootStackParamList, 'IncidentDetail'>;

export function IncidentDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const { user } = useAuth();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchIncident(id)
      .then(setIncident)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  function openInMaps() {
    if (!incident) return;
    const label = encodeURIComponent(incident.title);
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${incident.latitude},${incident.longitude}`,
      android: `geo:0,0?q=${incident.latitude},${incident.longitude}(${label})`,
      default: `https://www.google.com/maps/search/?api=1&query=${incident.latitude},${incident.longitude}`,
    });
    Linking.openURL(url as string).catch(() => {
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${incident.latitude},${incident.longitude}`,
      );
    });
  }

  function confirmDelete() {
    Alert.alert('Delete report', 'This will permanently remove your incident report.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: handleDelete },
    ]);
  }

  async function handleDelete() {
    if (!incident) return;
    setDeleting(true);
    try {
      await deleteIncident(incident.id);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Could not delete', extractErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error || !incident) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>{error ?? 'Incident not found'}</Text>
      </SafeAreaView>
    );
  }

  const isOwner = user?.id === incident.reporterId;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView>
        {incident.imageUrl ? (
          <Image source={{ uri: incident.imageUrl }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Ionicons name="image-outline" size={40} color={colors.textMuted} />
          </View>
        )}

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.content}>
          <CategoryBadge category={incident.category} />
          <Text style={styles.title}>{incident.title}</Text>
          <Text style={styles.time}>{formatRelativeTime(incident.createdAt)}</Text>

          <Text style={styles.description}>{incident.description}</Text>

          <View style={styles.card}>
            <View style={styles.row}>
              <Ionicons name="person-circle-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.rowText}>Reported by {incident.reporter.name}</Text>
            </View>
            <TouchableOpacity style={styles.row} onPress={openInMaps}>
              <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.rowText, styles.link]} numberOfLines={1}>
                {incident.address ?? 'View on map'} ({incident.latitude.toFixed(4)},{' '}
                {incident.longitude.toFixed(4)})
              </Text>
            </TouchableOpacity>
          </View>

          {isOwner ? (
            <TouchableOpacity style={styles.deleteButton} onPress={confirmDelete} disabled={deleting}>
              {deleting ? (
                <ActivityIndicator color={colors.danger} />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  <Text style={styles.deleteText}>Delete this report</Text>
                </>
              )}
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  errorText: { ...typography.body, color: colors.danger },
  image: { width: '100%', height: 260, backgroundColor: colors.border },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  backButton: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: spacing.xl, marginTop: -radius.lg, backgroundColor: colors.background },
  title: { ...typography.h1, color: colors.textPrimary, marginTop: spacing.md },
  time: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  description: { ...typography.body, color: colors.textSecondary, marginTop: spacing.lg, lineHeight: 22 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  rowText: { ...typography.body, color: colors.textPrimary, marginLeft: spacing.sm, flexShrink: 1 },
  link: { color: colors.primary },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.dangerLight,
  },
  deleteText: { ...typography.bodyBold, color: colors.danger, marginLeft: spacing.sm },
});
