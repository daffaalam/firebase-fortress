"use client";

import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User as UserIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { getGravatarUrl } from "@/lib/utils";

function ProfileDataItem({ label, value }: { label: string; value: string | undefined | null }) {
  return (
    <div className="grid grid-cols-3 items-center gap-4">
      <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
      <div className="col-span-2">
        <Input type="text" readOnly disabled value={value || "N/A"} />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const getInitials = (email: string | null | undefined) => {
    if (!email) return "U";
    return email.substring(0, 2).toUpperCase();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // This is a placeholder for the update logic.
    // In a real application, you would call a server action
    // or an API endpoint to update the user's profile in Firebase.
    toast({
      title: "Fungsi Belum Diimplementasikan",
      description: "Kemampuan untuk memperbarui profil belum diimplementasikan dalam demo ini.",
    });
  };

  if (!user) {
    return (
      <main className="flex-1 p-4 sm:p-6">
        <p>Memuat profil...</p>
      </main>
    );
  }

  const avatarUrl = user.photoURL || getGravatarUrl(user.email);

  return (
    <main className="flex-1 p-4 sm:p-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-4">
            <UserIcon className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Profil Pengguna</CardTitle>
              <CardDescription>Lihat dan kelola informasi profil Anda.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="mb-4 text-lg font-medium">Informasi yang Dapat Diedit</h3>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="photoURL" className="text-sm font-medium text-muted-foreground">
                  Avatar
                </Label>
                <div className="col-span-2 flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarUrl} alt={user.displayName ?? "Pengguna"} />
                    <AvatarFallback className="text-3xl">{getInitials(user.email)}</AvatarFallback>
                  </Avatar>
                  <Input id="photoURL" defaultValue={user.photoURL || ""} placeholder="URL ke gambar" />
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="displayName" className="text-sm font-medium text-muted-foreground">
                  Nama Tampilan
                </Label>
                <div className="col-span-2">
                  <Input id="displayName" defaultValue={user.displayName || ""} placeholder="Nama lengkap Anda" />
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                  Email
                </Label>
                <div className="col-span-2">
                  <Input id="email" type="email" defaultValue={user.email || ""} placeholder="alamat@email.com" />
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="phoneNumber" className="text-sm font-medium text-muted-foreground">
                  Nomor Telepon
                </Label>
                <div className="col-span-2">
                  <Input id="phoneNumber" defaultValue={user.phoneNumber || ""} placeholder="Nomor telepon Anda" />
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="mb-4 text-lg font-medium">Detail Akun (Hanya Baca)</h3>
              <dl className="space-y-4">
                <ProfileDataItem label="ID Pengguna (UID)" value={user.uid} />
                <ProfileDataItem
                  label="Waktu Pembuatan"
                  value={user.metadata.creationTime ? format(new Date(user.metadata.creationTime), "PPP p") : "N/A"}
                />
                <ProfileDataItem
                  label="Terakhir Masuk"
                  value={
                    user.metadata.lastSignInTime ? format(new Date(user.metadata.lastSignInTime), "PPP p") : "N/A"
                  }
                />
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm font-medium text-muted-foreground">Status Verifikasi</Label>
                  <div className="col-span-2 flex items-center gap-2">
                    <Switch id="emailVerified" checked={user.emailVerified} disabled />
                    <Label htmlFor="emailVerified">{user.emailVerified ? "Terverifikasi" : "Belum Terverifikasi"}</Label>
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-sm font-medium text-muted-foreground">Anonim</Label>
                  <div className="col-span-2 flex items-center gap-2">
                    <Switch id="isAnonymous" checked={user.isAnonymous} disabled />
                    <Label htmlFor="isAnonymous">{user.isAnonymous ? "Ya" : "Tidak"}</Label>
                  </div>
                </div>
              </dl>
            </div>

            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="mb-4 text-lg font-medium">Penyedia</h3>
              <div className="space-y-2">
                {user.providerData.map((provider) => (
                  <div key={provider.providerId} className="flex items-center gap-2 rounded-md bg-muted p-3">
                    <div className="flex-shrink-0">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={provider.photoURL ?? undefined} />
                        <AvatarFallback>{(provider.providerId[0] || "?").toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">{provider.providerId}</p>
                      <p className="text-muted-foreground">{provider.email || provider.uid}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit">Perbarui Profil</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}