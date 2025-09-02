import {Card, CardHeader, CardTitle, CardContent} from '@/components/ui/card';
import {getDashboardStats, type DashboardStats} from '@/lib/actions';
import {Users, Activity, ShieldCheck, Sparkles, AlertTriangle} from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

async function StatCard({
  title,
  value,
  Icon,
}: {
  title: string;
  value: string | number;
  Icon: React.ElementType;
}) {
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

  const isServiceAccountMissing = !process.env.FIREBASE_SERVICE_ACCOUNT_KEY && stats.totalUsers === 0;

  const statItems = [
    {title: 'Total Users', value: stats.totalUsers, Icon: Users},
    {title: 'Active Today', value: stats.activeToday, Icon: Activity},
    {title: 'Roles Defined', value: stats.rolesDefined, Icon: ShieldCheck},
    {title: 'AI Suggestions', value: stats.aiSuggestions, Icon: Sparkles},
  ];

  return (
    <main className="flex-1 p-4 sm:p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Welcome back!</h2>
        <p className="text-muted-foreground">
          Here&apos;s a quick overview of your application&apos;s status.
        </p>
      </div>
      {isServiceAccountMissing && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Konfigurasi Diperlukan</AlertTitle>
          <AlertDescription>
            Variabel lingkungan `FIREBASE_SERVICE_ACCOUNT_KEY` tidak diatur.
            Beberapa fitur, seperti menampilkan data dasbor nyata dan daftar pengguna, tidak akan berfungsi dengan benar. Silakan atur variabel lingkungan untuk mengaktifkan fungsionalitas penuh.
          </AlertDescription>
        </Alert>
      )}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statItems.map(({title, value, Icon}) => (
          <StatCard key={title} title={title} value={value} Icon={Icon} />
        ))}
      </div>
    </main>
  );
}
