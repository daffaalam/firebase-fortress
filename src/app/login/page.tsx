
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
  sendSignInLinkToEmail,
} from "firebase/auth";
import { useEffect, useState, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getFirebaseClient } from "@/lib/firebase";
import { Separator } from "@/components/ui/separator";
import { GoogleIcon, Logo } from "@/components/icons";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { LanguageSwitcher } from "@/components/ui/select";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isPasswordlessLoading, setIsPasswordlessLoading] = useState(false);
  const [signInMethod, setSignInMethod] = useState<"emailLink" | "password">("emailLink");

  const formSchema = useMemo(() => z.object({
    email: z.string().email({
      message: t("validation.email.required"),
    }),
    password: z.string().min(6, {
      message: t("validation.password.required"),
    }),
  }), [t]);
  
  const passwordlessFormSchema = useMemo(() => z.object({
    email: z.string().email({
      message: t("validation.email.required"),
    }),
  }), [t]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    reValidateMode: "onChange",
  });

  const passwordlessForm = useForm<z.infer<typeof passwordlessFormSchema>>({
    resolver: zodResolver(passwordlessFormSchema),
    defaultValues: {
      email: "",
    },
    reValidateMode: "onChange",
  });

  useEffect(() => {
    form.trigger();
    passwordlessForm.trigger();
  }, [language, form, passwordlessForm]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const { auth } = await getFirebaseClient();
      const userCredential = await signInWithEmailAndPassword(auth!, values.email, values.password);

      if (!userCredential.user.emailVerified) {
        await signOut(auth!);
        toast({
          variant: "destructive",
          title: t("login.error.emailVerification.title"),
          description: t("login.error.emailVerification"),
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: t("login.success.title"),
        description: t("login.success.description"),
      });
      router.push("/dashboard");
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

  async function onPasswordlessSubmit(values: z.infer<typeof passwordlessFormSchema>) {
    setIsPasswordlessLoading(true);
    try {
      const { auth } = await getFirebaseClient();
      const actionCodeSettings = {
        url: window.location.origin + "/auth/action",
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth!, values.email, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", values.email);
      toast({
        title: t("login.success.linkSent.title"),
        description: t("login.success.linkSent.description", { email: values.email }),
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("login.error.title"),
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
        title: t("login.success.title"),
        description: t("login.success.google"),
      });
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("login.error.title"),
        description: error.message,
      });
    } finally {
      setIsGoogleLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <LanguageSwitcher />
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">{t("appName")}</h1>
          </div>
          <CardTitle className="text-3xl font-bold">{t("login.title")}</CardTitle>
          <CardDescription>
            {signInMethod === "emailLink"
              ? t("login.description.emailLink")
              : t("login.description.password")}
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
                      <FormLabel>{t("login.emailLabel")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("login.emailPlaceholder")} {...field} />
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
                  {t("login.sendSignInLink")}
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
                      <div className="flex items-center justify-between">
                        <FormLabel>{t("login.passwordLabel")}</FormLabel>
                        <Link
                          href="/forgot-password"
                          className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
                        >
                          {t("login.forgotPassword")}
                        </Link>
                      </div>
                      <FormControl>
                        <Input type="password" placeholder={t("login.passwordPlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("login.signIn")}
                </Button>
              </form>
            </Form>
          )}

          <div className="mt-4 text-center text-sm">
            <Button variant="link" className="p-0" onClick={() => setSignInMethod(signInMethod === 'password' ? 'emailLink' : 'password')}>
              {signInMethod === 'password' ? t("login.switch.toEmailLink") : t("login.switch.toPassword")}
            </Button>
          </div>

          <div className="relative my-6">
            <Separator />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-sm text-muted-foreground">
              {t("login.orSeparator")}
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
            {t("login.noAccount")}{" "}
            <Link href="/signup" className="font-semibold text-primary underline-offset-4 hover:underline">
              {t("login.signUp")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
