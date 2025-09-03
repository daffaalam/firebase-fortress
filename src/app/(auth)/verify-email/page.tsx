
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { applyActionCode } from "firebase/auth";
import Link from "next/link";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getFirebaseClient } from "@/lib/firebase";
import { Logo } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { LanguageSwitcher } from "@/components/ui/select";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const actionCode = searchParams.get("oobCode");

    if (!actionCode) {
      setErrorMessage(t("verifyEmail.error.noCode"));
      setStatus("error");
      return;
    }

    const handleVerifyEmail = async () => {
      try {
        const { auth } = await getFirebaseClient();
        await applyActionCode(auth, actionCode);
        setStatus("success");
        toast({
          title: t("verifyEmail.successToast.title"),
          description: t("verifyEmail.successToast.description"),
        });
      } catch (error: any) {
        let message = t("verifyEmail.error.failed");
        if (error.code === "auth/invalid-action-code") {
          message = t("verifyEmail.error.invalidCode");
        }
        setErrorMessage(message);
        setStatus("error");
        toast({
          variant: "destructive",
          title: t("verifyEmail.error.toast.title"),
          description: message,
        });
      }
    };

    handleVerifyEmail();
  }, [searchParams, router, toast, t]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <LanguageSwitcher />
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">{t("appName")}</h1>
          </div>
          <CardTitle className="text-3xl font-bold">{t("verifyEmail.title")}</CardTitle>
          <CardDescription>
            {status === "verifying" && t("verifyEmail.description.verifying")}
            {status === "success" && t("verifyEmail.description.success")}
            {status === "error" && t("verifyEmail.description.error")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-6">
          {status === "verifying" && (
            <>
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <p className="text-muted-foreground">{t("verifyEmail.waitMessage")}</p>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p className="text-muted-foreground">{t("verifyEmail.successMessage")}</p>
              <Button asChild className="w-full">
                <Link href="/login">{t("verifyEmail.continueToLogin")}</Link>
              </Button>
            </>
          )}
          {status === "error" && (
            <>
              <XCircle className="h-16 w-16 text-destructive" />
              <p className="text-center text-destructive">{errorMessage}</p>
              <Button asChild className="w-full" variant="outline">
                <Link href="/login">{t("verifyEmail.backToLogin")}</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
