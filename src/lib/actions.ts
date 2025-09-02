"use server";

import {
  suggestUserRoles,
  type SuggestUserRolesInput,
  type SuggestUserRolesOutput,
} from "@/ai/flows/suggest-user-roles";
import { auth as adminAuth } from 'firebase-admin';
import { initializeAdminApp } from "./firebase-admin";
import { UserRecord } from "firebase-admin/auth";

export async function getRoleSuggestions(
  input: SuggestUserRolesInput
): Promise<SuggestUserRolesOutput> {
  try {
    const output = await suggestUserRoles(input);
    return output;
  } catch (error) {
    console.error("Error in getRoleSuggestions:", error);
    throw new Error("Failed to get role suggestions from AI.");
  }
}

export async function listUsers(): Promise<UserRecord[]> {
  try {
    await initializeAdminApp();
    const userRecords = await adminAuth().listUsers();
    // We need to serialize the user records to pass them to the client component.
    return JSON.parse(JSON.stringify(userRecords.users));
  } catch (error) {
    console.error("Error listing users:", error);
    throw new Error("Failed to list users.");
  }
}
