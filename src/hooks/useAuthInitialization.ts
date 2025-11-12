import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";

export const useAuthInitialization = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      if (typeof window !== "undefined") {
        console.log("Initializing auth state...");
        console.log("Current state before checkAuth:", {
          isAuthenticated,
          user: user?.user_type,
        });

        // If user is already authenticated, mark as initialized immediately
        if (isAuthenticated && user) {
          setIsInitialized(true);
          console.log("Auth already initialized - user authenticated");
          return;
        }

        await checkAuth();

        // Shorter delay for better UX, or no delay if already authenticated
        const delay = isAuthenticated && user ? 0 : 100;
        setTimeout(() => {
          setIsInitialized(true);
          console.log("Auth initialization complete");
        }, delay);
      }
    };

    initializeAuth();
  }, [checkAuth, isAuthenticated, user?.user_type]);

  return isInitialized;
};
