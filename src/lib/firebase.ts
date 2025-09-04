import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, GoogleAuthProvider } from "firebase/auth";
import en from "@/locales/en.json";

// These variables will hold the singleton instances of the Firebase services.
// We use simple module-level variables to ensure that the Firebase app is
// initialized only once, as modules are cached after the first import.
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
 * Initializes the Firebase client application and returns service instances.
 *
 * This function is designed to be called ONLY from the client-side. It's safe for
 * SSR because it checks for the `window` object.
 *
 * It uses a singleton pattern to ensure that Firebase is initialized only once
 * per application lifecycle. The instances are stored in module-level variables to
 * survive hot reloads in development environments.
 */
export async function getFirebaseClient() {
  if (typeof window === "undefined") {
    return { app: null, auth: null, googleProvider: null };
  }

  // If instances are already initialized, return them.
  if (app && auth && googleProvider) {
    return { app, auth, googleProvider };
  }

  // Fetch the configuration dynamically from our API route.
  const firebaseConfig = await getFirebaseConfig();

  if (!firebaseConfig) {
    console.error(en["error.firebaseConfigMissing"]);
    return { app: null, auth: null, googleProvider: null };
  }

  // Initialize Firebase App. Use getApp() if it's already initialized (e.g., by the auth handler).
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();

  return { app, auth, googleProvider };
}
