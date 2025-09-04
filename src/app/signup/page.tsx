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
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { authService } from "@/features/auth/services/auth.service";

const getSignupFormSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().email({
      message: t("validation.email.required"),
    }),
    password: z.string().min(6, {
      message: t("validation.password.required"),
    }),
  });

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const signupFormSchema = getSignupFormSchema(t);

  const form = useForm<z.infer<typeof signupFormSchema>>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleError = (error: string) => {
    let description = t("error.unknown");
    switch (error) {
      case "auth/email-already-in-use":
        description = t("signup.error.emailAlreadyInUse");
        break;
      case "error.authServiceConnectionFailed":
        description = t("error.authServiceConnectionFailed");
        break;
      default:
        description = t("error.unknown");
    }
    toast({
      variant: "destructive",
      title: t("signup.error.title"),
      description,
    });
  };

  async function onSubmit(values: z.infer<typeof signupFormSchema>) {
    setIsLoading(true);
    const result = await authService.signUpWithEmail(values.email, values.password);
    if (result.success) {
      toast({
        title: t("signup.success.title"),
        description: t("signup.success.description"),
      });
      router.push("/login");
    } else {
      handleError(result.error);
    }
    setIsLoading(false);
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
