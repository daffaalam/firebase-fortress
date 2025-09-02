import { z } from "zod";
import type { UserRecord as FirebaseUserRecord } from "firebase-admin/auth";

export const SuggestUserRolesInputSchema = z.object({
  userProfile: z
    .string()
    .describe("A description of the user profile, including details like name, job title, and department."),
  userActivity: z
    .string()
    .describe("A description of the user activity, including details like recent actions and access patterns."),
});
export type SuggestUserRolesInput = z.infer<typeof SuggestUserRolesInputSchema>;

export const SuggestUserRolesOutputSchema = z.object({
  suggestedRoles: z
    .array(z.string())
    .describe("An array of suggested roles for the user, based on their profile and activity."),
  justification: z.string().describe("A justification for the suggested roles, explaining why they are appropriate."),
});
export type SuggestUserRolesOutput = z.infer<typeof SuggestUserRolesOutputSchema>;

export type DashboardStats = {
  totalUsers: number;
  activeToday: number;
  rolesDefined: number;
  aiSuggestions: number;
};

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
