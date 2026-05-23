import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';

import { useTheme } from '@/context/ThemeContext';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import {
    createManagedUser,
    deleteUserProfile,
    fetchAllUsers,
    getRoleLabel,
    updateUserRole,
    type ManagedUser,
} from '@/services/userRepository';
import type { AppColors } from '@/theme/palettes';
import { fonts } from '@/theme/typography';
import type { UserRole } from '@/types/auth';

const RED     = '#E21F28';
const RED_DIM = 'rgba(226,31,40,0.12)';

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    sectionTitle: {
      fontFamily: fonts.headingSemiBold,
      fontSize: 16,
      color: colors.text.primary,
      marginTop: 4,
    },

    // ── User list ────────────────────────────────────────────────────────────
    userCard: {
      backgroundColor: colors.surface.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border.onSurface,
      overflow: 'hidden',
      flexDirection: 'row',
    },
    userAccent: {
      width: 3,
      backgroundColor: RED,
    },
    userBody: {
      flex: 1,
      padding: 13,
      gap: 4,
    },
    userEmail: {
      fontFamily: fonts.bodySemiBold,
      fontSize: 14,
      color: colors.text.onSurface,
    },
    userMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    roleBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
    },
    roleBadgeText: {
      fontFamily: fonts.bodySemiBold,
      fontSize: 11,
    },
    userActions: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingRight: 10,
      gap: 4,
    },
    iconBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // ── Empty / loading ──────────────────────────────────────────────────────
    emptyBox: {
      alignItems: 'center',
      paddingVertical: 24,
      gap: 8,
    },
    emptyText: {
      fontFamily: fonts.body,
      fontSize: 14,
      color: colors.text.secondary,
    },

    // ── Add user button ──────────────────────────────────────────────────────
    addBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: RED,
      borderStyle: 'dashed',
      backgroundColor: RED_DIM,
    },
    addBtnPressed: { opacity: 0.8 },
    addBtnText: {
      fontFamily: fonts.headingSemiBold,
      fontSize: 15,
      color: RED,
    },

    // ── Modal backdrop ───────────────────────────────────────────────────────
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.72)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    modalCard: {
      width: '100%',
      backgroundColor: colors.surface.elevated,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border.onSurface,
      overflow: 'hidden',
    },
    modalAccent: {
      height: 4,
      backgroundColor: RED,
    },
    modalBody: {
      padding: 24,
      gap: 16,
    },
    modalTitle: {
      fontFamily: fonts.headingSemiBold,
      fontSize: 18,
      color: colors.text.primary,
    },
    modalSubtitle: {
      fontFamily: fonts.body,
      fontSize: 13,
      color: colors.text.secondary,
      marginTop: -8,
    },

    // ── Form fields ──────────────────────────────────────────────────────────
    fieldGroup: { gap: 6 },
    fieldLabel: {
      fontFamily: fonts.bodySemiBold,
      fontSize: 12,
      color: colors.text.onSurfaceMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    input: {
      backgroundColor: colors.background.secondary,
      borderWidth: 1,
      borderColor: colors.border.onSurface,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      fontFamily: fonts.body,
      color: colors.text.onSurface,
    },
    inputFocused: {
      borderColor: RED,
    },

    // ── Role selector ────────────────────────────────────────────────────────
    roleRow: {
      flexDirection: 'row',
      gap: 10,
    },
    roleChip: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 11,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border.onSurface,
      backgroundColor: colors.surface.card,
    },
    roleChipActive: {
      borderColor: RED,
      backgroundColor: RED_DIM,
    },
    roleChipText: {
      fontFamily: fonts.bodySemiBold,
      fontSize: 13,
      color: colors.text.secondary,
    },
    roleChipTextActive: {
      color: RED,
    },

    // ── Modal footer ─────────────────────────────────────────────────────────
    modalDivider: {
      height: 1,
      backgroundColor: colors.border.onSurface,
    },
    modalFooter: {
      flexDirection: 'row',
    },
    modalCancelBtn: {
      flex: 1,
      paddingVertical: 16,
      alignItems: 'center',
      borderRightWidth: 1,
      borderRightColor: colors.border.onSurface,
    },
    modalCancelText: {
      fontFamily: fonts.bodySemiBold,
      fontSize: 15,
      color: colors.text.secondary,
    },
    modalConfirmBtn: {
      flex: 1,
      paddingVertical: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalConfirmText: {
      fontFamily: fonts.headingSemiBold,
      fontSize: 15,
      color: RED,
    },
  });
}

// ─── Role badge colors ────────────────────────────────────────────────────────

function roleBadgeStyle(role: UserRole) {
  return role === 'admin'
    ? { bg: 'rgba(226,31,40,0.12)', text: RED }
    : { bg: 'rgba(156,163,175,0.15)', text: '#6B7280' };
}

// ─── Create User Modal ────────────────────────────────────────────────────────

type CreateModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreated: (user: ManagedUser) => void;
};

function CreateUserModal({ visible, onClose, onCreated }: CreateModalProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]         = useState<UserRole>('operator');
  const [isSaving, setIsSaving] = useState(false);
  const [emailFocused, setEmailFocused]       = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  function reset() {
    setEmail('');
    setPassword('');
    setRole('operator');
    setIsSaving(false);
  }

  async function handleCreate() {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      Alert.alert('Missing fields', 'Please enter an email and password.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }
    setIsSaving(true);
    try {
      const newUser = await createManagedUser(trimmedEmail, password, role);
      onCreated(newUser);
      reset();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      if (msg.includes('email-already-in-use')) {
        Alert.alert('Email in use', 'An account with this email already exists.');
      } else if (msg.includes('invalid-email')) {
        Alert.alert('Invalid email', 'Please enter a valid email address.');
      } else {
        Alert.alert('Error', `Could not create user: ${msg}`);
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalAccent} />
          <View style={styles.modalBody}>
            <Text style={styles.modalTitle}>New user</Text>
            <Text style={styles.modalSubtitle}>
              The user can sign in immediately with these credentials.
            </Text>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                style={[styles.input, emailFocused && styles.inputFocused]}
                value={email}
                onChangeText={setEmail}
                placeholder="user@example.com"
                placeholderTextColor={colors.text.onSurfaceMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Password</Text>
              <TextInput
                style={[styles.input, passwordFocused && styles.inputFocused]}
                value={password}
                onChangeText={setPassword}
                placeholder="Min. 6 characters"
                placeholderTextColor={colors.text.onSurfaceMuted}
                secureTextEntry
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
            </View>

            {/* Role */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Role</Text>
              <View style={styles.roleRow}>
                {(['operator', 'admin'] as UserRole[]).map((r) => {
                  const active = role === r;
                  return (
                    <Pressable
                      key={r}
                      style={[styles.roleChip, active && styles.roleChipActive]}
                      onPress={() => setRole(r)}>
                      <Ionicons
                        name={r === 'admin' ? 'shield-checkmark-outline' : 'person-outline'}
                        size={15}
                        color={active ? RED : colors.text.secondary}
                      />
                      <Text style={[styles.roleChipText, active && styles.roleChipTextActive]}>
                        {getRoleLabel(r)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={styles.modalDivider} />
          <View style={styles.modalFooter}>
            <Pressable style={styles.modalCancelBtn} onPress={onClose} disabled={isSaving}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.modalConfirmBtn} onPress={handleCreate} disabled={isSaving}>
              {isSaving
                ? <ActivityIndicator color={RED} />
                : <Text style={styles.modalConfirmText}>Create</Text>}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Edit Role Modal ──────────────────────────────────────────────────────────

type EditRoleModalProps = {
  user: ManagedUser | null;
  onClose: () => void;
  onUpdated: (uid: string, role: UserRole) => void;
};

function EditRoleModal({ user, onClose, onUpdated }: EditRoleModalProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const [role, setRole]     = useState<UserRole>('operator');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) setRole(user.role);
  }, [user]);

  async function handleSave() {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateUserRole(user.uid, role);
      onUpdated(user.uid, role);
      onClose();
    } catch {
      Alert.alert('Error', 'Could not update role. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal
      visible={!!user}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalAccent} />
          <View style={styles.modalBody}>
            <Text style={styles.modalTitle}>Edit role</Text>
            <Text style={styles.modalSubtitle}>{user?.email}</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Role</Text>
              <View style={styles.roleRow}>
                {(['operator', 'admin'] as UserRole[]).map((r) => {
                  const active = role === r;
                  return (
                    <Pressable
                      key={r}
                      style={[styles.roleChip, active && styles.roleChipActive]}
                      onPress={() => setRole(r)}>
                      <Ionicons
                        name={r === 'admin' ? 'shield-checkmark-outline' : 'person-outline'}
                        size={15}
                        color={active ? RED : colors.text.secondary}
                      />
                      <Text style={[styles.roleChipText, active && styles.roleChipTextActive]}>
                        {getRoleLabel(r)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={styles.modalDivider} />
          <View style={styles.modalFooter}>
            <Pressable style={styles.modalCancelBtn} onPress={onClose} disabled={isSaving}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.modalConfirmBtn} onPress={handleSave} disabled={isSaving}>
              {isSaving
                ? <ActivityIndicator color={RED} />
                : <Text style={styles.modalConfirmText}>Save</Text>}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────

type UserManagementSectionProps = {
  currentUserUid: string;
};

export function UserManagementSection({ currentUserUid }: UserManagementSectionProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();

  const [users, setUsers]               = useState<ManagedUser[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [showCreate, setShowCreate]     = useState(false);
  const [editingUser, setEditingUser]   = useState<ManagedUser | null>(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    const list = await fetchAllUsers();
    setUsers(list);
    setIsLoading(false);
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  function handleCreated(newUser: ManagedUser) {
    setUsers((prev) =>
      [...prev, newUser].sort((a, b) => a.email.localeCompare(b.email)),
    );
  }

  function handleRoleUpdated(uid: string, role: UserRole) {
    setUsers((prev) =>
      prev.map((u) => (u.uid === uid ? { ...u, role } : u)),
    );
  }

  function confirmDelete(user: ManagedUser) {
    if (user.uid === currentUserUid) {
      Alert.alert('Not allowed', 'You cannot delete your own account.');
      return;
    }
    Alert.alert(
      'Delete user',
      `Remove ${user.email}? This only deletes the Firestore profile — the Firebase Auth account remains.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUserProfile(user.uid);
              setUsers((prev) => prev.filter((u) => u.uid !== user.uid));
            } catch {
              Alert.alert('Error', 'Could not delete user. Please try again.');
            }
          },
        },
      ],
    );
  }

  return (
    <>
      <Text style={styles.sectionTitle}>User management</Text>

      {isLoading ? (
        <View style={styles.emptyBox}>
          <ActivityIndicator color={RED} />
        </View>
      ) : users.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="people-outline" size={32} color={colors.text.secondary} />
          <Text style={styles.emptyText}>No users found</Text>
        </View>
      ) : (
        <View style={{ gap: 8 }}>
          {users.map((user) => {
            const badge = roleBadgeStyle(user.role);
            return (
              <View key={user.uid} style={styles.userCard}>
                <View style={styles.userAccent} />
                <View style={styles.userBody}>
                  <Text style={styles.userEmail} numberOfLines={1}>
                    {user.email}
                  </Text>
                  <View style={styles.userMeta}>
                    <View style={[styles.roleBadge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.roleBadgeText, { color: badge.text }]}>
                        {getRoleLabel(user.role)}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.userActions}>
                  {/* Edit role */}
                  <Pressable
                    style={({ pressed }) => [
                      styles.iconBtn,
                      { backgroundColor: pressed ? 'rgba(226,31,40,0.08)' : 'transparent' },
                    ]}
                    onPress={() => setEditingUser(user)}>
                    <Ionicons name="create-outline" size={19} color={colors.accent.primary} />
                  </Pressable>
                  {/* Delete */}
                  <Pressable
                    style={({ pressed }) => [
                      styles.iconBtn,
                      { backgroundColor: pressed ? 'rgba(226,31,40,0.08)' : 'transparent' },
                    ]}
                    onPress={() => confirmDelete(user)}>
                    <Ionicons name="trash-outline" size={19} color={colors.text.onSurfaceMuted} />
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Add user button */}
      <Pressable
        style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
        onPress={() => setShowCreate(true)}>
        <Ionicons name="person-add-outline" size={18} color={RED} />
        <Text style={styles.addBtnText}>Add user</Text>
      </Pressable>

      {/* Modals */}
      <CreateUserModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={handleCreated}
      />
      <EditRoleModal
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onUpdated={handleRoleUpdated}
      />
    </>
  );
}
