"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { Loader2 } from "lucide-react";
import { initializeApp } from "firebase/app";

// FirebaseUI is not a standard NPM package, so we import it from a CDN.
// We need to declare the `firebaseui` global to satisfy TypeScript.
declare const firebaseui: any;

async function getFirebaseConfig() {
  const res = await fetch("/api/firebase-config");
  if (!res.ok) {
    throw new Error("Failed to fetch Firebase config");
  }
  return res.json();
}

export default function FirebaseAuthHandler() {
  const [firebaseUiLoaded, setFirebaseUiLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseUiLoaded) return;

    const startFirebaseAuthUi = async () => {
      try {
        const firebaseConfig = await getFirebaseConfig();

        if (!firebaseConfig) {
          throw new Error("Firebase config not found.");
        }
        
        // Initialize a temporary app instance for the UI handler.
        // This is safe even if the main app is initialized elsewhere.
        const app = initializeApp(firebaseConfig);

        // FirebaseUI config.
        const uiConfig = {
          // This will be null if we are not in a browser
          signInSuccessUrl: typeof window !== "undefined" ? window.location.origin : "/dashboard",
          signInFlow: "popup",
          signInOptions: [], // We are not showing any buttons, just handling the redirect.
          callbacks: {
            // Avoid redirects after sign-in.
            signInSuccessWithAuthResult: () => false,
          },
        };

        // Start the FirebaseUI Auth interface.
        const ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(app.auth);
        ui.start("#firebaseui-auth-container", uiConfig);
      } catch (e: any) {
        console.error("Firebase UI Handler Error:", e);
        setError(e.message || "An unexpected error occurred during authentication.");
      }
    };

    startFirebaseAuthUi();
  }, [firebaseUiLoaded]);

  return (
    <>
      <Script
        src="https://www.gstatic.com/firebasejs/ui/6.0.1/firebase-ui-auth.js"
        onLoad={() => setFirebaseUiLoaded(true)}
        onError={() => setError("Failed to load Firebase authentication handler.")}
      />
      <link type="text/css" rel="stylesheet" href="https://www.gstatic.com/firebasejs/ui/6.0.1/firebase-ui-auth.css" />
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
        <div id="firebaseui-auth-container"></div>
        {error ? (
          <div className="text-destructive">
            <h1 className="text-xl font-bold">Authentication Error</h1>
            <p>{error}</p>
            <p className="mt-4 text-sm">Please try again or contact support.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Please wait while we complete your request...</p>
          </div>
        )}
      </div>
    </>
  );
}
