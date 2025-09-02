"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { getFirebaseClient } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

const protectedRoutes = ["/dashboard"];
const authRoutes = ["/login", "/signup"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;
    getFirebaseClient().then(({ auth }) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (isMounted) {
          setUser(user);
          setLoading(false);
        }
      });

      return () => {
        isMounted = false;
        unsubscribe();
      };
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
      const isAuthRoute = authRoutes.includes(pathname);

      if (isProtectedRoute && !user) {
        router.replace("/login");
      }

      if (isAuthRoute && user) {
        router.replace("/dashboard");
      }
    }
  }, [user, loading, pathname, router]);

  if (loading && (protectedRoutes.some((route) => pathname.startsWith(route)) || authRoutes.includes(pathname))) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
