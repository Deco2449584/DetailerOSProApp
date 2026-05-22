import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';

import { FineShineLogo } from '@/components/FineShineLogo';
import { useAuth } from '@/context/AuthContext';
import { brand } from '@/theme/brand';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import {
  getConfiguredAdminEmails,
  getRoleLabel,
  isAdminEmail,
} from '@/services/userRepository';

export default function AccountScreen() {
  const { user, role, isAdmin, profileSyncFailed, signOut } = useAuth();
  const emailMatchesAdminList = isAdminEmail(user?.email);
  const adminEmailsConfigured = getConfiguredAdminEmails().length > 0;
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.content}>
        <FineShineLogo width={160} />
        <Text style={styles.title}>Account</Text>
        <Text style={styles.subtitle}>{brand.panelTitle}</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email ?? '—'}</Text>

          <Text style={styles.label}>Role</Text>
          <View style={styles.roleRow}>
            <Ionicons
              name={isAdmin ? 'shield-checkmark' : 'person-circle-outline'}
              size={18}
              color={isAdmin ? colors.accent.primary : colors.text.onSurfaceMuted}
            />
            <Text style={[styles.value, isAdmin && styles.valueAdmin]}>
              {getRoleLabel(role)}
            </Text>
          </View>
        </View>

        {profileSyncFailed ? (
          <Text style={styles.hintWarn}>
            Could not sync your profile to Firestore. Admin access still works if your email is
            listed in EXPO_PUBLIC_ADMIN_EMAILS. Publish rules from firebase/firestore.rules.
          </Text>
        ) : null}

        {!isAdmin && emailMatchesAdminList && adminEmailsConfigured ? (
          <Text style={styles.hintWarn}>
            Your email is in the admin list. Restart the app with: npm run start:clear
          </Text>
        ) : null}

        {!adminEmailsConfigured ? (
          <Text style={styles.hintWarn}>
            EXPO_PUBLIC_ADMIN_EMAILS is empty in .env. Add your email and run npm run start:clear
          </Text>
        ) : null}

        {isAdmin ? (
          <Pressable
            style={({ pressed }) => [styles.linkBtn, pressed && styles.linkBtnPressed]}
            onPress={() => router.push('/(tabs)/admin')}>
            <Ionicons name="download-outline" size={20} color={colors.accent.primary} />
            <Text style={styles.linkBtnText}>Open admin exports</Text>
          </Pressable>
        ) : null}

        <Pressable
          style={({ pressed }) => [styles.signOutBtn, pressed && styles.signOutPressed]}
          onPress={signOut}>
          <Ionicons name="log-out-outline" size={20} color={colors.semantic.error} />
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>

        <Text style={styles.footer}>{brand.license}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    padding: 20,
    gap: 12,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 26,
    color: colors.text.primary,
    marginTop: 8,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.surface.elevated,
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.onSurfaceMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.onSurface,
    marginBottom: 4,
  },
  valueAdmin: {
    color: colors.accent.primary,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.surface.elevated,
    marginTop: 8,
  },
  linkBtnPressed: {
    opacity: 0.85,
  },
  linkBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.accent.primary,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 'auto',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  signOutPressed: {
    opacity: 0.85,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.semantic.error,
  },
  hintWarn: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.semantic.warning,
    lineHeight: 18,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    padding: 12,
    borderRadius: 10,
  },
  footer: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
