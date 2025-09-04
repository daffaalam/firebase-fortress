import { initializeApp, getApps, App, cert } from "firebase-admin/app";

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

let adminApp: App | undefined;

export async function initializeAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  if (!serviceAccount) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.");
  }

  try {
    adminApp = initializeApp({
      credential: cert(serviceAccount),
    });
    return adminApp;
  } catch (error) {
    console.error("Firebase admin initialization error", error);
    throw error;
  }
}
