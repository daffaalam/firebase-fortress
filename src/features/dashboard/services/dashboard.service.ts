"use server";

import { isToday } from "date-fns";
import type { DashboardStats } from "../models/dashboard.model";
import { listUsers } from "../../auth/services/user.service";

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
    console.error("Error getting dashboard stats:", error);
    // Return zeroed stats on error
    return {
      totalUsers: 0,
      activeToday: 0,
    };
  }
}
