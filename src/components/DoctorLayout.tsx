"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { useAuthInitialization } from "@/hooks/useAuthInitialization";
import { cookieStorage } from "@/lib/cookies";
import DoctorNavigation from "@/components/DoctorNavigation";

interface DoctorLayoutProps {
  children: React.ReactNode;
}

export default function DoctorLayout({ children }: DoctorLayoutProps) {
  const { isAuthenticated, user, checkAuth } = useAuthStore();
  const router = useRouter();
  const isAuthInitialized = useAuthInitialization();
  const [recheckCount, setRecheckCount] = useState(0);
  const [isRechecking, setIsRechecking] = useState(false);

  // Check if user is already authenticated - avoid loading screen for navigation
  const isAlreadyAuth = isAuthenticated && user?.user_type === "doctor";
  const hasTokens =
    typeof window !== "undefined" ? cookieStorage.hasTokens() : false;

  useEffect(() => {
    if (isAuthInitialized && !isRechecking) {
      // Check if tokens exist in cookies as backup
      console.log("DoctorLayout: Auth initialized", {
        isAuthenticated,
        user: user?.user_type,
        hasTokens,
        recheckCount,
      });

      // If user is already authenticated as doctor, no need for further checks
      if (isAuthenticated && user?.user_type === "doctor") {
        return;
      }

      // If we have tokens but no auth state and haven't exceeded retry limit
      if (hasTokens && !isAuthenticated && recheckCount < 3) {
        console.log(
          `DoctorLayout: Found tokens but not authenticated, rechecking... (attempt ${
            recheckCount + 1
          })`
        );
        setIsRechecking(true);

        // Add a delay before rechecking
        setTimeout(async () => {
          try {
            await checkAuth();
            console.log("DoctorLayout: Recheck completed");
          } catch (error) {
            console.error("DoctorLayout: Recheck failed:", error);
          } finally {
            setRecheckCount((prev) => prev + 1);
            setIsRechecking(false);
          }
        }, 1000); // Wait 1 second before rechecking
        return;
      }

      // If still not authenticated after retries or no tokens
      if (!isAuthenticated || user?.user_type !== "doctor") {
        if (recheckCount >= 3) {
          console.log(
            "DoctorLayout: Max retries reached, clearing cookies and redirecting"
          );
          cookieStorage.clearTokens();
        } else {
          console.log("DoctorLayout: Redirecting to login");
        }
        router.push("/login");
      }
    }
  }, [
    isAuthInitialized,
    isAuthenticated,
    user,
    router,
    checkAuth,
    recheckCount,
    isRechecking,
    hasTokens,
  ]);

  // Show loading only during rechecking or initial load (not during navigation for authenticated users)
  if (isRechecking || (!isAuthInitialized && !isAlreadyAuth)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>
          {isRechecking
            ? "Vérification de l'authentification..."
            : "Chargement..."}
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.user_type !== "doctor") {
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
          <h1 className="text-3xl font-bold text-gray-900">Espace Médecin</h1>
          <p className="text-gray-600 mt-2">
            Bienvenue Dr.{" "}
            {user?.full_name || `${user?.first_name} ${user?.last_name}`}, gérez
            vos consultations et suivez vos patients
          </p>
        </div>
      </div>

      {/* Navigation */}
      <DoctorNavigation />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}
