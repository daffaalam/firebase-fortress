"use client";

import { UserTable } from "@/features/dashboard/components/users/user-table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Users, PlusCircle } from "lucide-react";
import { AddUserDialog } from "@/features/dashboard/components/users/add-user-dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function UsersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [refreshUsers, setRefreshUsers] = useState(false);

  const onUserAdded = () => {
    setRefreshUsers((prev) => !prev); // Toggle to trigger re-fetch
  };

  return (
    <main className="flex-1 p-4 sm:p-6">
      <AddUserDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onUserAdded={onUserAdded} />
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Manajemen Pengguna</CardTitle>
                <CardDescription>Lihat, perbarui, dan kelola semua pengguna di aplikasi Anda.</CardDescription>
              </div>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Pengguna
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <UserTable key={refreshUsers ? "refresh" : "initial"} />
        </CardContent>
      </Card>
    </main>
  );
}
