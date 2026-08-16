import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fetchMyIncidents } from '../api/incidents';
import { extractErrorMessage } from '../api/client';
import { Incident } from '../types';
import { IncidentCard } from '../components/IncidentCard';
import { EmptyState } from '../components/EmptyState';
import { colors, spacing, typography } from '../theme/theme';
import { MainTabParamList, RootStackParamList } from '../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'MyReports'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function MyReportsScreen({ navigation }: Props) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setIncidents(await fetchMyIncidents());
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load]),
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Reports</Text>
        <Text style={styles.subtitle}>Incidents you have submitted</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : error ? (
        <EmptyState icon="cloud-offline-outline" title="Couldn't load your reports" subtitle={error} />
      ) : (
        <FlatList
          data={incidents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          renderItem={({ item }) => (
            <IncidentCard
              incident={item}
              onPress={() => navigation.navigate('IncidentDetail', { id: item.id })}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="document-text-outline"
              title="No reports yet"
              subtitle="Tap the Add tab to submit your first incident report."
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.md },
  title: { ...typography.h1, color: colors.textPrimary },
  subtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
});
