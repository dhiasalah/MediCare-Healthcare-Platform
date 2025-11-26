"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Users, Activity, Clock, User, BarChart3, Home, Brain } from "lucide-react";

const navigationItems = [
  {
    name: "Tableau de bord",
    href: "/espace-medecin",
    icon: Home,
  },
  {
    name: "Patients & Rendez-vous",
    href: "/espace-medecin/patients",
    icon: Users,
  },
  {
    name: "Planning",
    href: "/espace-medecin/planning",
    icon: Clock,
  },
  {
    name: "Consultations",
    href: "/espace-medecin/consultations",
    icon: User,
  },
  {
    name: "Analyse RMI",
    href: "/espace-medecin/brain-tumor-analysis",
    icon: Brain,
  },
  {
    name: "Statistiques",
    href: "/espace-medecin/statistiques",
    icon: BarChart3,
  },
  {
    name: "Activité",
    href: "/espace-medecin/activite",
    icon: Activity,
  },
];

export default function DoctorNavigation() {
  const pathname = usePathname();

  return (
    <div className="bg-white border-b border-gray-200 mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8 overflow-x-auto">
          {navigationItems.map((item) => {
            // Check if current path matches or starts with this item's href
            // For exact match on "Tableau de bord", only match exactly
            const isActive =
              item.href === "/espace-medecin"
                ? pathname === item.href
                : pathname === item.href ||
                  pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200 hover:scale-105 cursor-pointer",
                  isActive
                    ? "border-blue-500 text-blue-600 bg-blue-50/50 cursor-pointer"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 cursor-pointer"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive ? "text-blue-600" : "text-gray-400"
                  )}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
