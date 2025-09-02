import { RoleSuggester } from "@/components/dashboard/ai-tools/role-suggester";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Bot } from "lucide-react";

export default function AiToolsPage() {
  return (
    <main className="flex-1 p-4 sm:p-6">
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
    </main>
  );
}
