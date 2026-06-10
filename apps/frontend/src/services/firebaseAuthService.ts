import { auth } from "@/lib/firebase";
import {
    GoogleAuthProvider,
    PhoneAuthProvider,
    signInWithCredential,
    signOut,
} from "firebase/auth";

/**
 * Sign in with Google using an ID token from native Google Sign-In.
 * Pass the idToken from GoogleSignin.getTokens().
 */
export async function firebaseGoogleSignInWithIdToken(idToken: string) {
    try {

  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, credential);
  const token = await result.user.getIdToken();
  
  return {
    uid: result.user.uid,
    email: result.user.email,
    displayName: result.user.displayName,
    photoURL: result.user.photoURL,
    phoneNumber: result.user.phoneNumber,
    idToken: token,
  };
    } catch (error: any) {
    throw new Error(`Google Sign-In Failed: ${error.message}`);
  }
}

/**
 * Verify phone OTP using a verificationId + OTP code.
 * The verificationId comes from Firebase phone auth (handled natively via firebase/auth).
 */
export const firebaseVerifyPhoneOTP = async (
  verificationId: string,
  otp: string,
) => {
  try {
    const credential = PhoneAuthProvider.credential(verificationId, otp);
    const userCredential = await signInWithCredential(auth, credential);

    return {
      user: userCredential.user,
      idToken: await userCredential.user.getIdToken(),
      phoneNumber: userCredential.user.phoneNumber,
      uid: userCredential.user.uid,
    };
  } catch (error: any) {
    throw new Error(`Phone OTP Verification Failed: ${error.message}`);
  }
};

/**
 * Get the current Firebase user (synchronous).
 */
export const getCurrentFirebaseUser = () => {
  return auth.currentUser;
};

/**
 * Get Firebase ID token for the current user.
 */
export const getFirebaseIdToken = async (): Promise<string | null> => {
  try {
    if (!auth.currentUser) return null;
    return await auth.currentUser.getIdToken();
  } catch {
    return null;
  }
};

/**
 * Sign out from Firebase.
 */
export const firebaseSignOut = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(`Sign Out Failed: ${error.message}`);
  }
};

