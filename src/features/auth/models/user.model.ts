import type { UserRecord as FirebaseUserRecord } from "firebase-admin/auth";

// We create a serializable UserRecord type because the default one is not.
export type UserRecord = Omit<FirebaseUserRecord, "toJSON" | "providerData"> & {
  providerData: Omit<FirebaseUserRecord["providerData"][0], "toJSON">[];
  // Convert metadata to a serializable format.
  metadata: {
    creationTime: string;
    lastSignInTime: string;
    lastRefreshTime?: string;
  };
};
