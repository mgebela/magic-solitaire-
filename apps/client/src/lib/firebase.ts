import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously, type Auth } from 'firebase/auth';
import { getDatabase, type Database } from 'firebase/database';

export function isFirebaseConfigured(): boolean {
  return Boolean(
    import.meta.env.VITE_FIREBASE_API_KEY &&
      import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
      import.meta.env.VITE_FIREBASE_DATABASE_URL &&
      import.meta.env.VITE_FIREBASE_PROJECT_ID &&
      import.meta.env.VITE_FIREBASE_APP_ID,
  );
}

export function missingFirebaseMessage(): string {
  return 'PvP needs a Firebase project. Add VITE_FIREBASE_* in apps/client/.env and on Netlify, then enable Anonymous Auth and Realtime Database.';
}

function requireConfig(): void {
  if (!isFirebaseConfigured()) {
    throw new Error(missingFirebaseMessage());
  }
}

export function getFirebaseApp(): FirebaseApp {
  requireConfig();
  const existing = getApps()[0];
  if (existing) return existing;

  return initializeApp({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  });
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

export function getFirebaseDb(): Database {
  return getDatabase(getFirebaseApp());
}

let authInFlight: Promise<string> | null = null;

export async function ensureFirebaseAuth(): Promise<string> {
  const auth = getFirebaseAuth();
  if (auth.currentUser) return auth.currentUser.uid;

  if (!authInFlight) {
    authInFlight = signInAnonymously(auth)
      .then((cred) => {
        if (!cred.user) throw new Error('Firebase anonymous sign-in failed');
        return cred.user.uid;
      })
      .catch((err) => {
        authInFlight = null;
        const code = typeof err === 'object' && err && 'code' in err ? String((err as { code: string }).code) : '';
        const raw = err instanceof Error ? err.message : String(err);
        if (
          code.includes('configuration-not-found') ||
          code.includes('operation-not-allowed') ||
          code.includes('admin-restricted-operation') ||
          raw.includes('CONFIGURATION_NOT_FOUND') ||
          raw.includes('OPERATION_NOT_ALLOWED')
        ) {
          throw new Error(
            'Enable Anonymous sign-in in Firebase Console: Authentication → Get started → Sign-in method → Anonymous.',
          );
        }
        throw err instanceof Error ? err : new Error(raw);
      });
  }

  return authInFlight;
}
