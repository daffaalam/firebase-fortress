"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { useState, useMemo, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getFirebaseClient } from "@/lib/firebase";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { AuthLayout } from "@/components/layout/auth-layout";

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const formSchema = useMemo(
    () =>
      z.object({
        email: z.string().email({
          message: t("validation.email.required"),
        }),
        password: z.string().min(6, {
          message: t("validation.password.required"),
        }),
      }),
    [t],
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    reValidateMode: "onChange",
  });

  useEffect(() => {
    form.trigger();
  }, [language, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const { auth } = await getFirebaseClient();
      if (!auth) throw new Error("Koneksi ke layanan otentikasi gagal.");
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const actionCodeSettings = {
        url: window.location.origin + "/auth/action",
        handleCodeInApp: true,
      };
      await sendEmailVerification(userCredential.user, actionCodeSettings);
      toast({
        title: t("signup.success.title"),
        description: t("signup.success.description"),
      });
      router.push("/login");
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: t("login.error.title"),
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout title={t("signup.title")} description={t("signup.description")}>
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("login.passwordLabel")}</FormLabel>
                <FormControl>
                  <Input type="password" placeholder={t("login.passwordPlaceholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("signup.createAccount")}
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center text-sm">
        {t("signup.hasAccount")}{" "}
        <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
          {t("login.signIn")}
        </Link>
      </div>
    </AuthLayout>
  );
}
