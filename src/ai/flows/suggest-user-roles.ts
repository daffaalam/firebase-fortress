"use server";

/**
 * @fileOverview This file defines a Genkit flow for suggesting user roles based on user profile and activity.
 *
 * - suggestUserRoles - A function that suggests appropriate role assignments for new users.
 * - SuggestUserRolesInput - The input type for the suggestUserRoles function.
 * - SuggestUserRolesOutput - The return type for the suggestUserRoles function.
 */

import { ai } from "@/ai/genkit";
import {
  SuggestUserRolesInputSchema,
  SuggestUserRolesOutputSchema,
  type SuggestUserRolesInput,
  type SuggestUserRolesOutput,
} from "@/types";

export async function suggestUserRoles(input: SuggestUserRolesInput): Promise<SuggestUserRolesOutput> {
  return suggestUserRolesFlow(input);
}

const prompt = ai.definePrompt({
  name: "suggestUserRolesPrompt",
  input: { schema: SuggestUserRolesInputSchema },
  output: { schema: SuggestUserRolesOutputSchema },
  prompt: `You are an AI assistant that suggests appropriate roles for new users in a Firebase application.

  Based on the user's profile and activity, you will suggest a list of roles that are appropriate for them.
  You will also provide a justification for your suggestions.

  User Profile: {{{userProfile}}}
  User Activity: {{{userActivity}}}

  Consider the following roles when making your suggestions: admin, editor, viewer.
  Roles should be tailored to the specific user profile and activity.
  Avoid assigning overly permissive roles unless there is a clear justification based on the provided information.
  The suggested roles are a list of strings in the output. Do not include any explanation or surrounding words.
`,
});

const suggestUserRolesFlow = ai.defineFlow(
  {
    name: "suggestUserRolesFlow",
    inputSchema: SuggestUserRolesInputSchema,
    outputSchema: SuggestUserRolesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  },
);
