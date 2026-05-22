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

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return parseAdminEmails().includes(email.trim().toLowerCase());
}

export async function ensureUserProfile(user: User): Promise<UserProfile> {
  if (!db) {
    throw new Error('Firestore is not configured.');
  }

  const userRef = doc(db, USERS_COLLECTION, user.uid);
  const snapshot = await getDoc(userRef);
  const email = user.email ?? '';
  const shouldBeAdmin = isAdminEmail(email);
  const now = new Date().toISOString();

  if (!snapshot.exists()) {
    const profile: UserProfile = {
      email,
      role: shouldBeAdmin ? 'admin' : 'operator',
      updatedAt: now,
    };
    await setDoc(userRef, profile);
    return profile;
  }

  const existing = snapshot.data() as UserProfile;
  if (shouldBeAdmin && existing.role !== 'admin') {
    const profile: UserProfile = { ...existing, email, role: 'admin', updatedAt: now };
    await updateDoc(userRef, profile);
    return profile;
  }

  return {
    email: existing.email ?? email,
    role: existing.role ?? 'operator',
    updatedAt: existing.updatedAt ?? now,
  };
}

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  if (!db) return null;

  const snapshot = await getDoc(doc(db, USERS_COLLECTION, uid));
  if (!snapshot.exists()) return null;

  const data = snapshot.data() as UserProfile;
  return {
    email: data.email ?? '',
    role: data.role === 'admin' ? 'admin' : 'operator',
    updatedAt: data.updatedAt ?? '',
  };
}

export function getRoleLabel(role: UserRole): string {
  return role === 'admin' ? 'Administrator' : 'Operator';
}
