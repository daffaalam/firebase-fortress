"use server";

import { auth as adminAuth } from "firebase-admin";
import { initializeAdminApp } from "@/lib/firebase-admin";
import type { UserRecord } from "../models/user.model";
import { z } from "zod";
import { Locales } from "@/locales/locales";
import en from "@/locales/en.json";

const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function createUser(formData: FormData) {
  try {
    const validatedData = CreateUserSchema.parse(Object.fromEntries(formData.entries()));
    await initializeAdminApp();
    await adminAuth().createUser({
      email: validatedData.email,
      password: validatedData.password,
    });
    return { success: true };
  } catch (error: unknown) {
    console.error("Error creating user:", error);
    const errorMessage = error instanceof Error ? error.message : en["userManagement.addUser.error.generic"];
    return { success: false, error: errorMessage };
  }
}

export async function listUsers(): Promise<UserRecord[]> {
  // If the key is not available (e.g., during build), return an empty array.
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    console.log("Build environment detected or service key missing. Returning empty user list.");
    return [];
  }
  try {
    await initializeAdminApp();
    const userRecords = await adminAuth().listUsers();
    // We need to serialize the user records to pass them to the client component.
    return JSON.parse(JSON.stringify(userRecords.users));
  } catch (error) {
    console.error("Error listing users:", error);
    // Instead of throwing, return an empty array to prevent build/runtime crashes.
    // The dashboard page already has a warning for when the service account is missing.
    return [];
  }
}
