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

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (!name.trim() || !email.trim() || !password) {
      setError('Fill in your name, email and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password);
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
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.heading}>Create your account</Text>
          <Text style={styles.subheading}>Join your community and start reporting incidents.</Text>

          <TextField label="Full name" placeholder="Jane Doe" value={name} onChangeText={setName} />
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
            placeholder="At least 6 characters"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <PrimaryButton label="Create account" onPress={handleSubmit} loading={loading} />

          <TouchableOpacity style={styles.footer} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerText}>
              Already have an account? <Text style={styles.footerLink}>Log in</Text>
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
  backButton: { position: 'absolute', top: spacing.xl, left: spacing.xl, padding: spacing.xs },
  heading: { ...typography.h2, color: colors.textPrimary, marginTop: spacing.xxl },
  subheading: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.md,
  },
  footer: { marginTop: spacing.xl, alignItems: 'center' },
  footerText: { ...typography.body, color: colors.textSecondary },
  footerLink: { color: colors.primary, fontWeight: '700' },
});
