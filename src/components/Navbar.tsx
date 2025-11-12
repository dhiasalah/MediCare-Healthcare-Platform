"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import { Stethoscope, User, LogOut, Home } from "lucide-react";
import { PageSkeleton } from "@/components/ui/page-skeleton";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    router.push("/");
    setTimeout(() => setIsLoggingOut(false), 1000);
  };

  if (isLoggingOut) {
    return (
      <PageSkeleton variant="dashboard" message="Déconnexion en cours..." />
    );
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 group-hover:shadow-lg transition-all duration-300">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-indigo-700 transition-all duration-200">
                  MediCare
                </span>
                <p className="text-xs text-gray-500 font-medium">
                  Healthcare Platform
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-2">
            <Link href="/">
              <Button
                variant="ghost"
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              >
                <Home className="h-4 w-4" />
                <span className="font-medium hidden sm:inline">Accueil</span>
              </Button>
            </Link>

            {isAuthenticated ? (
              <>
                {/* User Greeting */}
                <div className="hidden lg:flex items-center px-4 py-2 mx-2 rounded-lg bg-blue-50 border border-blue-200">
                  <div>
                    <p className="text-xs text-gray-600">
                      Connecté en tant que
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      {user?.full_name ||
                        `${user?.first_name} ${user?.last_name}`}
                    </p>
                  </div>
                </div>

                {/* Space Button */}
                {user?.user_type === "doctor" && (
                  <Link href="/espace-medecin">
                    <Button className="hidden sm:inline-flex bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                      Espace Médecin
                    </Button>
                  </Link>
                )}
                {user?.user_type === "patient" && (
                  <Link href="/espace-patient">
                    <Button className="hidden sm:inline-flex bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                      Espace Patient
                    </Button>
                  </Link>
                )}

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium border border-red-200 hover:border-red-300"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </button>
              </>
            ) : (
              <>
                {/* Auth Buttons */}
                <Link href="/signup">
                  <Button
                    variant="outline"
                    className="hidden sm:flex items-center space-x-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700 font-semibold rounded-lg transition-all duration-200"
                  >
                    <User className="h-4 w-4" />
                    <span>S&apos;inscrire</span>
                  </Button>
                </Link>
                <Link href="/login">
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Connexion</span>
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
