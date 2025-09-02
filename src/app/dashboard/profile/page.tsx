"use client";

import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User as UserIcon } from "lucide-react";
import { format } from "date-fns";

function ProfileDataItem({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="col-span-2 text-sm">{value || "N/A"}</dd>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();

  const getInitials = (email: string | null | undefined) => {
    if (!email) return "U";
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <main className="flex-1 p-4 sm:p-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-4">
            <UserIcon className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>View and manage your profile information.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? "User"} />
                  <AvatarFallback className="text-3xl">{getInitials(user.email)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{user.displayName || "No Name"}</h2>
                  <div className="flex items-center gap-2">
                    <p className="text-muted-foreground">{user.email}</p>
                    {user.emailVerified && <Badge variant="secondary">Verified</Badge>}
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-lg border p-4">
                <h3 className="mb-4 text-lg font-medium">Account Details</h3>
                <dl className="space-y-4">
                  <ProfileDataItem label="User ID" value={user.uid} />
                  <ProfileDataItem
                    label="Creation Time"
                    value={user.metadata.creationTime ? format(new Date(user.metadata.creationTime), "PPP p") : "N/A"}
                  />
                  <ProfileDataItem
                    label="Last Sign-in"
                    value={user.metadata.lastSignInTime ? format(new Date(user.metadata.lastSignInTime), "PPP p") : "N/A"}
                  />
                  <ProfileDataItem label="Phone Number" value={user.phoneNumber || "N/A"} />
                </dl>
              </div>

              <div className="space-y-4 rounded-lg border p-4">
                <h3 className="mb-4 text-lg font-medium">Providers</h3>
                <div className="space-y-2">
                  {user.providerData.map((provider) => (
                    <div key={provider.providerId} className="flex items-center gap-2 rounded-md bg-muted p-2">
                      <p className="text-sm font-medium">{provider.providerId}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p>Loading profile...</p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
