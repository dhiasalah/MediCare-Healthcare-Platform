"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Calendar,
  FileText,
  Heart,
  Pill,
  Phone,
  AlertCircle,
  Home,
} from "lucide-react";

const navigationItems = [
  {
    name: "Tableau de bord",
    href: "/espace-patient",
    icon: Home,
  },
  {
    name: "Mes Rendez-vous",
    href: "/espace-patient/rendez-vous",
    icon: Calendar,
  },
  {
    name: "Suivi Médical",
    href: "/espace-patient/suivi-medical",
    icon: Heart,
  },
  {
    name: "Médicaments",
    href: "/espace-patient/medicaments",
    icon: Pill,
  },
  {
    name: "Documents",
    href: "/espace-patient/documents",
    icon: FileText,
  },
  {
    name: "Téléconsultation",
    href: "/espace-patient/teleconsultation",
    icon: Phone,
  },
  {
    name: "Urgences",
    href: "/espace-patient/urgences",
    icon: AlertCircle,
  },
];

export default function PatientNavigation() {
  const pathname = usePathname();

  return (
    <div className="bg-white border-b border-gray-200 mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8 overflow-x-auto">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200 hover:scale-105",
                  isActive
                    ? "border-blue-500 text-blue-600 bg-blue-50/50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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
