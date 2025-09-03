"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { useState, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getFirebaseClient } from "@/lib/firebase";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { AuthLayout } from "@/components/layout/auth-layout";

const forgotPasswordSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
    setIsLoading(true);
    try {
      const { auth } = await getFirebaseClient();
      if (!auth) throw new Error("Koneksi ke layanan otentikasi gagal.");
      const actionCodeSettings = {
        url: window.location.origin + "/auth/action",
        handleCodeInApp: true,
      };
      await sendPasswordResetEmail(auth, values.email, actionCodeSettings);
      toast({
        title: t("forgotPassword.success.title"),
        description: t("forgotPassword.success.description", { email: values.email }),
      });
      // Don't redirect, just show success message
    } catch (error: unknown) {
      let description = "An unexpected error occurred.";
      if (error instanceof Error) {
        description = error.message;
      }
      toast({
        variant: "destructive",
        title: t("forgotPassword.error.title"),
        description,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout title={t("forgotPassword.title")} description={t("forgotPassword.description")}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("login.emailLabel")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("login.emailPlaceholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("forgotPassword.sendResetLink")}
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center text-sm">
        {t("forgotPassword.rememberPassword")}{" "}
        <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
          {t("login.signIn")}
        </Link>
      </div>
    </AuthLayout>
  );
}
