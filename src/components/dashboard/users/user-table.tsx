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
import { listUsers } from "@/lib/actions";
import type { UserRecord } from "@/types";
import { getGravatarUrl } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

export function UserTable() {
  const { toast } = useToast();
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
          title: "Failed to load users",
          description: "Could not retrieve the user list from the server.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  const handleAction = (action: string, userName: string | undefined) => {
    toast({
      title: `${action} Action`,
      description: `Tindakan ${action} untuk ${userName || "pengguna"} tidak diterapkan dalam demo ini.`,
    });
  };

  const getInitials = (displayName: string | undefined) => {
    if (!displayName) return "U";
    const names = displayName.split(" ");
    if (names.length > 1) {
      return names[0][0] + names[1][0];
    }
    return displayName.substring(0, 2).toUpperCase();
  };

  const getRole = (customClaims: { [key: string]: any } | undefined) => {
    if (customClaims?.admin) return "Admin";
    if (customClaims?.editor) return "Editor";
    return "Viewer";
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
            <TableHead>Pengguna</TableHead>
            <TableHead className="hidden sm:table-cell">Peran</TableHead>
            <TableHead className="text-right">Tindakan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.uid}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.photoURL || getGravatarUrl(user.email)} alt={user.displayName} />
                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.displayName || "N/A"}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <Badge variant={getRole(user.customClaims) === "Admin" ? "default" : "secondary"}>
                  {getRole(user.customClaims)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Tindakan Pengguna</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        if (user.uid === currentUser?.uid) {
                          router.push("/dashboard/profile");
                        } else {
                          handleAction("Perbarui", user.displayName);
                        }
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Perbarui Profil</span>
                    </DropdownMenuItem>
                    {user.uid !== currentUser?.uid && (
                      <DropdownMenuItem
                        onClick={() => handleAction("Hapus", user.displayName)}
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Hapus Pengguna</span>
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
