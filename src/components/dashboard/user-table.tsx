"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const users = [
  { id: "1", name: "Alice Johnson", email: "alice.j@example.com", role: "Admin", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d" },
  { id: "2", name: "Bob Smith", email: "bob.s@example.com", role: "Editor", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026705d" },
  { id: "3", name: "Charlie Brown", email: "charlie.b@example.com", role: "Viewer", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026706d" },
  { id: "4", name: "Diana Prince", email: "diana.p@example.com", role: "Editor", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026707d" },
  { id: "5", name: "Ethan Hunt", email: "ethan.h@example.com", role: "Viewer", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026708d" },
];

export function UserTable() {
    const { toast } = useToast();

    const handleAction = (action: string, userName: string) => {
        toast({
            title: `${action} Action`,
            description: `${action} action for ${userName} is not implemented in this demo.`,
        })
    }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead className="hidden sm:table-cell">Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>{user.role}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">User Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleAction('Update', user.name)}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Update Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAction('Delete', user.name)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete User</span>
                    </DropdownMenuItem>
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
