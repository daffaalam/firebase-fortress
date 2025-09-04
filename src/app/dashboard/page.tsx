import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getDashboardStats } from "@/features/dashboard/services/dashboard.service";
import { Users, Activity, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLanguage } from "@/hooks/use-language";
import { Locales } from "@/locales/locales";

async function StatCard({ title, value, Icon }: { title: string; value: string | number; Icon: React.ElementType }) {
  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const t = Locales.get();

  const isServiceAccountMissing = !process.env.FIREBASE_SERVICE_ACCOUNT_KEY && stats.totalUsers === 0;

  const statItems = [
    { title: t("dashboard.totalUsers"), value: stats.totalUsers, Icon: Users },
    { title: t("dashboard.activeToday"), value: stats.activeToday, Icon: Activity },
  ];

  return (
    <main className="flex-1 p-4 sm:p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">{t("dashboard.welcome")}</h2>
        <p className="text-muted-foreground">{t("dashboard.description")}</p>
      </div>
      {isServiceAccountMissing && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t("dashboard.serviceAccountMissing.title")}</AlertTitle>
          <AlertDescription>{t("dashboard.serviceAccountMissing.description")}</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statItems.map(({ title, value, Icon }) => (
          <StatCard key={title} title={title} value={value} Icon={Icon} />
        ))}
      </div>
    </main>
  );
}
