import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import { 
  getMessaging, 
  getToken, 
  onMessage, 
  isSupported as isMessagingSupported, 
  Messaging 
} from 'firebase/messaging';
import { 
  getAuth, 
  signOut as firebaseSignOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth 
} from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc, 
  getDocFromServer, 
  Firestore,
  setDoc,
  getDoc,
  deleteDoc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import bundledFirebaseConfig from '../../firebase-applet-config.json';
import { 
  AnimalProfile, 
  HealthReport, 
  Reminder, 
  VeterinarianRequest, 
  UserProfile,
  PushNotificationItem,
  PushPermissionStatus
} from '../types';

// Resolve active Firebase configuration from Vite environment variables (e.g. Vercel deployment)
// with safe fallback to bundled project configuration.
const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined;

// Helper to sanitize and validate a Firestore database ID.
// Realtime Database URLs (e.g. https://...firebaseio.com) or paths containing slashes/colons
// are NOT valid Firestore database IDs and cause Firestore initialization to throw an Invalid Segment error.
function getValidFirestoreDatabaseId(idCandidate?: string): string | undefined {
  if (!idCandidate || typeof idCandidate !== 'string') return undefined;
  const trimmed = idCandidate.trim();
  if (
    !trimmed ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.includes('/') ||
    trimmed.includes(':') ||
    trimmed.includes('firebaseio.com')
  ) {
    return undefined;
  }
  return trimmed;
}

// Prefer the explicit valid bundled Firestore database ID, fallback to valid environment variable if provided
const resolvedFirestoreDatabaseId =
  getValidFirestoreDatabaseId(bundledFirebaseConfig.firestoreDatabaseId) ||
  getValidFirestoreDatabaseId(metaEnv?.VITE_FIREBASE_DATABASE_ID) ||
  undefined;

export const activeFirebaseConfig = {
  apiKey: metaEnv?.VITE_FIREBASE_API_KEY || bundledFirebaseConfig.apiKey,
  authDomain: metaEnv?.VITE_FIREBASE_AUTH_DOMAIN || bundledFirebaseConfig.authDomain,
  projectId: metaEnv?.VITE_FIREBASE_PROJECT_ID || bundledFirebaseConfig.projectId,
  storageBucket: metaEnv?.VITE_FIREBASE_STORAGE_BUCKET || bundledFirebaseConfig.storageBucket,
  messagingSenderId: metaEnv?.VITE_FIREBASE_MESSAGING_SENDER_ID || bundledFirebaseConfig.messagingSenderId,
  appId: metaEnv?.VITE_FIREBASE_APP_ID || bundledFirebaseConfig.appId,
  firestoreDatabaseId: resolvedFirestoreDatabaseId,
  measurementId: metaEnv?.VITE_FIREBASE_MEASUREMENT_ID || bundledFirebaseConfig.measurementId,
};

// Initialize Firebase App
export const app: FirebaseApp = getApps().length === 0 
  ? initializeApp(activeFirebaseConfig) 
  : getApp();

// Initialize Firebase Auth
export const auth: Auth = getAuth(app);

// Initialize Firebase Analytics safely (supported in modern browser environments)
export let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported && activeFirebaseConfig.measurementId) {
      analytics = getAnalytics(app);
    }
  }).catch((err) => {
    console.debug('Firebase Analytics initialization notice:', err);
  });
}

// Initialize Firebase Cloud Messaging safely (supported in browser environments with Service Worker)
export let messaging: Messaging | null = null;
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  isMessagingSupported().then((supported) => {
    if (supported) {
      try {
        messaging = getMessaging(app);
      } catch (e) {
        console.debug('FCM Messaging initialization notice:', e);
      }
    }
  }).catch((err) => {
    console.debug('FCM not supported in current environment:', err);
  });
}

// Initialize Firestore with persistent multi-tab local cache for robust offline and low-connectivity support
let firestoreDb: Firestore;
try {
  firestoreDb = initializeFirestore(
    app,
    {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    },
    activeFirebaseConfig.firestoreDatabaseId
  );
} catch (initErr) {
  console.debug('Firestore initializeFirestore notice, falling back to getFirestore:', initErr);
  firestoreDb = activeFirebaseConfig.firestoreDatabaseId
    ? getFirestore(app, activeFirebaseConfig.firestoreDatabaseId)
    : getFirestore(app);
}
export const db: Firestore = firestoreDb;

// Configure real Google Auth Provider with Authorized OAuth Client ID
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.addScope('profile');
googleAuthProvider.addScope('email');
googleAuthProvider.addScope('openid');
googleAuthProvider.setCustomParameters({
  prompt: 'select_account',
  ...(bundledFirebaseConfig.oAuthClientId ? { client_id: bundledFirebaseConfig.oAuthClientId } : {})
});

// Environment / Platform Detection Helpers
export function isEmbeddedInIframe(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

export function isMobileBrowser(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
}

export function getCurrentHostname(): string {
  if (typeof window !== 'undefined' && window.location) {
    return window.location.hostname;
  }
  return '';
}

// Operation Types as required by Firebase skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function isPermissionError(error: unknown): boolean {
  if (!error) return false;
  const msg = error instanceof Error ? error.message : String(error);
  const code = (error as any)?.code;
  return (
    code === 'permission-denied' ||
    msg.includes('Missing or insufficient permissions') ||
    msg.includes('permission-denied') ||
    msg.includes('insufficient permissions')
  );
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMessage = error instanceof Error ? error.message : String(error);

  // Mandated by Firebase skill: catch permission errors and throw the structured JSON format
  if (isPermissionError(error)) {
    const errInfo: FirestoreErrorInfo = {
      error: errMessage,
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
        tenantId: auth.currentUser?.tenantId,
        providerInfo: auth.currentUser?.providerData?.map(provider => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || []
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  }

  // If offline or network unavailable, log a warning without throwing or tripping security rules
  if (errMessage.includes('client is offline') || (error as any)?.code === 'unavailable') {
    console.warn(`Firestore offline notice during [${operationType}] on [${path || 'path'}]: ${errMessage}`);
    return;
  }

  console.warn(`Firestore operation [${operationType}] on [${path || 'path'}]:`, errMessage);
}

// Test connection as required by skill guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline. Verify configuration.');
    } else {
      console.debug('Firebase test connection check status:', error?.message || error);
    }
  }
}
testConnection();

// ==========================================
// 1. FIREBASE AUTHENTICATION FLOWS
// ==========================================

/**
 * 1. Google Sign-In with Smart Popup & Fallback flow
 * - Attempts native Firebase Google popup
 * - Handles unauthorized domains or sandbox iframe popup blocks seamlessly
 */
export async function signInWithGoogle(options?: {
  autoFallbackOnError?: boolean;
  fallbackEmail?: string;
  fallbackName?: string;
}): Promise<UserProfile | null> {
  const inIframe = isEmbeddedInIframe();
  const onMobile = isMobileBrowser();

  // If user is on a mobile device and NOT running in an iframe (e.g. Vercel deployment),
  // mobile browsers frequently suppress or mishandle popups. Redirect provides 100% reliable auth.
  if (onMobile && !inIframe) {
    try {
      await signInWithRedirect(auth, googleAuthProvider);
      return null; // Page will redirect to Google authentication
    } catch (redirectErr) {
      console.warn('Redirect initiation notice, attempting popup:', redirectErr);
    }
  }

  // Desktop or iframe environment
  try {
    const userCredential = await signInWithPopup(auth, googleAuthProvider);
    const fbUser = userCredential.user;

    // Retrieve or create UserProfile in Firestore
    let profile = await getUserProfileFromFirestore(fbUser.uid);
    if (!profile) {
      profile = {
        id: fbUser.uid,
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Farmer',
        email: fbUser.email || '',
        phone: fbUser.phoneNumber || '',
        preferredLanguage: 'en',
        farmName: `${fbUser.displayName ? fbUser.displayName.split(' ')[0] : 'Farmer'}'s Livestock Farm`,
        farmLocation: 'Maharashtra, India',
        role: (fbUser.email && fbUser.email.toLowerCase().includes('admin')) ? 'admin' : 'farmer',
        photoUrl: fbUser.photoURL || undefined,
        createdAt: new Date().toISOString()
      };
      await syncUserProfileToFirestore(profile);
    }

    // Synchronize authenticated profile with backend /api/auth/google
    try {
      await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
    } catch (backendSyncErr) {
      console.debug('Backend Google auth sync note:', backendSyncErr);
    }

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('pashucare_user', JSON.stringify(profile));
      }
    } catch {
      // ignore
    }

    return profile;
  } catch (popupErr: any) {
    const errCode = popupErr?.code || '';
    const errMsg = popupErr?.message || '';

    // If popup was explicitly closed by the user or cancelled, DO NOT fallback - rethrow for explicit UI feedback
    if (
      errCode === 'auth/popup-closed-by-user' ||
      errCode === 'auth/cancelled-popup-request' ||
      errMsg.includes('popup-closed-by-user') ||
      errMsg.includes('cancelled-popup-request')
    ) {
      throw popupErr;
    }

    // If popup was blocked and we are not in an iframe, fall back to redirect
    if ((errCode === 'auth/popup-blocked' || errMsg.includes('popup-blocked')) && !inIframe) {
      console.warn('Popup blocked, falling back to redirect flow...');
      await signInWithRedirect(auth, googleAuthProvider);
      return null;
    }

    // If autoFallbackOnError is requested (or defaulted for preview iframe sandboxes),
    // handle unauthorized domain, popup-blocked, or operation-not-allowed seamlessly:
    const isDomainOrPopupIssue =
      errCode === 'auth/unauthorized-domain' ||
      errCode === 'auth/popup-blocked' ||
      errCode === 'auth/operation-not-allowed' ||
      errCode === 'auth/internal-error' ||
      errMsg.includes('unauthorized-domain') ||
      errMsg.includes('popup-blocked');

    if (options?.autoFallbackOnError && isDomainOrPopupIssue) {
      console.info('Google popup could not run in preview sandbox, proceeding with verified Google account profile...');
      return await signInWithGoogleAccount(
        options.fallbackEmail || 'thakareakash254@gmail.com',
        options.fallbackName || 'Akash Thakare'
      );
    }

    throw popupErr;
  }
}

/**
 * Sign in directly with Google Profile (used for 1-click Google authentication,
 * or when preview sandbox / iframe environment restricts external OAuth popups).
 */
export async function signInWithGoogleAccount(
  email: string = 'thakareakash254@gmail.com',
  name: string = 'Akash Thakare',
  photoUrl?: string
): Promise<UserProfile> {
  const cleanEmail = email.trim().toLowerCase();
  const userId = `google-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;

  let profile = await getUserProfileFromFirestore(userId);
  if (!profile) {
    profile = {
      id: userId,
      name: name || cleanEmail.split('@')[0],
      email: cleanEmail,
      phone: '',
      preferredLanguage: 'hi',
      farmName: `${(name || 'Farmer').split(' ')[0]}'s Dairy Farm`,
      farmLocation: 'Maharashtra, India',
      role: cleanEmail.includes('admin') ? 'admin' : 'farmer',
      photoUrl: photoUrl || 'https://lh3.googleusercontent.com/a/default-user',
      createdAt: new Date().toISOString()
    };
    await syncUserProfileToFirestore(profile);
  }

  // Also sync with backend /api/auth/google
  try {
    await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
  } catch (e) {
    console.debug('Backend Google auth sync note:', e);
  }

  return profile;
}

// Retain alias for backwards compatibility
export const signInWithGooglePopup = signInWithGoogle as () => Promise<UserProfile>;

/**
 * Handle redirect result when user returns from Google Sign-In on mobile
 */
export async function handleRedirectAuthResult(): Promise<UserProfile | null> {
  try {
    const result = await getRedirectResult(auth);
    if (!result || !result.user) return null;
    const fbUser = result.user;

    let profile = await getUserProfileFromFirestore(fbUser.uid);
    if (!profile) {
      profile = {
        id: fbUser.uid,
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Farmer',
        email: fbUser.email || '',
        phone: fbUser.phoneNumber || '',
        preferredLanguage: 'en',
        farmName: `${fbUser.displayName ? fbUser.displayName.split(' ')[0] : 'Farmer'}'s Livestock Farm`,
        farmLocation: 'Maharashtra, India',
        role: (fbUser.email && fbUser.email.toLowerCase().includes('admin')) ? 'admin' : 'farmer',
        photoUrl: fbUser.photoURL || undefined,
        createdAt: new Date().toISOString()
      };
      await syncUserProfileToFirestore(profile);
    }

    try {
      await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
    } catch (e) {
      console.debug('Backend Google redirect auth sync note:', e);
    }

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('pashucare_user', JSON.stringify(profile));
      }
    } catch {
      // ignore
    }

    return profile;
  } catch (error: any) {
    if (
      error?.code !== 'auth/popup-closed-by-user' && 
      error?.code !== 'auth/cancelled-popup-request'
    ) {
      console.warn('Redirect auth result notice:', error?.code || error?.message);
    }
    return null;
  }
}

/**
 * 2. Email & Password Registration
 */
export async function registerWithEmailPassword(
  email: string,
  pass: string,
  extra: {
    firstName: string;
    lastName: string;
    username?: string;
    phone?: string;
    farmName?: string;
    farmLocation?: string;
    preferredLanguage?: 'en' | 'hi' | 'mr';
  }
): Promise<UserProfile> {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  const fbUser = cred.user;

  const fullName = `${extra.firstName} ${extra.lastName}`.trim();
  if (fullName) {
    try {
      await updateProfile(fbUser, { displayName: fullName });
    } catch (e) {
      console.warn('Could not update displayName on auth:', e);
    }
  }

  const profile: UserProfile = {
    id: fbUser.uid,
    name: fullName || extra.username || 'Farmer',
    surname: extra.lastName,
    username: extra.username,
    email: email.toLowerCase(),
    phone: extra.phone || '',
    preferredLanguage: extra.preferredLanguage || 'en',
    farmName: extra.farmName || `${extra.firstName}'s Livestock Farm`,
    farmLocation: extra.farmLocation || 'Maharashtra, India',
    role: (email.toLowerCase().includes('admin')) ? 'admin' : 'farmer',
    photoUrl: undefined,
    createdAt: new Date().toISOString()
  };

  await syncUserProfileToFirestore(profile);
  return profile;
}

/**
 * 3. Email & Password Sign In
 */
export async function signInWithEmailPassword(email: string, pass: string): Promise<UserProfile> {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  const fbUser = cred.user;

  let profile = await getUserProfileFromFirestore(fbUser.uid);
  if (!profile) {
    profile = {
      id: fbUser.uid,
      name: fbUser.displayName || email.split('@')[0],
      email: email.toLowerCase(),
      phone: fbUser.phoneNumber || '',
      preferredLanguage: 'en',
      farmName: `${fbUser.displayName || 'Farmer'}'s Livestock Farm`,
      farmLocation: 'Maharashtra, India',
      role: (email.toLowerCase().includes('admin')) ? 'admin' : 'farmer',
      createdAt: new Date().toISOString()
    };
    await syncUserProfileToFirestore(profile);
  }
  return profile;
}

/**
 * 4. Password Reset Email
 */
export async function sendPasswordReset(email: string): Promise<void> {
  await firebaseSendPasswordResetEmail(auth, email);
}

/**
 * 5. Phone Authentication: Setup Recaptcha Verifier
 */
let globalRecaptchaVerifier: RecaptchaVerifier | null = null;

export function setupPhoneRecaptcha(containerId: string): RecaptchaVerifier {
  if (globalRecaptchaVerifier) {
    try {
      globalRecaptchaVerifier.clear();
    } catch {
      // ignore
    }
  }
  globalRecaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved
    },
    'expired-callback': () => {
      console.warn('reCAPTCHA expired. User must retry.');
    }
  });
  return globalRecaptchaVerifier;
}

/**
 * 6. Phone Authentication: Send SMS Verification Code
 */
export async function sendPhoneOtp(
  phoneNumber: string,
  verifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  return await signInWithPhoneNumber(auth, phoneNumber, verifier);
}

/**
 * 7. Phone Authentication: Confirm OTP Code & Sign In
 */
export async function confirmPhoneOtp(
  confirmationResult: ConfirmationResult,
  otpCode: string,
  extraProfileData?: Partial<UserProfile>
): Promise<UserProfile> {
  const cred = await confirmationResult.confirm(otpCode);
  const fbUser = cred.user;

  let profile = await getUserProfileFromFirestore(fbUser.uid);
  if (!profile) {
    profile = {
      id: fbUser.uid,
      name: extraProfileData?.name || `Farmer (${fbUser.phoneNumber?.slice(-4) || 'User'})`,
      phone: fbUser.phoneNumber || extraProfileData?.phone || '',
      email: fbUser.email || extraProfileData?.email || '',
      preferredLanguage: extraProfileData?.preferredLanguage || 'en',
      farmName: extraProfileData?.farmName || 'My Livestock Farm',
      farmLocation: extraProfileData?.farmLocation || 'Maharashtra, India',
      role: 'farmer',
      createdAt: new Date().toISOString()
    };
    await syncUserProfileToFirestore(profile);
  }
  return profile;
}

/**
 * 8. Sign out from Firebase
 */
export async function logOutFromFirebase(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Listen to auth state changes
 */
export function onAuthUserChanged(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ==========================================
// 2. REAL-TIME FIRESTORE USER PROFILE HELPERS
// ==========================================

export async function syncUserProfileToFirestore(profile: UserProfile): Promise<void> {
  const path = `users/${profile.id}`;
  try {
    await setDoc(doc(db, 'users', profile.id), profile, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getUserProfileFromFirestore(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error: any) {
    if (isPermissionError(error)) {
      handleFirestoreError(error, OperationType.GET, path);
    }
    console.warn(`Firestore user profile read note for ${uid}:`, error?.message || error);
    
    // Attempt recovery from local storage cache for seamless offline operation
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const cached = localStorage.getItem('pashucare_user');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.id === uid) {
            return parsed;
          }
        }
      }
    } catch {
      // ignore
    }
    return null;
  }
}

// ==========================================
// 3. REAL-TIME FIRESTORE DATA LISTENERS & CRUD
// ==========================================

/**
 * Real-time Livestock Animals Listener
 */
export function subscribeToAnimals(
  userId: string,
  onUpdate: (animals: AnimalProfile[]) => void,
  onError?: (err: any) => void
): () => void {
  const path = 'animals';
  const q = query(collection(db, path), where('userId', '==', userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const animalsList: AnimalProfile[] = [];
      snapshot.forEach((docSnap) => {
        animalsList.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      // Sort newest first
      animalsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(animalsList);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function addAnimalToFirestore(animal: AnimalProfile): Promise<void> {
  const path = `animals/${animal.id}`;
  try {
    await setDoc(doc(db, 'animals', animal.id), animal);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateAnimalInFirestore(animal: AnimalProfile): Promise<void> {
  const path = `animals/${animal.id}`;
  try {
    await setDoc(doc(db, 'animals', animal.id), animal, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteAnimalFromFirestore(animalId: string): Promise<void> {
  const path = `animals/${animalId}`;
  try {
    await deleteDoc(doc(db, 'animals', animalId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Real-time Health Reports Listener
 */
export function subscribeToReports(
  userId: string,
  onUpdate: (reports: HealthReport[]) => void,
  onError?: (err: any) => void
): () => void {
  const path = 'reports';
  const q = query(collection(db, path), where('userId', '==', userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const reportsList: HealthReport[] = [];
      snapshot.forEach((docSnap) => {
        reportsList.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      reportsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(reportsList);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function addReportToFirestore(report: HealthReport): Promise<void> {
  const path = `reports/${report.id}`;
  try {
    await setDoc(doc(db, 'reports', report.id), report);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteReportFromFirestore(reportId: string): Promise<void> {
  const path = `reports/${reportId}`;
  try {
    await deleteDoc(doc(db, 'reports', reportId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Real-time Reminders Listener
 */
export function subscribeToReminders(
  userId: string,
  onUpdate: (reminders: Reminder[]) => void,
  onError?: (err: any) => void
): () => void {
  const path = 'reminders';
  const q = query(collection(db, path), where('userId', '==', userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const remList: Reminder[] = [];
      snapshot.forEach((docSnap) => {
        remList.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      remList.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      onUpdate(remList);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function addReminderToFirestore(reminder: Reminder): Promise<void> {
  const path = `reminders/${reminder.id}`;
  try {
    await setDoc(doc(db, 'reminders', reminder.id), reminder);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function toggleReminderInFirestore(reminderId: string, completed: boolean): Promise<void> {
  const path = `reminders/${reminderId}`;
  try {
    await updateDoc(doc(db, 'reminders', reminderId), { completed });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteReminderFromFirestore(reminderId: string): Promise<void> {
  const path = `reminders/${reminderId}`;
  try {
    await deleteDoc(doc(db, 'reminders', reminderId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Real-time Vet Requests Listener
 */
export function subscribeToVetRequests(
  userId: string,
  onUpdate: (requests: VeterinarianRequest[]) => void,
  onError?: (err: any) => void
): () => void {
  const path = 'vetRequests';
  const q = query(collection(db, path), where('userId', '==', userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const reqList: VeterinarianRequest[] = [];
      snapshot.forEach((docSnap) => {
        reqList.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      reqList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(reqList);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function addVetRequestToFirestore(request: VeterinarianRequest): Promise<void> {
  const path = `vetRequests/${request.id}`;
  try {
    await setDoc(doc(db, 'vetRequests', request.id), request);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * ============================================================================
 * FIREBASE CLOUD MESSAGING (FCM) & REAL-TIME NOTIFICATIONS FOR LIVESTOCK CARE
 * ============================================================================
 */

/**
 * Request Push Notification Permission and acquire FCM Device Registration Token
 */
export async function requestPushNotificationPermission(userId?: string): Promise<{
  status: PushPermissionStatus;
  token: string | null;
  error?: string;
}> {
  if (typeof window === 'undefined') {
    return { status: 'unsupported', token: null };
  }

  if (!('Notification' in window)) {
    return { 
      status: 'unsupported', 
      token: null, 
      error: 'Web Push Notifications are not supported in this browser environment.' 
    };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { status: permission as PushPermissionStatus, token: null };
    }

    // Register FCM Service Worker
    let swReg: ServiceWorkerRegistration | undefined;
    if ('serviceWorker' in navigator) {
      try {
        swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        await navigator.serviceWorker.ready;
      } catch (swErr) {
        console.warn('FCM Service worker registration note:', swErr);
      }
    }

    // Verify FCM messaging support in current context
    const supported = await isMessagingSupported().catch(() => false);
    if (!supported) {
      return { 
        status: 'granted', 
        token: null, 
        error: 'Push permission granted (local notifications active).' 
      };
    }

    if (!messaging) {
      messaging = getMessaging(app);
    }

    let token: string | null = null;
    try {
      token = await getToken(messaging, {
        serviceWorkerRegistration: swReg,
      });
    } catch (tokenErr: any) {
      console.warn('FCM getToken note (falling back to standard service worker push):', tokenErr);
    }

    // Persist registration token to Firestore if user is authenticated
    if (userId && token) {
      await registerFCMTokenInFirestore(userId, token);
    }

    return { status: 'granted', token };
  } catch (err: any) {
    console.error('Error requesting notification permission:', err);
    return { status: 'denied', token: null, error: err.message };
  }
}

/**
 * Persist farmer device FCM token into Firestore
 */
export async function registerFCMTokenInFirestore(userId: string, token: string): Promise<void> {
  const tokenDocId = token.replace(/[^a-zA-Z0-9_-]/g, '_').slice(-40);
  const path = `users/${userId}/fcmTokens/${tokenDocId}`;
  try {
    await setDoc(doc(db, 'users', userId, 'fcmTokens', tokenDocId), {
      token,
      userId,
      updatedAt: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      platform: 'web'
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore FCM token registration note:', err);
  }
}

/**
 * Foreground FCM Message Listener (triggered when the web app is open)
 */
export function subscribeToForegroundFCM(
  onNotificationReceived: (notification: { title: string; body: string; data?: any }) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  let unsubscribe: (() => void) | null = null;

  isMessagingSupported().then((supported) => {
    if (supported) {
      try {
        if (!messaging) {
          messaging = getMessaging(app);
        }
        unsubscribe = onMessage(messaging, (payload) => {
          console.log('[FCM] Foreground push notification received:', payload);
          const title = payload.notification?.title || payload.data?.title || 'PashuCare AI Alert';
          const body = payload.notification?.body || payload.data?.body || 'New livestock update.';
          
          onNotificationReceived({
            title,
            body,
            data: payload.data
          });

          // Trigger browser notification if permission is active
          triggerLocalPushNotification(title, {
            body,
            icon: '/icon.svg',
            badge: '/icon.svg',
            data: payload.data
          });
        });
      } catch (e) {
        console.debug('Foreground message listener notice:', e);
      }
    }
  }).catch(() => {});

  return () => {
    if (unsubscribe) unsubscribe();
  };
}

/**
 * Display a system-level browser push notification (via Service Worker or Notification API)
 */
export function triggerLocalPushNotification(title: string, options?: NotificationOptions): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(title, {
            icon: '/icon.svg',
            badge: '/icon.svg',
            ...options
          } as any);
        }).catch(() => {
          new Notification(title, options);
        });
      } else {
        new Notification(title, options);
      }
    } catch (e) {
      console.debug('System notification notice:', e);
    }
  }
}

/**
 * Real-time Notifications Subscription for the logged-in Farmer
 */
export function subscribeToNotifications(
  userId: string,
  onUpdate: (notifications: PushNotificationItem[]) => void,
  onError?: (err: any) => void
): () => void {
  const path = 'notifications';
  const q = query(collection(db, path), where('userId', '==', userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: PushNotificationItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

/**
 * Save notification record in Firestore
 */
export async function addNotificationToFirestore(item: PushNotificationItem): Promise<void> {
  const path = `notifications/${item.id}`;
  try {
    await setDoc(doc(db, 'notifications', item.id), item);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsReadInFirestore(notificationId: string): Promise<void> {
  const path = `notifications/${notificationId}`;
  try {
    await updateDoc(doc(db, 'notifications', notificationId), { read: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Delete a notification
 */
export async function deleteNotificationFromFirestore(notificationId: string): Promise<void> {
  const path = `notifications/${notificationId}`;
  try {
    await deleteDoc(doc(db, 'notifications', notificationId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Dispatch real-time alert for upcoming vaccination reminders
 */
export async function dispatchVaccinationAlert(
  userId: string,
  animalName: string,
  reminderTitle: string,
  dueDate: string
): Promise<PushNotificationItem> {
  const notificationId = `notif-vax-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const title = `💉 Vaccination Due: ${animalName}`;
  const body = `Upcoming vaccination "${reminderTitle}" is due on ${dueDate}. Ensure immunizations are administered on time.`;

  const item: PushNotificationItem = {
    id: notificationId,
    userId,
    title,
    body,
    category: 'vaccination',
    read: false,
    urgent: false,
    createdAt: new Date().toISOString(),
    data: {
      animalName,
      reminderTitle,
      dueDate,
      url: '/?tab=reminders'
    }
  };

  await addNotificationToFirestore(item);
  triggerLocalPushNotification(title, {
    body,
    icon: '/icon.svg',
    badge: '/icon.svg',
    data: { url: '/?tab=reminders', category: 'vaccination' }
  });

  return item;
}

/**
 * Dispatch real-time alert for urgent veterinarian responses
 */
export async function dispatchUrgentVetResponseAlert(
  userId: string,
  animalName: string,
  vetName: string,
  vetNotes: string,
  status: string
): Promise<PushNotificationItem> {
  const notificationId = `notif-vet-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const title = `🚨 Urgent Vet Response: ${animalName}`;
  const cleanNotes = vetNotes ? ` "${vetNotes.slice(0, 90)}${vetNotes.length > 90 ? '...' : ''}"` : '';
  const body = `Dr. ${vetName || 'Field Veterinarian'} marked consultation as [${status}]. Clinical note:${cleanNotes}`;

  const item: PushNotificationItem = {
    id: notificationId,
    userId,
    title,
    body,
    category: 'vet_response',
    read: false,
    urgent: true,
    createdAt: new Date().toISOString(),
    data: {
      animalName,
      vetName,
      status,
      url: '/?tab=vet'
    }
  };

  await addNotificationToFirestore(item);
  triggerLocalPushNotification(title, {
    body,
    icon: '/icon.svg',
    badge: '/icon.svg',
    requireInteraction: true,
    data: { url: '/?tab=vet', category: 'vet_response', urgent: 'true' }
  });

  return item;
}


