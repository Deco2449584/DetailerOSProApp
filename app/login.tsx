import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FineShineLogo } from '@/components/FineShineLogo';
import { useAuth } from '@/context/AuthContext';
import { brand } from '@/theme/brand';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

export default function LoginScreen() {
  const { signIn, user, isLoading, isConfigured } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.accent.primary} />
      </View>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch {
      setError('Invalid credentials or connection error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.container}>
          <View style={styles.header}>
            <FineShineLogo width={220} />
            <Text style={styles.tagline}>{brand.tagline}</Text>
            <Text style={styles.subtitle}>{brand.panelTitle}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="tu@fineshine.com.au"
              placeholderTextColor={colors.text.onSurfaceMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSubmitting}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.text.onSurfaceMuted}
              secureTextEntry
              editable={!isSubmitting}
            />

            {!isConfigured ? (
              <Text style={styles.error}>
                Firebase is not configured in this build. Contact support.
              </Text>
            ) : null}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
                isSubmitting && styles.buttonDisabled,
              ]}
              onPress={handleSignIn}
              disabled={isSubmitting || !isConfigured}>
              {isSubmitting ? (
                <ActivityIndicator color={colors.text.onAccent} />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </Pressable>
          </View>

          <Text style={styles.license}>{brand.license}</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  safe: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 28,
  },
  header: {
    alignItems: 'center',
    gap: 10,
  },
  tagline: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 18,
    color: colors.text.primary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface.elevated,
    borderRadius: 16,
    padding: 24,
    gap: 12,
    borderTopWidth: 4,
    borderTopColor: colors.accent.primary,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.text.onSurface,
    marginTop: 4,
  },
  input: {
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.onSurface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: fonts.body,
    color: colors.text.onSurface,
  },
  error: {
    color: colors.semantic.error,
    fontFamily: fonts.body,
    fontSize: 14,
    marginTop: 4,
  },
  button: {
    marginTop: 8,
    backgroundColor: colors.accent.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonPressed: {
    backgroundColor: colors.accent.primaryPressed,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 16,
    color: colors.text.onAccent,
    letterSpacing: 0.5,
  },
  license: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
