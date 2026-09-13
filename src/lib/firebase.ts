import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  sendEmailVerification, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { User } from '../types';
import { getDeviceInfo } from './device';

// 1. Initialize Firebase App safely (singleton)
export const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 2. Initialize Firebase Auth
export const firebaseAuth = getAuth(firebaseApp);

// 3. Configure Google Auth Provider
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({
  prompt: 'select_account'
});

// 4. Initialize Firestore with the provisioned Database ID
export const firestoreDb = getFirestore(
  firebaseApp, 
  firebaseConfig.firestoreDatabaseId || undefined
);

export const FIREBASE_METADATA = {
  projectId: firebaseConfig.projectId,
  firestoreDatabaseId: firebaseConfig.firestoreDatabaseId,
  authDomain: firebaseConfig.authDomain
};

/**
 * Save or update learner record in Firestore users collection
 */
export async function syncLearnerToFirestore(user: User): Promise<void> {
  try {
    const userDocRef = doc(firestoreDb, 'users', user.id);
    const deviceInfo = user.device_info || getDeviceInfo();
    
    const payload: Partial<User> = {
      id: user.id,
      auth_provider: user.auth_provider || 'google',
      provider_user_id: user.provider_user_id || user.id,
      email: user.email,
      email_verified: user.email_verified ?? true,
      display_name: user.display_name,
      photo_url: user.photo_url,
      role: user.role || 'learner',
      account_status: user.account_status || 'active',
      device_info: deviceInfo,
      last_device: deviceInfo.summary,
      last_login_at: user.last_login_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (user.created_at) {
      payload.created_at = user.created_at;
    }

    await setDoc(userDocRef, payload, { merge: true });
  } catch (error) {
    console.error('Error saving learner to Firestore:', error);
  }
}

/**
 * Real-time listener for Admin Portal to see all learners across all devices and browsers
 */
export function subscribeToLearnersRealtime(
  onUpdate: (learners: User[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const usersCol = collection(firestoreDb, 'users');
    const q = query(usersCol);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const learners: User[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as User;
          learners.push({
            ...data,
            id: docSnap.id
          });
        });

        // Sort by most recently active first
        learners.sort((a, b) => {
          const timeA = new Date(a.last_login_at || a.created_at || 0).getTime();
          const timeB = new Date(b.last_login_at || b.created_at || 0).getTime();
          return timeB - timeA;
        });

        onUpdate(learners);
      },
      (error) => {
        console.warn('Real-time Firestore sync listener error:', error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err: any) {
    console.warn('Failed to subscribe to Firestore users:', err);
    return () => {};
  }
}

/**
 * Sign in with Google using Firebase Authentication Popup
 */
export async function signInWithGoogleFirebase(): Promise<{
  firebaseUser: FirebaseUser;
  isNewUser: boolean;
  appUser: User;
}> {
  const result = await signInWithPopup(firebaseAuth, googleAuthProvider);
  const fbUser = result.user;

  // Verification check:
  // For Google Sign-In, fbUser.emailVerified is true when verified by Google.
  const isVerified = Boolean(fbUser.emailVerified);
  const email = fbUser.email || '';
  const displayName = fbUser.displayName || email.split('@')[0] || 'Learner';
  const photoUrl = fbUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`;

  // Determine role: kapilnarula27july@gmail.com is Admin, others are Learners
  const isAdminEmail = email.toLowerCase() === 'kapilnarula27july@gmail.com';
  const role = isAdminEmail ? 'admin' : 'learner';

  const deviceInfo = getDeviceInfo();

  // Check if doc already exists in Firestore
  const userDocRef = doc(firestoreDb, 'users', fbUser.uid);
  const existingDoc = await getDoc(userDocRef);
  const isNew = !existingDoc.exists();

  const appUser: User = {
    id: fbUser.uid,
    auth_provider: 'google',
    provider_user_id: fbUser.uid,
    email,
    email_verified: isVerified,
    display_name: displayName,
    photo_url: photoUrl,
    role,
    account_status: 'active',
    device_info: deviceInfo,
    last_device: deviceInfo.summary,
    created_at: existingDoc.exists() ? (existingDoc.data() as User).created_at : new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_login_at: new Date().toISOString()
  };

  // Sync to Firestore immediately
  await syncLearnerToFirestore(appUser);

  return {
    firebaseUser: fbUser,
    isNewUser: isNew,
    appUser
  };
}

/**
 * Send email verification link to current authenticated Firebase user
 */
export async function sendEmailVerificationToCurrent(): Promise<{ success: boolean; message: string }> {
  if (!firebaseAuth.currentUser) {
    return { success: false, message: 'No active Firebase user found.' };
  }
  try {
    await sendEmailVerification(firebaseAuth.currentUser);
    return { success: true, message: `Verification email sent to ${firebaseAuth.currentUser.email}. Please check your inbox and spam folder.` };
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to send verification email.' };
  }
}

/**
 * Reload current Firebase user to refresh emailVerified status
 */
export async function reloadCurrentUserVerification(): Promise<boolean> {
  if (!firebaseAuth.currentUser) return false;
  await firebaseAuth.currentUser.reload();
  const isVerified = Boolean(firebaseAuth.currentUser.emailVerified);

  if (isVerified) {
    // Update firestore document
    const userDocRef = doc(firestoreDb, 'users', firebaseAuth.currentUser.uid);
    await setDoc(userDocRef, { email_verified: true, updated_at: new Date().toISOString() }, { merge: true });
  }

  return isVerified;
}
