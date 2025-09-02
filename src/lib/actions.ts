'use server';

import { auth as adminAuth } from 'firebase-admin';
import { initializeAdminApp } from './firebase-admin';
import { isToday } from 'date-fns';
import type { DashboardStats, UserRecord } from '@/types';
import { z } from 'zod';

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
  } catch (error: any) {
    console.error('Error creating user:', error);
    return { success: false, error: error.message || 'Gagal membuat pengguna.' };
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
    throw new Error('Gagal memuat daftar pengguna.');
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const users = await listUsers();
    const totalUsers = users.length;
    const activeToday = users.filter(
      (user) => user.metadata.lastSignInTime && isToday(new Date(user.metadata.lastSignInTime)),
    ).length;

    return {
      totalUsers,
      activeToday,
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    // Return zeroed stats on error
    return {
      totalUsers: 0,
      activeToday: 0,
    };
  }
}
