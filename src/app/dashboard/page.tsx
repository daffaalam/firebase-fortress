import { UserTable } from "@/components/dashboard/user-table";
import { RoleSuggester } from "@/components/dashboard/role-suggester";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Users, Bot } from "lucide-react";

export default function DashboardPage() {
  return (
    <main className="flex-1 p-4 sm:p-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
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
        </div>

        <div className="lg:col-span-1">
          <Card className="shadow-lg">
             <CardHeader>
              <div className="flex items-center gap-3">
                <Bot className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle>AI Role Suggester</CardTitle>
                  <CardDescription>Get AI-powered role suggestions for new users.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <RoleSuggester />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
