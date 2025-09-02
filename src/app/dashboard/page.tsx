import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Activity, ShieldCheck, Sparkles } from "lucide-react";

export default function DashboardPage() {
  const stats = [
    { title: "Total Users", value: "125", Icon: Users },
    { title: "Active Today", value: "32", Icon: Activity },
    { title: "Roles Defined", value: "3", Icon: ShieldCheck },
    { title: "AI Suggestions", value: "18", Icon: Sparkles },
  ];

  return (
    <main className="flex-1 p-4 sm:p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Welcome back!</h2>
        <p className="text-muted-foreground">
          Here's a quick overview of your application's status.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ title, value, Icon }) => (
          <Card key={title} className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
