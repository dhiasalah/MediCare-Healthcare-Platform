/**
 * QuickAccessGrid Component
 * Grid of quick access cards
 */

import React from "react";
import {
  Calendar,
  Users,
  User,
  Clock,
  FileText,
  BarChart3,
} from "lucide-react";
import { QuickAccessCard } from "../QuickAccessCard";

export const QuickAccessGrid = React.memo(() => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
    <QuickAccessCard
      title="Patients & Rendez-vous"
      description="Gérez vos patients et leurs rendez-vous"
      icon={Calendar}
      href="/espace-medecin/patients"
      nextItem="Prochain: 14h30 - Marie Dubois"
    />
    <QuickAccessCard
      title="Mes Patients"
      description="Gérez vos patients et dossiers médicaux"
      icon={Users}
      href="/espace-medecin/patients"
      nextItem="12 vus aujourd'hui"
      iconColor="text-green-600"
    />
    <QuickAccessCard
      title="Consultations"
      description="Téléconsultations et visites"
      icon={User}
      href="/espace-medecin/consultations"
      nextItem="Démarrer une consultation"
      iconColor="text-purple-600"
    />
    <QuickAccessCard
      title="Planning"
      description="Gérez votre emploi du temps"
      icon={Clock}
      href="/espace-medecin/planning"
      nextItem="Cette semaine: 45 RDV"
      iconColor="text-orange-600"
    />
    <QuickAccessCard
      title="Dossiers médicaux"
      description="Accédez aux dossiers et prescriptions"
      icon={FileText}
      href="/espace-medecin/patients"
      nextItem="5 dossiers mis à jour"
      iconColor="text-indigo-600"
    />
    <QuickAccessCard
      title="Statistiques"
      description="Analysez votre activité médicale"
      icon={BarChart3}
      href="/espace-medecin/statistiques"
      nextItem="Ce mois: 156 consultations"
      iconColor="text-teal-600"
    />
  </div>
));
QuickAccessGrid.displayName = "QuickAccessGrid";
