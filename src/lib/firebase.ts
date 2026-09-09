import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth,
  signInWithCredential
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  Firestore,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
export const app: FirebaseApp = getApps().length === 0 
  ? initializeApp(firebaseConfig) 
  : getApp();

// Initialize Firebase Auth
export const auth: Auth = getAuth(app);

// Initialize Firestore with custom databaseId if configured
export const db: Firestore = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Configure real Google Auth Provider
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.addScope('profile');
googleAuthProvider.addScope('email');
googleAuthProvider.addScope('openid');
googleAuthProvider.setCustomParameters({
  prompt: 'select_account',
});

export const GOOGLE_OAUTH_CLIENT_ID = firebaseConfig.oAuthClientId || '';

// Test connection as required by skill guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline. Verify configuration.');
    }
  }
}
testConnection();

/**
 * Sign in using official Firebase Google Auth Popup.
 * This launches Google's real authentication window (accounts.google.com).
 */
export async function signInWithGooglePopup(): Promise<FirebaseUser> {
  try {
    const result = await signInWithPopup(auth, googleAuthProvider);
    const user = result.user;

    // Automatically sync/save profile in Firestore
    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'Farmer',
        email: user.email || '',
        photoURL: user.photoURL || '',
        lastLoginAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn('Could not update user document in Firestore:', e);
    }

    return user;
  } catch (error: any) {
    console.error('Firebase Google Sign-In error:', error);
    throw error;
  }
}

/**
 * Sign out from Firebase
 */
export async function logOutFromFirebase(): Promise<void> {
  await firebaseSignOut(auth);
}
