"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { GoogleIcon } from "@/components/icons";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { authService } from "@/features/auth/services/auth.service";

const getPasswordFormSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().email({ message: t("validation.email.required") }),
    password: z.string().min(6, { message: t("validation.password.required") }),
  });

const getPasswordlessFormSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().email({ message: t("validation.email.required") }),
  });

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isPasswordlessLoading, setIsPasswordlessLoading] = useState(false);
  const [signInMethod, setSignInMethod] = useState<"emailLink" | "password">("emailLink");

  const passwordFormSchema = getPasswordFormSchema(t);
  const passwordlessFormSchema = getPasswordlessFormSchema(t);

  const form = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
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

  const handleError = (error: string) => {
    let description = t("error.unknown");
    switch (error) {
      case "auth/invalid-credential":
        description = t("login.error.invalidCredential");
        break;
      case "auth/user-disabled":
        description = t("login.error.userDisabled");
        break;
      case "auth/email-not-verified":
        description = t("login.error.emailVerification");
        break;
      case "auth/popup-closed-by-user":
        description = t("login.error.popupClosed");
        break;
      case "auth/account-exists-with-different-credential":
        description = t("login.error.accountExistsWithDifferentCredential");
        break;
      case "error.authServiceConnectionFailed":
        description = t("error.authServiceConnectionFailed");
        break;
      case "error.googleSignInNotAvailable":
        description = t("error.googleSignInNotAvailable");
        break;
      default:
        description = t("error.unknown");
    }
    toast({
      variant: "destructive",
      title: t("login.error.title"),
      description,
    });
  };

  async function onSubmit(values: z.infer<typeof passwordFormSchema>) {
    setIsLoading(true);
    const result = await authService.signInWithEmail(values.email, values.password);
    if (result.success) {
      toast({
        title: t("login.success.title"),
        description: t("login.success.description"),
      });
      router.push("/dashboard");
    } else {
      handleError(result.error);
    }
    setIsLoading(false);
  }

  async function onPasswordlessSubmit(values: z.infer<typeof passwordlessFormSchema>) {
    setIsPasswordlessLoading(true);
    const result = await authService.sendPasswordlessLink(values.email);
    if (result.success) {
      toast({
        title: t("login.success.linkSent.title"),
        description: t("login.success.linkSent.description", { email: values.email }),
      });
    } else {
      handleError(result.error);
    }
    setIsPasswordlessLoading(false);
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    const result = await authService.signInWithGoogle();
    if (result.success) {
      toast({
        title: t("login.success.title"),
        description: t("login.success.google"),
      });
      router.push("/dashboard");
    } else {
      handleError(result.error);
    }
    setIsGoogleLoading(false);
  }

  const title = t("login.title");
  const description = signInMethod === "emailLink" ? t("login.description.emailLink") : t("login.description.password");

  return (
    <AuthLayout title={title} description={description}>
      {signInMethod === "emailLink" ? (
        <Form {...passwordlessForm} key="emailLink">
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
            <Button type="submit" className="w-full" disabled={isPasswordlessLoading || isGoogleLoading || isLoading}>
              {isPasswordlessLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("login.sendSignInLink")}
            </Button>
          </form>
        </Form>
      ) : (
        <Form {...form} key="emailPassword">
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
        <Button
          variant="link"
          className="p-0"
          onClick={() => setSignInMethod(signInMethod === "password" ? "emailLink" : "password")}
        >
          {signInMethod === "password" ? t("login.switch.toEmailLink") : t("login.switch.toPassword")}
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
          {t("login.signInWithGoogle")}
        </Button>
      </div>

      <div className="mt-6 text-center text-sm">
        {t("login.noAccount")}{" "}
        <Link href="/signup" className="font-semibold text-primary underline-offset-4 hover:underline">
          {t("login.signUp")}
        </Link>
      </div>
    </AuthLayout>
  );
}
