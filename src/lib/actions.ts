'use server';

import {
  suggestUserRoles,
} from '@/ai/flows/suggest-user-roles';
import {auth as adminAuth} from 'firebase-admin';
import {initializeAdminApp} from './firebase-admin';
import {isToday} from 'date-fns';
import type { SuggestUserRolesInput, SuggestUserRolesOutput, DashboardStats, UserRecord } from '@/types';


export async function getRoleSuggestions(
  input: SuggestUserRolesInput
): Promise<SuggestUserRolesOutput> {
  try {
    const output = await suggestUserRoles(input);
    return output;
  } catch (error) {
    console.error('Error in getRoleSuggestions:', error);
    throw new Error('Failed to get role suggestions from AI.');
  }
}

export async function listUsers(): Promise<UserRecord[]> {
  try {
    await initializeAdminApp();
    const userRecords = await adminAuth().listUsers();
    // We need to serialize the user records to pass them to the client component.
    return JSON.parse(JSON.stringify(userRecords.users));
  } catch (error) {
    console.error('Error listing users:', error);
    throw new Error('Failed to list users.');
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const users = await listUsers();
    const totalUsers = users.length;
    const activeToday = users.filter(user =>
      user.metadata.lastSignInTime && isToday(new Date(user.metadata.lastSignInTime))
    ).length;

    // These are static for now
    const rolesDefined = 3;
    const aiSuggestions = 18;

    return {
      totalUsers,
      activeToday,
      rolesDefined,
      aiSuggestions,
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    // Return zeroed stats on error
    return {
      totalUsers: 0,
      activeToday: 0,
      rolesDefined: 0,
      aiSuggestions: 0,
    };
  }
}
