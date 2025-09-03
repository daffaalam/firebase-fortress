
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { Suspense, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getFirebaseClient } from "@/lib/firebase";
import { Logo } from "@/components/icons";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

const formSchema = z
  .object({
    password: z.string().min(6, {
      message: "Kata sandi harus minimal 6 karakter.",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Kata sandi tidak cocok.",
    path: ["confirmPassword"],
  });

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"verifying" | "valid" | "error">("verifying");
  const [errorMessage, setErrorMessage] = useState("");
  const [actionCode, setActionCode] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("oobCode");

    if (!code) {
      setErrorMessage("Tautan pengaturan ulang kata sandi tidak valid atau hilang.");
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
        let message = "Gagal memverifikasi tautan pengaturan ulang.";
        if (error.code === "auth/invalid-action-code") {
          message = "Tautan pengaturan ulang tidak valid atau telah kedaluwarsa. Silakan minta yang baru.";
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

    handleVerifyCode();
  }, [searchParams, toast]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!actionCode) return;

    setIsLoading(true);
    try {
      const { auth } = await getFirebaseClient();
      await confirmPasswordReset(auth!, actionCode, values.password);
      toast({
        title: "Kata Sandi Berhasil Direset",
        description: "Anda sekarang dapat masuk dengan kata sandi baru Anda.",
      });
      router.push("/login");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
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
            <p className="text-muted-foreground">Memverifikasi tautan...</p>
          </>
        );
      case "error":
        return (
          <>
            <XCircle className="h-16 w-16 text-destructive" />
            <p className="text-center text-destructive">{errorMessage}</p>
            <Button asChild className="w-full" variant="outline">
              <Link href="/login">Kembali ke Halaman Masuk</Link>
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
                      <FormLabel>Kata Sandi Baru</FormLabel>
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
                      <FormLabel>Konfirmasi Kata Sandi Baru</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Atur Ulang Kata Sandi
                </Button>
              </form>
            </Form>
          </>
        );
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Firebase Fortress</h1>
          </div>
          <CardTitle className="text-3xl font-bold">Atur Ulang Kata Sandi Anda</CardTitle>
          <CardDescription>
            {status === "valid" && "Masukkan kata sandi baru Anda di bawah ini."}
            {status === "verifying" && "Harap tunggu sementara kami memvalidasi permintaan Anda."}
            {status === "error" && "Terjadi kesalahan."}
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
