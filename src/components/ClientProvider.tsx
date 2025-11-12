"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";

interface ClientProviderProps {
  children: React.ReactNode;
}

export function ClientProvider({ children }: ClientProviderProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // Rehydrate the auth store
    useAuthStore.persist.rehydrate();
    setHasMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering auth-dependent content on server
  if (!hasMounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return <>{children}</>;
}
