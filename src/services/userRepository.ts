import { User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

import { db } from '@/services/firebaseConfig';
import type { UserProfile, UserRole } from '@/types/auth';

const USERS_COLLECTION = 'users';

function parseAdminEmails(): string[] {
  return (process.env.EXPO_PUBLIC_ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function getConfiguredAdminEmails(): string[] {
  return parseAdminEmails();
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return parseAdminEmails().includes(email.trim().toLowerCase());
}

/** Role from .env when Firestore is unavailable or not synced yet. */
export function resolveRoleFromEmail(email: string | null | undefined): UserRole {
  return isAdminEmail(email) ? 'admin' : 'operator';
}

export function buildFallbackProfile(user: User): UserProfile {
  const email = user.email ?? '';
  return {
    email,
    role: resolveRoleFromEmail(email),
    updatedAt: new Date().toISOString(),
  };
}

export function resolveUserRole(
  user: User | null | undefined,
  profile: UserProfile | null | undefined,
): UserRole {
  if (!user) return 'operator';
  if (isAdminEmail(user.email)) return 'admin';
  if (profile?.role === 'admin') return 'admin';
  return profile?.role === 'operator' ? 'operator' : 'operator';
}

export type EnsureUserProfileResult = {
  profile: UserProfile;
  syncedToFirestore: boolean;
};

export async function ensureUserProfile(user: User): Promise<EnsureUserProfileResult> {
  if (!db) {
    return { profile: buildFallbackProfile(user), syncedToFirestore: false };
  }

  const userRef = doc(db, USERS_COLLECTION, user.uid);
  const email = user.email ?? '';
  const shouldBeAdmin = isAdminEmail(email);
  const now = new Date().toISOString();

  try {
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      const profile: UserProfile = {
        email,
        role: shouldBeAdmin ? 'admin' : 'operator',
        updatedAt: now,
      };
      await setDoc(userRef, profile);
      return { profile, syncedToFirestore: true };
    }

    const existing = snapshot.data() as UserProfile;
    if (shouldBeAdmin && existing.role !== 'admin') {
      const profile: UserProfile = { ...existing, email, role: 'admin', updatedAt: now };
      await updateDoc(userRef, profile);
      return { profile, syncedToFirestore: true };
    }

    return {
      profile: {
        email: existing.email ?? email,
        role: existing.role === 'admin' || shouldBeAdmin ? 'admin' : 'operator',
        updatedAt: existing.updatedAt ?? now,
      },
      syncedToFirestore: true,
    };
  } catch {
    return { profile: buildFallbackProfile(user), syncedToFirestore: false };
  }
}

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  if (!db) return null;

  try {
    const snapshot = await getDoc(doc(db, USERS_COLLECTION, uid));
    if (!snapshot.exists()) return null;

    const data = snapshot.data() as UserProfile;
    return {
      email: data.email ?? '',
      role: data.role === 'admin' ? 'admin' : 'operator',
      updatedAt: data.updatedAt ?? '',
    };
  } catch {
    return null;
  }
}

export function getRoleLabel(role: UserRole): string {
  return role === 'admin' ? 'Administrator' : 'Operator';
}
