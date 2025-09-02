import { UserTable } from "@/components/dashboard/user-table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function UsersPage() {
  return (
    <main className="flex-1 p-4 sm:p-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View, update, and manage all users in your application.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <UserTable />
        </CardContent>
      </Card>
    </main>
  );
}
