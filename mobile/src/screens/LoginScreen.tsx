import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { TextField } from '../components/TextField';
import { PrimaryButton } from '../components/PrimaryButton';
import { extractErrorMessage } from '../api/client';
import { AuthStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Ionicons name="shield-checkmark" size={30} color={colors.white} />
            </View>
            <Text style={styles.brandTitle}>Citizens Reporting</Text>
            <Text style={styles.brandSubtitle}>See it. Report it. Keep your community safe.</Text>
          </View>

          <Text style={styles.heading}>Welcome back</Text>

          <TextField
            label="Email"
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextField
            label="Password"
            placeholder="Your password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <PrimaryButton label="Log in" onPress={handleSubmit} loading={loading} />

          <TouchableOpacity style={styles.footer} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerText}>
              New here? <Text style={styles.footerLink}>Create an account</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, padding: spacing.xl, justifyContent: 'center' },
  brand: { alignItems: 'center', marginBottom: spacing.xxl },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  brandTitle: { ...typography.h2, color: colors.textPrimary },
  brandSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  heading: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.lg },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.md,
  },
  footer: { marginTop: spacing.xl, alignItems: 'center' },
  footerText: { ...typography.body, color: colors.textSecondary },
  footerLink: { color: colors.primary, fontWeight: '700' },
});
