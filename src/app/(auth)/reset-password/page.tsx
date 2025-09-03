
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { Suspense, useEffect, useState, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getFirebaseClient } from "@/lib/firebase";
import { Logo } from "@/components/icons";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { LanguageSwitcher } from "@/components/ui/select";


function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"verifying" | "valid" | "error">("verifying");
  const [errorMessage, setErrorMessage] = useState("");
  const [actionCode, setActionCode] = useState<string | null>(null);

  const formSchema = useMemo(() => z
    .object({
      password: z.string().min(6, {
        message: t("validation.password.required"),
      }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validation.password.mismatch"),
      path: ["confirmPassword"],
    }), [t]);

  useEffect(() => {
    const code = searchParams.get("oobCode");

    if (!code) {
      setErrorMessage(t("resetPassword.error.invalidLink"));
      setStatus("error");
      return;
    }

    setActionCode(code);

    const handleVerifyCode = async () => {
      try {
        const { auth } = await getFirebaseClient();
        await verifyPasswordResetCode(auth!, code);
        setStatus("valid");
      } catch (error: any) {
        let message = t("resetPassword.error.genericVerification");
        if (error.code === "auth/invalid-action-code") {
          message = t("resetPassword.error.verificationFailed.description");
        }
        setErrorMessage(message);
        setStatus("error");
        toast({
          variant: "destructive",
          title: t("resetPassword.error.verificationFailed.title"),
          description: message,
        });
      }
    };

    handleVerifyCode();
  }, [searchParams, toast, t]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    reValidateMode: "onChange",
  });

  useEffect(() => {
    form.trigger();
  }, [language, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!actionCode) return;

    setIsLoading(true);
    try {
      const { auth } = await getFirebaseClient();
      await confirmPasswordReset(auth!, actionCode, values.password);
      toast({
        title: t("resetPassword.success.title"),
        description: t("resetPassword.success.description"),
      });
      router.push("/login");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("login.error.title"),
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const renderContent = () => {
    switch (status) {
      case "verifying":
        return (
          <>
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="text-muted-foreground">{t("resetPassword.verifying")}</p>
          </>
        );
      case "error":
        return (
          <>
            <XCircle className="h-16 w-16 text-destructive" />
            <p className="text-center text-destructive">{errorMessage}</p>
            <Button asChild className="w-full" variant="outline">
              <Link href="/login">{t("resetPassword.backToLogin")}</Link>
            </Button>
          </>
        );
      case "valid":
        return (
          <>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("resetPassword.newPasswordLabel")}</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("resetPassword.confirmPasswordLabel")}</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("resetPassword.resetPasswordButton")}
                </Button>
              </form>
            </Form>
          </>
        );
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <LanguageSwitcher />
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">{t("appName")}</h1>
          </div>
          <CardTitle className="text-3xl font-bold">{t("resetPassword.title")}</CardTitle>
          <CardDescription>
            {status === "valid" && t("resetPassword.description.form")}
            {status === "verifying" && t("resetPassword.description.verifying")}
            {status === "error" && t("resetPassword.description.error")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-6">{renderContent()}</CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
