"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { listUsers } from "@/lib/actions";
import type { UserRecord } from "@/types";

export function UserTable() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);

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
            <TableHead>User</TableHead>
            <TableHead className="hidden sm:table-cell">Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.uid}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName} />
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
