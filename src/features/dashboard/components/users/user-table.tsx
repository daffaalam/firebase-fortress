"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { listUsers } from "@/features/auth/services/user.service";
import type { UserRecord } from "@/features/auth/models/user.model";
import { getGravatarUrl, getInitials } from "@/lib/utils";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/hooks/use-language";

export function UserTable() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const userList = await listUsers();
        setUsers(userList);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast({
          variant: "destructive",
          title: t("userManagement.error.fetchUsers.title"),
          description: t("userManagement.error.fetchUsers.description"),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [toast, t]);

  const handleAction = (action: string, userName: string | undefined) => {
    toast({
      title: t("userManagement.actions.inDemo.title", { action: action }),
      description: t("userManagement.actions.inDemo.description", {
        action: action.toLowerCase(),
        user: userName || t("user"),
      }),
    });
  };

  const getRole = (customClaims: { [key: string]: any } | undefined) => {
    if (customClaims?.admin) return t("userManagement.roles.admin");
    if (customClaims?.editor) return t("userManagement.roles.editor");
    return t("userManagement.roles.viewer");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("userManagement.table.headers.user")}</TableHead>
            <TableHead className="hidden sm:table-cell">{t("userManagement.table.headers.role")}</TableHead>
            <TableHead className="text-right">{t("userManagement.table.headers.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.uid}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.photoURL || getGravatarUrl(user.email)} alt={user.displayName} />
                    <AvatarFallback>{getInitials(user.displayName, user.email)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.displayName || "N/A"}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <Badge variant={getRole(user.customClaims) === t("userManagement.roles.admin") ? "default" : "secondary"}>
                  {getRole(user.customClaims)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">{t("userManagement.table.userActions")}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        if (user.uid === currentUser?.uid) {
                          router.push("/dashboard/profile");
                        } else {
                          handleAction(t("userManagement.actions.update"), user.displayName);
                        }
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      <span>{t("userManagement.actions.updateProfile")}</span>
                    </DropdownMenuItem>
                    {user.uid !== currentUser?.uid && (
                      <DropdownMenuItem
                        onClick={() => handleAction(t("userManagement.actions.delete"), user.displayName)}
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>{t("userManagement.actions.deleteUser")}</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
