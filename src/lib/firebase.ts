import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, GoogleAuthProvider } from "firebase/auth";

// These variables will hold the singleton instances of the Firebase services.
// We use a global variable to ensure that the Firebase app is initialized only once.
// Using `global` is a way to persist the variable across hot reloads in development.
declare global {
  var _firebaseApp: FirebaseApp | null;
  var _firebaseAuth: Auth | null;
  var _googleProvider: GoogleAuthProvider | null;
}

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
 * Initializes the Firebase client application and returns service instances.
 *
 * This function is designed to be called ONLY from the client-side. It's safe for
 * SSR because it checks for the `window` object.
 *
 * It uses a singleton pattern to ensure that Firebase is initialized only once
 * per application lifecycle. The instances are stored in global variables to
 * survive hot reloads in development environments.
 */
export async function getFirebaseClient() {
  if (typeof window === "undefined") {
    return { app: null, auth: null, googleProvider: null };
  }

  // If instances are already initialized, return them.
  if (global._firebaseApp && global._firebaseAuth && global._googleProvider) {
    return { app: global._firebaseApp, auth: global._firebaseAuth, googleProvider: global._googleProvider };
  }

  // Fetch the configuration dynamically from our API route.
  const firebaseConfig = await getFirebaseConfig();

  if (!firebaseConfig) {
    console.error("Firebase configuration could not be loaded. Client-side features will be disabled.");
    return { app: null, auth: null, googleProvider: null };
  }

  // Initialize Firebase App. Use getApp() if it's already initialized (e.g., by the auth handler).
  global._firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  global._firebaseAuth = getAuth(global._firebaseApp);
  global._googleProvider = new GoogleAuthProvider();

  return { app: global._firebaseApp, auth: global._firebaseAuth, googleProvider: global._googleProvider };
}
