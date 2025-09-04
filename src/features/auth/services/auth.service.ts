"use client";

import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendSignInLinkToEmail,
  onAuthStateChanged as onFirebaseAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  verifyBeforeUpdateEmail,
  sendPasswordResetEmail,
  UserProfile,
} from "firebase/auth";
import { getFirebaseClient } from "@/lib/firebase";
import en from "@/locales/en.json";

export const authService = {
  async signInWithEmail(email: string, password: string) {
    try {
      const { auth } = await getFirebaseClient();
      if (!auth) throw new Error(en["error.authServiceConnectionFailed"]);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      if (!userCredential.user.emailVerified) {
        await signOut(auth);
        return { success: false, error: "auth/email-not-verified" };
      }

      return { success: true, user: userCredential.user };
    } catch (error: unknown) {
      const errorCode =
        error instanceof Error && "code" in error ? (error as { code: string }).code : "auth/unknown-error";
      return { success: false, error: errorCode };
    }
  },

  async sendPasswordlessLink(email: string) {
    try {
      const { auth } = await getFirebaseClient();
      if (!auth) throw new Error(en["error.authServiceConnectionFailed"]);
      const actionCodeSettings = {
        url: `${window.location.origin}/auth/action?mode=signIn`,
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", email);
      return { success: true };
    } catch (error: unknown) {
      const errorCode =
        error instanceof Error && "code" in error ? (error as { code: string }).code : "auth/unknown-error";
      return { success: false, error: errorCode };
    }
  },

  async signInWithGoogle() {
    try {
      const { auth, googleProvider } = await getFirebaseClient();
      if (!auth || !googleProvider) throw new Error(en["error.googleSignInNotAvailable"]);
      const result = await signInWithPopup(auth, googleProvider);
      return { success: true, user: result.user };
    } catch (error: unknown) {
      const errorCode =
        error instanceof Error && "code" in error ? (error as { code: string }).code : "auth/unknown-error";
      return { success: false, error: errorCode };
    }
  },

  async signOutUser() {
    try {
      const { auth } = await getFirebaseClient();
      if (!auth) throw new Error(en["error.authServiceConnectionFailed"]);
      await signOut(auth);
      return { success: true };
    } catch (error: unknown) {
      const errorCode =
        error instanceof Error && "code" in error ? (error as { code: string }).code : "auth/unknown-error";
      return { success: false, error: errorCode };
    }
  },

  async signUpWithEmail(email: string, password: string) {
    try {
      const { auth } = await getFirebaseClient();
      if (!auth) throw new Error(en["error.authServiceConnectionFailed"]);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const actionCodeSettings = {
        url: `${window.location.origin}/login`,
        handleCodeInApp: true,
      };
      await sendEmailVerification(userCredential.user, actionCodeSettings);
      return { success: true };
    } catch (error: unknown) {
      const errorCode =
        error instanceof Error && "code" in error ? (error as { code: string }).code : "auth/unknown-error";
      return { success: false, error: errorCode };
    }
  },

  async updateUserProfile(user: User, profileData: UserProfile) {
    try {
      await updateProfile(user, profileData);
      return { success: true };
    } catch (error: unknown) {
      const errorCode =
        error instanceof Error && "code" in error ? (error as { code: string }).code : "auth/unknown-error";
      return { success: false, error: errorCode };
    }
  },

  async verifyEmail(user: User, newEmail: string) {
    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/dashboard/profile`,
        handleCodeInApp: true,
      };
      await verifyBeforeUpdateEmail(user, newEmail, actionCodeSettings);
      return { success: true };
    } catch (error: unknown) {
      const errorCode =
        error instanceof Error && "code" in error ? (error as { code: string }).code : "auth/unknown-error";
      return { success: false, error: errorCode };
    }
  },

  async sendPasswordReset(email: string) {
    try {
      const { auth } = await getFirebaseClient();
      if (!auth) throw new Error(en["error.authServiceConnectionFailed"]);
      const actionCodeSettings = {
        url: `${window.location.origin}/login`,
        handleCodeInApp: true,
      };
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      return { success: true };
    } catch (error: unknown) {
      const errorCode =
        error instanceof Error && "code" in error ? (error as { code: string }).code : "auth/unknown-error";
      return { success: false, error: errorCode };
    }
  },

  onAuthStateChanged(callback: (user: User | null) => void) {
    let unsubscribe = () => {};
    getFirebaseClient().then(({ auth }) => {
      if (auth) {
        unsubscribe = onFirebaseAuthStateChanged(auth, callback);
      }
    });
    return () => unsubscribe();
  },
};
