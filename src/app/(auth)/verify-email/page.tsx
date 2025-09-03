
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

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const actionCode = searchParams.get("oobCode");

    if (!actionCode) {
      setErrorMessage("Kode verifikasi tidak ditemukan. Silakan coba lagi.");
      setStatus("error");
      return;
    }

    const handleVerifyEmail = async () => {
      try {
        const { auth } = await getFirebaseClient();
        await applyActionCode(auth, actionCode);
        setStatus("success");
        toast({
          title: "Email Terverifikasi!",
          description: "Email Anda telah berhasil diverifikasi. Anda sekarang dapat masuk.",
        });
      } catch (error: any) {
        let message = "Gagal memverifikasi email.";
        if (error.code === "auth/invalid-action-code") {
          message = "Tautan verifikasi tidak valid atau telah kedaluwarsa. Silakan minta yang baru.";
        }
        setErrorMessage(message);
        setStatus("error");
        toast({
          variant: "destructive",
          title: "Verifikasi Gagal",
          description: message,
        });
      }
    };

    handleVerifyEmail();
  }, [searchParams, router, toast]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Firebase Fortress</h1>
          </div>
          <CardTitle className="text-3xl font-bold">Verifikasi Email</CardTitle>
          <CardDescription>
            {status === "verifying" && "Kami sedang memverifikasi alamat email Anda..."}
            {status === "success" && "Email Anda telah berhasil diverifikasi!"}
            {status === "error" && "Terjadi kesalahan saat verifikasi."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-6">
          {status === "verifying" && (
            <>
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <p className="text-muted-foreground">Mohon tunggu sebentar.</p>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p className="text-muted-foreground">Anda sekarang dapat masuk ke akun Anda.</p>
              <Button asChild className="w-full">
                <Link href="/login">Lanjutkan ke Halaman Masuk</Link>
              </Button>
            </>
          )}
          {status === "error" && (
            <>
              <XCircle className="h-16 w-16 text-destructive" />
              <p className="text-center text-destructive">{errorMessage}</p>
              <Button asChild className="w-full" variant="outline">
                <Link href="/login">Kembali ke Halaman Masuk</Link>
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
