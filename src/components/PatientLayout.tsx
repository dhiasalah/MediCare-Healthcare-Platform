"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { useAuthInitialization } from "@/hooks/useAuthInitialization";
import { cookieStorage } from "@/lib/cookies";
import PatientNavigation from "@/components/PatientNavigation";

interface PatientLayoutProps {
  children: React.ReactNode;
}

export default function PatientLayout({ children }: PatientLayoutProps) {
  const { isAuthenticated, user, checkAuth } = useAuthStore();
  const router = useRouter();
  const isAuthInitialized = useAuthInitialization();

  useEffect(() => {
    if (isAuthInitialized) {
      // Check if tokens exist in cookies as backup
      const hasTokens = cookieStorage.hasTokens();
      console.log("PatientLayout: Auth initialized", {
        isAuthenticated,
        user: user?.user_type,
        hasTokens,
      });

      // If we have tokens but no auth state, trigger a recheck
      if (hasTokens && !isAuthenticated) {
        console.log(
          "PatientLayout: Found tokens but not authenticated, rechecking..."
        );
        // Force a re-check of auth state
        checkAuth().then(() => {
          console.log("PatientLayout: Recheck completed");
        });
        return;
      }

      if (!isAuthenticated || user?.user_type !== "patient") {
        console.log("PatientLayout: Redirecting to login");
        router.push("/login");
      }
    }
  }, [isAuthInitialized, isAuthenticated, user, router, checkAuth]);

  if (!isAuthInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated || user?.user_type !== "patient") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Redirection...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Espace Patient</h1>
          <p className="text-gray-600 mt-2">
            Bonjour{" "}
            {user?.full_name || `${user?.first_name} ${user?.last_name}`},
            suivez votre santé et gérez vos rendez-vous
          </p>
        </div>
      </div>

      {/* Navigation */}
      <PatientNavigation />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}
