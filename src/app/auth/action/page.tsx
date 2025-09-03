"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState, useMemo } from "react";
import {
  applyActionCode,
  confirmPasswordReset,
  isSignInWithEmailLink,
  signInWithEmailLink,
  verifyPasswordResetCode,
} from "firebase/auth";
import Link from "next/link";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { getFirebaseClient } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ActionLayout } from "@/components/layout/auth-layout";

// --- ResetPassword Component ---
function ResetPassword({ actionCode }: { actionCode: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"verifying" | "valid" | "error">("verifying");
  const [errorMessage, setErrorMessage] = useState("");

  const formSchema = useMemo(
    () =>
      z
        .object({
          password: z.string().min(6, {
            message: t("validation.password.required"),
          }),
          confirmPassword: z.string(),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: t("validation.password.mismatch"),
          path: ["confirmPassword"],
        }),
    [t],
  );

  useEffect(() => {
    const handleVerifyCode = async () => {
      try {
        const { auth } = await getFirebaseClient();
        if (!auth) throw new Error("Koneksi ke layanan otentikasi gagal.");
        await verifyPasswordResetCode(auth, actionCode);
        setStatus("valid");
      } catch (error: any) {
        let message = t("resetPassword.error.genericVerification");
        if (error.code === "auth/invalid-action-code") {
          message = t("resetPassword.error.verificationFailed.description");
        }
        setErrorMessage(message);
        setStatus("error");
      }
    };
    handleVerifyCode();
  }, [actionCode, t]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: "", confirmPassword: "" },
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
      await confirmPasswordReset(auth, actionCode, values.password);
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

  if (status === "verifying") {
    return <Loader2 className="h-16 w-16 animate-spin text-primary" />;
  }

  if (status === "error") {
    return (
      <>
        <XCircle className="h-16 w-16 text-destructive" />
        <p className="text-center text-destructive">{errorMessage}</p>
        <Button asChild className="w-full" variant="outline">
          <Link href="/login">{t("resetPassword.backToLogin")}</Link>
        </Button>
      </>
    );
  }

  return (
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
  );
}

// --- VerifyEmail Component ---
function VerifyEmail({ actionCode, mode }: { actionCode: string; mode: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMessage, setErrorMessage] = useState("");

  const isEmailChange = mode === "recoverEmail" || mode === "verifyAndChangeEmail";

  useEffect(() => {
    const handleVerify = async () => {
      try {
        const { auth } = await getFirebaseClient();
        if (!auth) throw new Error("Koneksi ke layanan otentikasi gagal.");
        await applyActionCode(auth, actionCode);
        setStatus("success");
        toast({
          title: isEmailChange ? t("verifyEmailChange.successToast.title") : t("verifyEmail.successToast.title"),
          description: isEmailChange
            ? t("verifyEmailChange.successToast.description")
            : t("verifyEmail.successToast.description"),
        });
      } catch (error: any) {
        let message = isEmailChange ? t("verifyEmailChange.error.failed") : t("verifyEmail.error.failed");
        if (error.code === "auth/invalid-action-code") {
          message = isEmailChange ? t("verifyEmailChange.error.invalidCode") : t("verifyEmail.error.invalidCode");
        }
        setErrorMessage(message);
        setStatus("error");
      }
    };
    handleVerify();
  }, [actionCode, toast, t, isEmailChange, router]);

  if (status === "verifying") {
    return (
      <>
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="text-muted-foreground">
          {isEmailChange ? t("verifyEmailChange.waitMessage") : t("verifyEmail.waitMessage")}
        </p>
      </>
    );
  }

  if (status === "success") {
    return (
      <>
        <CheckCircle className="h-16 w-16 text-green-500" />
        <p className="text-muted-foreground">
          {isEmailChange ? t("verifyEmailChange.successMessage") : t("verifyEmail.successMessage")}
        </p>
        <Button asChild className="w-full">
          <Link href={isEmailChange ? "/dashboard/profile" : "/login"}>
            {isEmailChange ? t("verifyEmailChange.backToProfile") : t("verifyEmail.continueToLogin")}
          </Link>
        </Button>
      </>
    );
  }

  return (
    <>
      <XCircle className="h-16 w-16 text-destructive" />
      <p className="text-center text-destructive">{errorMessage}</p>
      <Button asChild className="w-full" variant="outline">
        <Link href={isEmailChange ? "/dashboard/profile" : "/login"}>
          {isEmailChange ? t("verifyEmailChange.backToProfile") : t("verifyEmail.backToLogin")}
        </Link>
      </Button>
    </>
  );
}

// --- SignIn Component ---
function SignIn() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    const handleEmailLinkSignIn = async () => {
      const { auth } = await getFirebaseClient();
      if (!auth) {
        toast({
          variant: "destructive",
          title: t("login.error.title"),
          description: "Koneksi ke layanan otentikasi gagal.",
        });
        router.push("/login");
        return;
      }

      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem("emailForSignIn");
        if (!email) {
          email = window.prompt(t("login.emailPlaceholder"));
        }

        if (email) {
          try {
            await signInWithEmailLink(auth, email, window.location.href);
            window.localStorage.removeItem("emailForSignIn");
            toast({
              title: t("login.success.title"),
              description: t("login.success.description"),
            });
            router.push("/dashboard");
          } catch (error: any) {
            toast({
              variant: "destructive",
              title: t("login.error.title"),
              description: t("login.error.invalidLink"),
            });
            router.push("/login");
          }
        } else {
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
    };

    handleEmailLinkSignIn();
  }, [router, toast, t]);

  return (
    <>
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <p className="text-muted-foreground">{t("login.verifyingLink")}</p>
    </>
  );
}

function ActionHandler() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const mode = searchParams.get("mode");
  const actionCode = searchParams.get("oobCode");

  const getTitle = () => {
    switch (mode) {
      case "resetPassword":
        return t("resetPassword.title");
      case "verifyEmail":
        return t("verifyEmail.title");
      case "recoverEmail":
      case "verifyAndChangeEmail":
        return t("verifyEmailChange.title");
      case "signIn":
        return t("login.title");
      default:
        return t("appName");
    }
  };

  const getDescription = () => {
    switch (mode) {
      case "resetPassword":
        return t("resetPassword.description.form");
      case "verifyEmail":
        return t("verifyEmail.description.verifying");
      case "recoverEmail":
      case "verifyAndChangeEmail":
        return t("verifyEmailChange.description.verifying");
      case "signIn":
        return t("login.description.emailLink");
      default:
        return "";
    }
  };

  const renderContent = () => {
    if (!mode || !actionCode) {
      // This could be an email link sign-in, which doesn't have an actionCode in the same way.
      if (mode === "signIn" || (typeof window !== "undefined" && isSignInWithEmailLink(window.location.href))) {
        return <SignIn />;
      }
      return <p className="text-destructive text-center">{t("resetPassword.error.invalidLink")}</p>;
    }

    switch (mode) {
      case "resetPassword":
        return <ResetPassword actionCode={actionCode} />;
      case "verifyEmail":
      case "recoverEmail":
      case "verifyAndChangeEmail":
        return <VerifyEmail actionCode={actionCode} mode={mode} />;
      default:
        return <p className="text-destructive text-center">Tindakan tidak didukung.</p>;
    }
  };

  return (
    <ActionLayout title={getTitle()} description={getDescription()}>
      {renderContent()}
    </ActionLayout>
  );
}

export default function ActionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <ActionHandler />
    </Suspense>
  );
}
