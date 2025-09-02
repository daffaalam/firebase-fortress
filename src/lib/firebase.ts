import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, GoogleAuthProvider } from "firebase/auth";

// Variabel untuk menyimpan instance Firebase yang sudah diinisialisasi
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

// Fungsi untuk mendapatkan konfigurasi dari server
async function getFirebaseConfig() {
  const res = await fetch("/api/firebase-config");
  if (!res.ok) {
    throw new Error("Failed to fetch Firebase config from server.");
  }
  return res.json();
}

/**
 * Menginisialisasi aplikasi klien Firebase secara dinamis.
 * Mengambil konfigurasi dari API route sisi server.
 * Ini memastikan tidak ada variabel lingkungan sensitif yang terekspos di sisi klien.
 */
export async function getFirebaseClient() {
  if (app && auth && googleProvider) {
    return { app, auth, googleProvider };
  }

  const firebaseConfig = await getFirebaseConfig();

  if (!firebaseConfig.apiKey) {
    throw new Error("Firebase config is missing API key. Make sure server environment variables are set.");
  }

  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();

  return { app, auth, googleProvider };
}
