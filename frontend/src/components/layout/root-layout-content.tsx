"use client";

import { Header } from "@/components/layout/header";
import { usePathname } from "next/navigation";

import { AuthProvider } from "@/contexts/AuthContext";
import { HttpDevGuard } from "@/components/dev/HttpDevGuard";

export function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");
  const isProject = pathname?.startsWith("/projects");
  const isAuth = pathname?.startsWith("/(auth)") || pathname?.startsWith("/login") || pathname?.startsWith("/signup");

  return (
    <AuthProvider>
      {!isDashboard && !isProject && <Header />}

      {process.env.NODE_ENV === 'development' && <HttpDevGuard />}

      {children}
    </AuthProvider>
  );
}
