"use client";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User as UserIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { getGravatarUrl } from "@/lib/utils";
import { useState, ComponentProps, useId, useEffect } from "react";
import { authService } from "@/features/auth/services/auth.service";

function FloatingLabelInput({
  id: providedId,
  label,
  placeholder,
  ...props
}: ComponentProps<typeof Input> & { label: string }) {
  const defaultId = useId();
  const id = providedId || defaultId;

  return (
    <div className="relative pt-6">
      <Label htmlFor={id} className="absolute left-2 -top-0 text-xs text-muted-foreground px-1">
        {label}
      </Label>
      <Input id={id} placeholder={placeholder} {...props} />
    </div>
  );
}

function SwitchControl({ label, ...props }: ComponentProps<typeof Switch> & { label: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-input px-3 py-2">
      <Label htmlFor={props.id} className="text-sm text-muted-foreground">
        {label}
      </Label>
      <Switch id={props.id} {...props} />
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPasswordResetLoading, setIsPasswordResetLoading] = useState(false);

  // State untuk setiap field yang dapat diedit
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setPhotoURL(user.photoURL || "");
      setEmail(user.email || "");
      setPhoneNumber(user.phoneNumber || "");
    }
  }, [user]);

  const getInitials = (email: string | null | undefined) => {
    if (!email) return "U";
    return email.substring(0, 2).toUpperCase();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    setIsUpdating(true);
    try {
      // Perbarui email jika berubah
      if (email !== user.email) {
        const emailResult = await authService.verifyEmail(user, email);
        if (emailResult.success) {
          toast({
            title: "Email Verifikasi Terkirim",
            description: `Tautan verifikasi telah dikirim ke ${email}. Harap verifikasi untuk menyelesaikan perubahan.`,
          });
        } else {
          throw new Error(emailResult.error);
        }
      }

      // Perbarui profil lainnya
      const profileResult = await authService.updateUserProfile(user, {
        displayName: displayName,
        photoURL: photoURL,
      });

      if (!profileResult.success) {
        throw new Error(profileResult.error);
      }

      // Anda mungkin perlu fungsi backend untuk memperbarui nomor telepon
      // updatePhoneNumber(user, phoneNumber)

      toast({
        title: "Profil Diperbarui",
        description: "Informasi profil Anda telah berhasil disimpan.",
      });
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Gagal Memperbarui Profil",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
      });
    } finally {
      setIsUpdating(false);
    }
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
    const result = await authService.sendPasswordReset(user.email);
    if (result.success) {
      toast({
        title: "Email Terkirim",
        description: "Email pengaturan ulang kata sandi telah dikirim ke " + user.email,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Gagal mengirim email",
        description: result.error,
      });
    }
    setIsPasswordResetLoading(false);
  };

  if (!user) {
    return (
      <main className="flex-1 p-4 sm:p-6">
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
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
              <div className="flex items-center justify-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarUrl} alt={user.displayName ?? "Pengguna"} />
                  <AvatarFallback className="text-3xl">{getInitials(user.email)}</AvatarFallback>
                </Avatar>
              </div>

              <FloatingLabelInput
                id="displayName"
                label="Nama Tampilan"
                placeholder="contoh: John Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
              <FloatingLabelInput
                id="photoURL"
                label="URL Avatar"
                placeholder="contoh: https://example.com/avatar.png"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
              />
              <FloatingLabelInput
                id="email"
                type="email"
                label="Email"
                placeholder="contoh: john.doe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <FloatingLabelInput
                id="phoneNumber"
                label="Nomor Telepon"
                placeholder="contoh: +6281234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
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
              <FloatingLabelInput id="uid" label="ID Pengguna (UID)" defaultValue={user.uid} disabled />
              <FloatingLabelInput
                id="creationTime"
                label="Waktu Pembuatan"
                defaultValue={
                  user.metadata.creationTime ? format(new Date(user.metadata.creationTime), "PPP p") : "N/A"
                }
                disabled
              />
              <FloatingLabelInput
                id="lastSignInTime"
                label="Terakhir Masuk"
                defaultValue={
                  user.metadata.lastSignInTime ? format(new Date(user.metadata.lastSignInTime), "PPP p") : "N/A"
                }
                disabled
              />
              <SwitchControl id="emailVerified" label="Email Terverifikasi" checked={user.emailVerified} disabled />
              <SwitchControl id="isAnonymous" label="Akun Anonim" checked={user.isAnonymous} disabled />
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
              <Button type="submit" disabled={isUpdating}>
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
