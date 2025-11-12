"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Stethoscope, Home } from "lucide-react";

// Dynamically import the auth-dependent part with no SSR
const NavbarAuth = dynamic(() => import("./NavbarAuth"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center space-x-4">
      <div className="w-20 h-8 bg-gray-200 animate-pulse rounded"></div>
    </div>
  ),
});

export default function Navbar() {
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

            <NavbarAuth />
          </div>
        </div>
      </div>
    </nav>
  );
}
