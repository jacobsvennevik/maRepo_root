import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/app/(auth)/services/auth";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = AuthService.isAuthenticated();
      setIsAuthenticated(authenticated);
      setIsLoading(false);
      
      if (!authenticated) {
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  const logout = () => {
    AuthService.logout();
    setIsAuthenticated(false);
    router.push("/login");
  };

  return {
    isAuthenticated,
    isLoading,
    logout,
  };
} 