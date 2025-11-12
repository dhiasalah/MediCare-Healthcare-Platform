"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import { User, LogOut } from "lucide-react";

export default function NavbarAuth() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setTimeout(() => {
      router.push("/");
      setIsLoggingOut(false);
    }, 500);
  };

  // Show loading skeleton in navbar during logout
  if (isLoggingOut) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        <span className="text-sm text-blue-600 font-medium">
          Déconnexion...
        </span>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex items-center space-x-3">
        {/* User Greeting Card */}
        <div className="hidden lg:flex items-center px-4 py-2 rounded-lg bg-blue-50 border border-blue-200">
          <div>
            <p className="text-xs text-gray-600">Connecté en tant que</p>
            <p className="text-sm font-bold text-gray-900">
              {user?.full_name || `${user?.first_name} ${user?.last_name}`}
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
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
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
    </div>
  );
}
