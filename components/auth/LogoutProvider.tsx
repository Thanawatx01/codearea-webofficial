"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { performLogout } from "@/lib/authUtils";
import { LogoutOverlay } from "./LogoutOverlay";

interface LogoutContextType {
  logout: (redirectTo?: string) => Promise<void>;
  isLoggingOut: boolean;
}

const LogoutContext = createContext<LogoutContextType | undefined>(undefined);

export function LogoutProvider({ children }: { children: ReactNode }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const logout = useCallback(async (redirectTo: string = "/") => {
    setIsLoggingOut(true);
    
    // Perform technical logout
    await performLogout();
    
    // Delay to let the overlay and message be seen
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Redirect
    router.replace(redirectTo);
  }, [router]);

  // Reset logging out state when route changes
  const pathname = usePathname();
  useEffect(() => {
    if (isLoggingOut) {
      setIsLoggingOut(false);
    }
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <LogoutContext.Provider value={{ logout, isLoggingOut }}>
      {children}
      {isLoggingOut && <LogoutOverlay />}
    </LogoutContext.Provider>
  );
}

export function useLogout() {
  const context = useContext(LogoutContext);
  if (context === undefined) {
    throw new Error("useLogout must be used within a LogoutProvider");
  }
  return context;
}
