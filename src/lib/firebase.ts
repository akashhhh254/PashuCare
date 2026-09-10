import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signOut as firebaseSignOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth 
} from 'firebase/auth';
import { 
  getFirestore, 
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
import firebaseConfig from '../../firebase-applet-config.json';
import { AnimalProfile, HealthReport, Reminder, VeterinarianRequest, UserProfile } from '../types';

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
googleAuthProvider.setCustomParameters({
  prompt: 'select_account',
});

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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
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

// ==========================================
// 1. FIREBASE AUTHENTICATION FLOWS
// ==========================================

/**
 * 1. Google Sign-In with Popup
 */
export async function signInWithGooglePopup(): Promise<UserProfile> {
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
  return profile;
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
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
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

