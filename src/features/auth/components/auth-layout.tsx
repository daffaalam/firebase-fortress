"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/ui/select";
import { Logo } from "@/components/icons";
import { useLanguage } from "@/hooks/use-language";

interface AuthLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <LanguageSwitcher />
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">{t("appName")}</h1>
          </div>
          <CardTitle className="text-3xl font-bold">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}

interface ActionLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export function ActionLayout({ children, title, description }: ActionLayoutProps) {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <LanguageSwitcher />
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">{t("appName")}</h1>
          </div>
          <CardTitle className="text-3xl font-bold">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-6">{children}</CardContent>
      </Card>
    </div>
  );
}
