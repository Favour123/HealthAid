import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { fetchMyIncidents } from '../api/incidents';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radius, shadow, spacing, typography } from '../theme/theme';

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const [reportCount, setReportCount] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchMyIncidents()
        .then((data) => setReportCount(data.length))
        .catch(() => setReportCount(null));
    }, []),
  );

  function confirmLogout() {
    Alert.alert('Log out', 'You will need to log in again to submit or view your reports.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);
  }

  const initial = user?.name?.trim()?.[0]?.toUpperCase() ?? '?';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <View style={styles.statRow}>
          <Ionicons name="document-text-outline" size={18} color={colors.primary} />
          <Text style={styles.statText}>
            {reportCount ?? '—'} incident{reportCount === 1 ? '' : 's'} reported
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Log out" onPress={confirmLogout} variant="outline" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.md },
  title: { ...typography.h1, color: colors.textPrimary },
  card: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadow.card,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: { color: colors.white, fontSize: 28, fontWeight: '800' },
  name: { ...typography.h2, color: colors.textPrimary },
  email: { ...typography.body, color: colors.textSecondary, marginTop: 2 },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    width: '100%',
    justifyContent: 'center',
  },
  statText: { ...typography.bodyBold, color: colors.textPrimary, marginLeft: spacing.sm },
  footer: { padding: spacing.xl, marginTop: 'auto' },
});
