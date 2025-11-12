/**
 * StatsCardsGrid Component
 * Grid of stats cards
 */

import React from "react";
import { Users, Activity, Clock, User } from "lucide-react";
import { StatsCard } from "../StatsCard";

interface StatsData {
  patientsToday: number;
  patientsTodayChange: number;
  consultationsCompleted: number;
  appointmentsPending: number;
  urgentCases: number;
}

interface StatsCardsGridProps {
  stats: StatsData;
}

export const StatsCardsGrid = React.memo(({ stats }: StatsCardsGridProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <StatsCard
      title="Patients aujourd'hui"
      value={stats.patientsToday}
      description={`+${stats.patientsTodayChange} par rapport à hier`}
      icon={Users}
    />
    <StatsCard
      title="Consultations"
      value={stats.consultationsCompleted}
      description="Terminées aujourd'hui"
      icon={Activity}
    />
    <StatsCard
      title="En attente"
      value={stats.appointmentsPending}
      description="Rendez-vous restants"
      icon={Clock}
    />
    <StatsCard
      title="Urgences"
      value={stats.urgentCases}
      description="Nécessitent attention"
      icon={User}
      iconColor="text-red-500"
      valueColor="text-red-600"
    />
  </div>
));
StatsCardsGrid.displayName = "StatsCardsGrid";
