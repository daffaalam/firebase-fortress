"use client";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { authService } from "@/features/auth/services/auth.service";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/icons";
import { ChevronDown, LayoutDashboard, LogOut, Users, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { getGravatarUrl, getInitials } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSignOut = async () => {
    const result = await authService.signOutUser();
    if (result.success) {
      window.localStorage.removeItem("emailForSignIn");
      toast({
        title: t("signOut.success.title"),
        description: t("signOut.success.description"),
      });
      router.push("/login");
    } else {
      toast({
        variant: "destructive",
        title: t("signOut.error.title"),
        description: result.error,
      });
    }
  };

  const getPageTitle = () => {
    if (pathname === "/dashboard") return t("dashboard.title");
    if (pathname.startsWith("/dashboard/users")) return t("userManagement.title");
    if (pathname.startsWith("/dashboard/profile")) return t("profile.title");
    return t("dashboard.title");
  };

  const menuItems = [
    {
      href: "/dashboard",
      label: t("dashboard.title"),
      icon: LayoutDashboard,
      isActive: pathname === "/dashboard",
    },
    {
      href: "/dashboard/users",
      label: t("userManagement.menuLabel"),
      icon: Users,
      isActive: pathname.startsWith("/dashboard/users"),
    },
  ];

  const avatarUrl = user?.photoURL || getGravatarUrl(user?.email);

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
        <SidebarHeader>
          <Link href="/dashboard" className="flex items-center gap-2">
            <Logo className="size-8 text-primary" />
            <span className="text-lg font-semibold">{t("appName")}</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={item.isActive}>
                  <Link href={item.href}>
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-xl font-semibold tracking-tight">{getPageTitle()}</h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={avatarUrl} alt={user?.displayName ?? "User"} />
                  <AvatarFallback>{getInitials(user?.displayName, user?.email)}</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline">{user?.email}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{t("myAccount")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>{t("profile.title")}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t("signOut.button")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
