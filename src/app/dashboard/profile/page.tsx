
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
import { useState, ComponentProps, useId } from "react";
import { getFirebaseClient } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { Loader2 } from "lucide-react";

function FloatingLabelInput({
  id: providedId,
  label,
  ...props
}: ComponentProps<typeof Input> & { label: string }) {
  const defaultId = useId();
  const id = providedId || defaultId;
  return (
    <div className="relative">
      <Input
        id={id}
        placeholder=" "
        className="peer block w-full appearance-none rounded-md border-input bg-transparent px-3 py-2 text-base focus:border-primary focus:outline-none focus:ring-0 md:text-sm"
        {...props}
      />
      <Label
        htmlFor={id}
        className="absolute left-3 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-sm text-muted-foreground duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-primary"
      >
        {label}
      </Label>
    </div>
  );
}

function ProfileDataItem({ label, value }: { label: string; value: string | undefined | null }) {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-base text-foreground">{value || "N/A"}</p>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPasswordResetLoading, setIsPasswordResetLoading] = useState(false);

  const getInitials = (email: string | null | undefined) => {
    if (!email) return "U";
    return email.substring(0, 2).toUpperCase();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast({
      title: "Fungsi Belum Diimplementasikan",
      description: "Kemampuan untuk memperbarui profil belum diimplementasikan dalam demo ini.",
    });
  };

  const handlePasswordReset = async () => {
    if (!user || !user.email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Email pengguna tidak ditemukan.",
      });
      return;
    }

    setIsPasswordResetLoading(true);
    try {
      const { auth } = await getFirebaseClient();

      if (!auth) {
        throw new Error("Koneksi ke layanan otentikasi gagal. Muat ulang halaman dan coba lagi.");
      }

      await sendPasswordResetEmail(auth, user.email);
      toast({
        title: "Email Terkirim",
        description: "Email pengaturan ulang kata sandi telah dikirim ke " + user.email,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal mengirim email",
        description: error.message,
      });
    } finally {
      setIsPasswordResetLoading(false);
    }
  };

  if (!user) {
    return (
      <main className="flex-1 p-4 sm:p-6">
        <p>Memuat profil...</p>
      </main>
    );
  }

  const avatarUrl = user.photoURL || getGravatarUrl(user.email);
  const hasPasswordProvider = user.providerData.some((provider) => provider.providerId === "password");

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
            <div className="space-y-6 rounded-lg border p-4">
              <h3 className="mb-6 text-lg font-medium">Informasi Profil</h3>
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarUrl} alt={user.displayName ?? "Pengguna"} />
                  <AvatarFallback className="text-3xl">{getInitials(user.email)}</AvatarFallback>
                </Avatar>
              </div>

              <FloatingLabelInput
                id="displayName"
                label="Nama Tampilan"
                defaultValue={user.displayName || ""}
                placeholder="Nama lengkap Anda"
              />
              <FloatingLabelInput
                id="photoURL"
                label="URL Avatar"
                defaultValue={user.photoURL || ""}
                placeholder="URL ke gambar"
              />
              <FloatingLabelInput
                id="email"
                type="email"
                label="Email"
                defaultValue={user.email || ""}
                placeholder="alamat@email.com"
              />
              <FloatingLabelInput
                id="phoneNumber"
                label="Nomor Telepon"
                defaultValue={user.phoneNumber || ""}
                placeholder="Nomor telepon Anda"
              />
            </div>

            {hasPasswordProvider && (
              <div className="space-y-4 rounded-lg border p-4">
                <h3 className="mb-4 text-lg font-medium">Keamanan</h3>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Kata Sandi</Label>
                  <div className="mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePasswordReset}
                      disabled={isPasswordResetLoading}
                    >
                      {isPasswordResetLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Kirim Email Atur Ulang Kata Sandi
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6 rounded-lg border p-4">
              <h3 className="mb-4 text-lg font-medium">Detail Akun (Hanya Baca)</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <ProfileDataItem label="ID Pengguna (UID)" value={user.uid} />
                <ProfileDataItem
                  label="Waktu Pembuatan"
                  value={user.metadata.creationTime ? format(new Date(user.metadata.creationTime), "PPP p") : "N/A"}
                />
                <ProfileDataItem
                  label="Terakhir Masuk"
                  value={user.metadata.lastSignInTime ? format(new Date(user.metadata.lastSignInTime), "PPP p") : "N/A"}
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Email Terverifikasi</span>
                  <Switch id="emailVerified" checked={user.emailVerified} disabled />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Akun Anonim</span>
                  <Switch id="isAnonymous" checked={user.isAnonymous} disabled />
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="mb-4 text-lg font-medium">Penyedia</h3>
              <div className="space-y-2">
                {user.providerData.map((provider) => (
                  <div key={provider.providerId} className="flex items-center gap-3 rounded-md bg-muted p-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={provider.photoURL ?? undefined} />
                      <AvatarFallback>{(provider.providerId[0] || "?").toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{provider.providerId}</p>
                      <p className="text-sm text-muted-foreground">{provider.email || provider.uid}</p>
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
