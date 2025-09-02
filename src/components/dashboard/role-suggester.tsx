"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getRoleSuggestions } from "@/lib/actions";
import { type SuggestUserRolesOutput } from "@/ai/flows/suggest-user-roles";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";

const formSchema = z.object({
  userProfile: z.string().min(10, {
    message: "User profile must be at least 10 characters.",
  }),
  userActivity: z.string().min(10, {
    message: "User activity must be at least 10 characters.",
  }),
});

export function RoleSuggester() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SuggestUserRolesOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userProfile: "",
      userActivity: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const suggestion = await getRoleSuggestions(values);
      setResult(suggestion);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "AI Suggestion Failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="userProfile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User Profile</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., 'Jane Doe, a senior software engineer in the core platform team, responsible for database management.'"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="userActivity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User Activity</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., 'Frequently accesses production logs, pushes code to critical repositories, and reviews pull requests.'"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Get Suggestions
          </Button>
        </form>
      </Form>

      {result && (
        <Card className="bg-background/50">
          <CardHeader>
            <CardTitle className="text-lg">AI Suggestions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground">Suggested Roles</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {result.suggestedRoles.map((role) => (
                  <Badge key={role} variant="default">{role}</Badge>
                ))}
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold text-foreground">Justification</h3>
              <p className="mt-2 text-sm text-muted-foreground">{result.justification}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
