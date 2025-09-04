"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { createUser } from "@/features/auth/services/user.service";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserAdded: () => void;
}

export function AddUserDialog({ open, onOpenChange, onUserAdded }: AddUserDialogProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = t("userManagement.addUser.validation.emailRequired");
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t("userManagement.addUser.validation.emailInvalid");
    }
    if (!password) {
      newErrors.password = t("userManagement.addUser.validation.passwordRequired");
    } else if (password.length < 6) {
      newErrors.password = t("userManagement.addUser.validation.passwordLength");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    const result = await createUser(formData);
    setIsLoading(false);

    if (result.success) {
      toast({
        title: t("userManagement.addUser.success.title"),
        description: t("userManagement.addUser.success.description", { email: email }),
      });
      onUserAdded();
      onOpenChange(false);
      setEmail("");
      setPassword("");
      setErrors({});
    } else {
      toast({
        variant: "destructive",
        title: t("userManagement.addUser.error.title"),
        description: result.error || t("error.unknown"),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t("userManagement.addUser.title")}</DialogTitle>
            <DialogDescription>{t("userManagement.addUser.description")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                {t("login.emailLabel")}
              </Label>
              <div className="col-span-3">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                  placeholder={t("login.emailPlaceholder")}
                />
                {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                {t("login.passwordLabel")}
              </Label>
              <div className="col-span-3">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                  placeholder={t("login.passwordPlaceholder")}
                />
                {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("userManagement.addUser.createButton")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
