"use server";

import {
  suggestUserRoles,
  type SuggestUserRolesInput,
  type SuggestUserRolesOutput,
} from "@/ai/flows/suggest-user-roles";

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
