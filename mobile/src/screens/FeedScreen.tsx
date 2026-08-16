import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { fetchIncidents } from '../api/incidents';
import { extractErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Incident, IncidentCategory } from '../types';
import { IncidentCard } from '../components/IncidentCard';
import { CategoryChip } from '../components/CategoryChip';
import { EmptyState } from '../components/EmptyState';
import { ALL_CATEGORIES } from '../theme/categories';
import { colors, spacing, typography } from '../theme/theme';
import { MainTabParamList, RootStackParamList } from '../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Feed'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function FeedScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { latestIncident } = useSocket();
  const [category, setCategory] = useState<IncidentCategory | 'ALL'>('ALL');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (selected: IncidentCategory | 'ALL') => {
    setError(null);
    try {
      const data = await fetchIncidents(selected === 'ALL' ? null : selected);
      setIncidents(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load(category).finally(() => setLoading(false));
    }, [category, load]),
  );

  useEffect(() => {
    if (!latestIncident) return;
    if (category !== 'ALL' && latestIncident.category !== category) return;
    setIncidents((prev) =>
      prev.some((item) => item.id === latestIncident.id) ? prev : [latestIncident, ...prev],
    );
  }, [latestIncident, category]);

  async function onRefresh() {
    setRefreshing(true);
    await load(category);
    setRefreshing(false);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hi {user?.name?.split(' ')[0] ?? 'there'} 👋</Text>
        <Text style={styles.title}>Incidents near you</Text>
      </View>

      <FlatList
        data={ALL_CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.chipsRow}
        ListHeaderComponent={
          <CategoryChip category="ALL" selected={category === 'ALL'} onPress={() => setCategory('ALL')} />
        }
        renderItem={({ item }) => (
          <CategoryChip category={item} selected={category === item} onPress={() => setCategory(item)} />
        )}
      />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : error ? (
        <EmptyState icon="cloud-offline-outline" title="Couldn't load incidents" subtitle={error} />
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
              icon="newspaper-outline"
              title="No incidents yet"
              subtitle="Reports submitted by you and others will show up here in real time."
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.sm },
  greeting: { ...typography.caption, color: colors.textSecondary },
  title: { ...typography.h1, color: colors.textPrimary, marginTop: 2 },
  chipsRow: { paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
});
