import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, GoogleAuthProvider } from "firebase/auth";

// These variables will hold the singleton instances of the Firebase services.
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

/**
 * Dynamically fetches the Firebase client configuration from the server.
 * This function is designed to run exclusively in the browser.
 */
async function getFirebaseConfig() {
  try {
    const res = await fetch("/api/firebase-config");
    if (!res.ok) {
      console.error("Failed to fetch Firebase config. Status:", res.status);
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error("Firebase config fetch error:", error);
    return null;
  }
}

/**
 * Initializes the Firebase client application.
 * 
 * IMPORTANT:
 * This function is designed to be called ONLY from the client-side, typically inside
 * a `useEffect` hook within a 'use client' component.
 * 
 * It is build-safe and SSR-safe because it explicitly checks if it's running on the server
 * (`typeof window === 'undefined'`) and returns null in that case, preventing errors.
 */
export async function getFirebaseClient() {
  // If running on the server (during build or SSR), immediately return null.
  // This prevents any browser-specific code from executing on the server.
  if (typeof window === "undefined") {
    return { app: null, auth: null, googleProvider: null };
  }

  // If the app is already initialized in the browser, return the existing instances.
  if (app && auth && googleProvider) {
    return { app, auth, googleProvider };
  }

  // Fetch the configuration dynamically from our API route.
  const firebaseConfig = await getFirebaseConfig();

  if (!firebaseConfig) {
    console.error("Firebase configuration could not be loaded. Client-side features will be disabled.");
    return { app: null, auth: null, googleProvider: null };
  }

  // Initialize Firebase in the browser for the first time.
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();

  return { app, auth, googleProvider };
}
