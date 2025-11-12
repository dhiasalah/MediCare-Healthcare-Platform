"use client";

import DoctorLayout from "@/components/DoctorLayout";
import {
  StatsCardsGrid,
  QuickAccessGrid,
  RecentActivitySection,
} from "@/components/doctor/dashboard";
import { useDoctorStats } from "@/hooks/doctor";

export default function EspaceMedecin() {
  const { stats, isLoading } = useDoctorStats();

  if (isLoading) {
    return (
      <DoctorLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DoctorLayout>
    );
  }

  const activities = [
    {
      id: "1",
      title: "Consultation terminée - Marie Dubois",
      timestamp: "Il y a 2 heures",
      color: "green" as const,
    },
    {
      id: "2",
      title: "Nouvelle prescription ajoutée",
      timestamp: "Il y a 3 heures",
      color: "blue" as const,
    },
    {
      id: "3",
      title: "Rendez-vous reporté - Paul Martin",
      timestamp: "Il y a 5 heures",
      color: "orange" as const,
    },
    {
      id: "4",
      title: "Nouveau patient ajouté",
      timestamp: "Hier",
      color: "blue" as const,
    },
    {
      id: "5",
      title: "Visite à domicile effectuée",
      timestamp: "Avant-hier",
      color: "green" as const,
    },
  ];

  return (
    <DoctorLayout>
      <StatsCardsGrid stats={stats} />
      <QuickAccessGrid />
      <RecentActivitySection activities={activities} />
    </DoctorLayout>
  );
}
