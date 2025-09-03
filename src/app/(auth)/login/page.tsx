
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
} from "firebase/auth";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getFirebaseClient } from "@/lib/firebase";
import { Separator } from "@/components/ui/separator";
import { GoogleIcon, Logo } from "@/components/icons";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({
    message: "Harap masukkan alamat email yang valid.",
  }),
  password: z.string().min(6, {
    message: "Kata sandi harus minimal 6 karakter.",
  }),
});

const passwordlessFormSchema = z.object({
  email: z.string().email({
    message: "Harap masukkan alamat email yang valid.",
  }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isPasswordlessLoading, setIsPasswordlessLoading] = useState(false);
  const [isHandlingLink, setIsHandlingLink] = useState(true);
  const [signInMethod, setSignInMethod] = useState<"emailLink" | "password">("emailLink");

  // Handle the email link sign-in on component mount
  useEffect(() => {
    const handleEmailLinkSignIn = async () => {
      const { auth } = await getFirebaseClient();
      if (!auth) {
        setIsHandlingLink(false);
        return;
      }

      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem("emailForSignIn");
        if (!email) {
          email = window.prompt("Harap berikan email Anda untuk konfirmasi");
        }

        if (email) {
          try {
            await signInWithEmailLink(auth, email, window.location.href);
            window.localStorage.removeItem("emailForSignIn");
            toast({
              title: "Berhasil",
              description: "Anda telah berhasil masuk.",
            });
            router.push("/dashboard");
          } catch (error: any) {
            toast({
              variant: "destructive",
              title: "Gagal Masuk",
              description: "Tautan masuk tidak valid atau telah kedaluwarsa.",
            });
          }
        }
      }
      setIsHandlingLink(false);
    };

    handleEmailLinkSignIn();
  }, [router, toast]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const passwordlessForm = useForm<z.infer<typeof passwordlessFormSchema>>({
    resolver: zodResolver(passwordlessFormSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const { auth } = await getFirebaseClient();
      const userCredential = await signInWithEmailAndPassword(auth!, values.email, values.password);

      if (!userCredential.user.emailVerified) {
        await signOut(auth!);
        toast({
          variant: "destructive",
          title: "Verifikasi Email Diperlukan",
          description: "Silakan verifikasi email Anda sebelum masuk. Periksa kotak masuk Anda untuk tautan verifikasi.",
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Berhasil",
        description: "Anda telah berhasil masuk.",
      });
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Terjadi kesalahan.",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function onPasswordlessSubmit(values: z.infer<typeof passwordlessFormSchema>) {
    setIsPasswordlessLoading(true);
    try {
      const { auth } = await getFirebaseClient();
      const actionCodeSettings = {
        url: window.location.origin + "/login",
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth!, values.email, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", values.email);
      toast({
        title: "Tautan Masuk Terkirim",
        description: `Tautan masuk telah dikirim ke ${values.email}. Periksa kotak masuk Anda.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Terjadi kesalahan.",
        description: error.message,
      });
    } finally {
      setIsPasswordlessLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    try {
      const { auth, googleProvider } = await getFirebaseClient();
      await signInWithPopup(auth!, googleProvider!);
      toast({
        title: "Berhasil",
        description: "Anda telah berhasil masuk dengan Google.",
      });
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Terjadi kesalahan.",
        description: error.message,
      });
    } finally {
      setIsGoogleLoading(false);
    }
  }

  if (isHandlingLink) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Memverifikasi tautan masuk...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Firebase Fortress</h1>
          </div>
          <CardTitle className="text-3xl font-bold">Selamat Datang Kembali</CardTitle>
          <CardDescription>
            {signInMethod === "emailLink"
              ? "Masukkan email Anda untuk menerima tautan masuk."
              : "Masukkan kredensial Anda untuk mengakses akun."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {signInMethod === "emailLink" ? (
            <Form {...passwordlessForm}>
              <form onSubmit={passwordlessForm.handleSubmit(onPasswordlessSubmit)} className="space-y-4">
                <FormField
                  control={passwordlessForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="nama@contoh.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isPasswordlessLoading || isGoogleLoading || isLoading}
                >
                  {isPasswordlessLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Kirim Tautan Masuk
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="nama@contoh.com" {...field} />
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
                      <div className="flex items-center justify-between">
                        <FormLabel>Kata Sandi</FormLabel>
                        <Link
                          href="/forgot-password"
                          className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
                        >
                          Lupa Kata Sandi?
                        </Link>
                      </div>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Masuk
                </Button>
              </form>
            </Form>
          )}

          <div className="mt-4 text-center text-sm">
            <Button variant="link" className="p-0" onClick={() => setSignInMethod(signInMethod === 'password' ? 'emailLink' : 'password')}>
              {signInMethod === 'password' ? 'Masuk dengan Tautan Email' : 'Masuk dengan Kata Sandi'}
            </Button>
          </div>

          <div className="relative my-6">
            <Separator />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-sm text-muted-foreground">
              ATAU
            </div>
          </div>

          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading || isPasswordlessLoading}
            >
              {isGoogleLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <GoogleIcon className="mr-2 h-5 w-5" />
              )}
              Google
            </Button>
          </div>

          <div className="mt-6 text-center text-sm">
            Belum punya akun?{" "}
            <Link href="/signup" className="font-semibold text-primary underline-offset-4 hover:underline">
              Daftar
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
