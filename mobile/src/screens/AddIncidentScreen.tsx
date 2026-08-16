import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
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
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { createIncident } from '../api/incidents';
import { extractErrorMessage } from '../api/client';
import { TextField } from '../components/TextField';
import { PrimaryButton } from '../components/PrimaryButton';
import { CategoryChip } from '../components/CategoryChip';
import { ALL_CATEGORIES } from '../theme/categories';
import { IncidentCategory } from '../types';
import { colors, radius, spacing, typography } from '../theme/theme';
import { MainTabParamList, RootStackParamList } from '../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Add'>,
  NativeStackScreenProps<RootStackParamList>
>;

interface Coords {
  latitude: number;
  longitude: number;
}

const emptyForm = {
  title: '',
  description: '',
  category: null as IncidentCategory | null,
  imageUri: null as string | null,
  coords: null as Coords | null,
  address: '',
};

export function AddIncidentScreen({ navigation }: Props) {
  const [form, setForm] = useState(emptyForm);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      return () => setError(null);
    }, []),
  );

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handlePickFromLibrary() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to attach a picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      update('imageUri', result.assets[0].uri);
    }
  }

  async function handleTakePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow camera access to photograph the incident.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      update('imageUri', result.assets[0].uri);
    }
  }

  async function handleUseCurrentLocation() {
    setLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission needed', 'Allow location access to tag where this happened.');
        return;
      }
      const position = await Location.getCurrentPositionAsync({});
      const coords = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      update('coords', coords);

      try {
        const [place] = await Location.reverseGeocodeAsync(coords);
        if (place) {
          const parts = [place.street, place.city, place.region].filter(Boolean);
          if (parts.length) {
            update('address', parts.join(', '));
          }
        }
      } catch {
        // Reverse geocoding is best-effort; coordinates alone are still useful.
      }
    } catch (err) {
      Alert.alert('Could not get location', 'Make sure location services are turned on.');
    } finally {
      setLocating(false);
    }
  }

  function validate(): string | null {
    if (!form.title.trim() || form.title.trim().length < 3) return 'Give the incident a short title.';
    if (!form.description.trim() || form.description.trim().length < 3)
      return 'Describe what happened.';
    if (!form.category) return 'Choose a category.';
    if (!form.coords) return 'Tag the location of the incident.';
    return null;
  }

  async function handleSubmit() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await createIncident({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category as IncidentCategory,
        latitude: form.coords!.latitude,
        longitude: form.coords!.longitude,
        address: form.address.trim() || undefined,
        imageUri: form.imageUri,
      });
      setForm(emptyForm);
      Alert.alert('Report submitted', 'Thanks — your incident is now visible to other citizens.');
      navigation.navigate('Feed');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.heading}>Report an incident</Text>
          <Text style={styles.subheading}>Your report is posted instantly for others to see.</Text>

          <TextField
            label="Title"
            placeholder="e.g. Two-car collision on 5th Avenue"
            value={form.title}
            onChangeText={(v) => update('title', v)}
          />
          <TextField
            label="Description"
            placeholder="What happened? Include any details that could help others."
            multiline
            numberOfLines={4}
            style={styles.textArea}
            value={form.description}
            onChangeText={(v) => update('description', v)}
          />

          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryGrid}>
            {ALL_CATEGORIES.map((cat) => (
              <CategoryChip
                key={cat}
                category={cat}
                selected={form.category === cat}
                onPress={() => update('category', cat)}
              />
            ))}
          </View>

          <Text style={styles.label}>Photo (optional)</Text>
          {form.imageUri ? (
            <View style={styles.imagePreviewWrap}>
              <Image source={{ uri: form.imageUri }} style={styles.imagePreview} contentFit="cover" />
              <TouchableOpacity style={styles.removeImage} onPress={() => update('imageUri', null)}>
                <Ionicons name="close" size={16} color={colors.white} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.photoButtons}>
              <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
                <Ionicons name="camera-outline" size={20} color={colors.primary} />
                <Text style={styles.photoButtonText}>Take photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.photoButton} onPress={handlePickFromLibrary}>
                <Ionicons name="images-outline" size={20} color={colors.primary} />
                <Text style={styles.photoButtonText}>Choose photo</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.label}>Location</Text>
          <TouchableOpacity style={styles.locationButton} onPress={handleUseCurrentLocation} disabled={locating}>
            {locating ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <Ionicons
                  name={form.coords ? 'checkmark-circle' : 'locate-outline'}
                  size={20}
                  color={form.coords ? colors.success : colors.primary}
                />
                <Text style={styles.locationButtonText}>
                  {form.coords ? 'Location captured — tap to refresh' : 'Use my current location'}
                </Text>
              </>
            )}
          </TouchableOpacity>
          {form.coords ? (
            <Text style={styles.coordsText}>
              {form.coords.latitude.toFixed(5)}, {form.coords.longitude.toFixed(5)}
            </Text>
          ) : null}
          {form.coords ? (
            <TextField
              label="Address (optional, editable)"
              placeholder="Street, city"
              value={form.address}
              onChangeText={(v) => update('address', v)}
            />
          ) : null}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <PrimaryButton label="Submit report" onPress={handleSubmit} loading={submitting} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.xl, paddingBottom: spacing.xxl * 2 },
  heading: { ...typography.h1, color: colors.textPrimary },
  subheading: { ...typography.body, color: colors.textSecondary, marginTop: 4, marginBottom: spacing.xl },
  textArea: { minHeight: 96, textAlignVertical: 'top' },
  label: { ...typography.bodyBold, color: colors.textPrimary, marginBottom: spacing.sm },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.lg },
  photoButtons: { flexDirection: 'row', marginBottom: spacing.lg },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    borderRadius: radius.md,
    paddingVertical: 14,
    marginRight: spacing.sm,
  },
  photoButtonText: { ...typography.bodyBold, color: colors.primary, marginLeft: spacing.sm },
  imagePreviewWrap: { marginBottom: spacing.lg },
  imagePreview: { width: '100%', height: 180, borderRadius: radius.lg, backgroundColor: colors.border },
  removeImage: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(17,24,39,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  locationButtonText: { ...typography.bodyBold, color: colors.textPrimary, marginLeft: spacing.sm },
  coordsText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  errorText: { ...typography.caption, color: colors.danger, marginBottom: spacing.md, marginTop: spacing.sm },
});
