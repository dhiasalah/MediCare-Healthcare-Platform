"use client";

import { useEffect, useState } from "react";
import PatientLayout from "@/components/PatientLayout";
import { useAuthStore } from "@/store/auth";
import { showToast } from "@/hooks/useToast";
import SetPasswordModal from "@/components/SetPasswordModal";
import MySpecialistsCard from "@/components/MySpecialistsCard";
import { usePatientRecord } from "@/hooks/patient";
import { DoctorSelectionCard } from "@/components/patient";
import { StatCard } from "@/components/patient/StatCard";
import { QuickAccessCard } from "@/components/patient/QuickAccessCard";
import { ActivityFeed } from "@/components/patient/ActivityFeed";
import { LoadingState } from "@/components/patient/LoadingState";
import {
  Calendar,
  FileText,
  Heart,
  Pill,
  Phone,
  AlertCircle,
} from "lucide-react";

export default function EspacePatient() {
  const { user, checkAuth } = useAuthStore();
  const { hasPatientRecord, isLoading, refreshPatientRecord } =
    usePatientRecord();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    if (user?.password_needs_reset) {
      setShowPasswordModal(true);
    }
  }, [user]);

  const handlePasswordSet = async () => {
    setShowPasswordModal(false);
    showToast.success("Mot de passe défini avec succès!");
    await checkAuth();
  };

  const handleDoctorAssigned = () => {
    refreshPatientRecord();
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (hasPatientRecord === false) {
    return (
      <PatientLayout>
        <DoctorSelectionCard onDoctorAssigned={handleDoctorAssigned} />
      </PatientLayout>
    );
  }

  const activities = [
    {
      id: "1",
      title: "Prise de médicament confirmée",
      timestamp: "Il y a 2 heures",
      color: "green" as const,
    },
    {
      id: "2",
      title: "Rendez-vous confirmé avec Dr. Martin",
      timestamp: "Hier",
      color: "blue" as const,
    },
    {
      id: "3",
      title: "Rappel: Analyse sanguine à programmer",
      timestamp: "Il y a 2 jours",
      color: "orange" as const,
    },
  ];

  return (
    <PatientLayout>
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Prochain RDV"
          value="Demain"
          subtitle="Dr. Martin à 14h30"
          icon={Calendar}
        />
        <StatCard
          title="Médicaments"
          value="3 actifs"
          subtitle="Traitement en cours"
          icon={Pill}
        />
        <StatCard
          title="Rappels"
          value="2"
          subtitle="Actions requises"
          icon={AlertCircle}
          iconColor="text-orange-500"
          valueColor="text-orange-600"
        />
        <StatCard
          title="Santé générale"
          value="Bonne"
          subtitle="Dernière évaluation"
          icon={Heart}
          iconColor="text-green-500"
          valueColor="text-green-600"
        />
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <QuickAccessCard
          href="/espace-patient/rendez-vous"
          icon={Calendar}
          title="Mes Rendez-vous"
          description="Gérez vos consultations et prises de rendez-vous"
          subtitle="Prochain RDV: Demain 14h30"
          badge="2 rendez-vous à venir"
          iconColor="text-blue-600"
          badgeColor="text-blue-600 font-medium"
        />
        <QuickAccessCard
          href="/espace-patient/suivi-medical"
          icon={Heart}
          title="Suivi Médical"
          description="Consultez vos données de santé et examens"
          subtitle="Dernière mesure: Hier"
          badge="État général: Bon"
          iconColor="text-red-600"
          badgeColor="text-green-600 font-medium"
        />
        <QuickAccessCard
          href="/espace-patient/medicaments"
          icon={Pill}
          title="Médicaments"
          description="Gérez vos traitements et rappels"
          subtitle="3 médicaments actifs"
          badge="1 rappel aujourd'hui"
          iconColor="text-green-600"
          badgeColor="text-orange-600 font-medium"
        />
        <QuickAccessCard
          href="/espace-patient/documents"
          icon={FileText}
          title="Documents"
          description="Accédez à vos documents médicaux"
          subtitle="Ordonnances, analyses..."
          badge="5 documents récents"
          iconColor="text-purple-600"
          badgeColor="text-purple-600 font-medium"
        />
        <QuickAccessCard
          href="/espace-patient/teleconsultation"
          icon={Phone}
          title="Téléconsultation"
          description="Consultez à distance vos médecins"
          subtitle="Service disponible 24h/7j"
          badge="Démarrer une consultation"
          iconColor="text-blue-600"
          badgeColor="text-blue-600 font-medium"
        />
        <QuickAccessCard
          href="/espace-patient/urgences"
          icon={AlertCircle}
          title="Urgences"
          description="Contact d'urgence et services d'aide"
          subtitle="SAMU: 15 | Pompiers: 18"
          badge="Contacts d'urgence"
          iconColor="text-red-600"
          badgeColor="text-red-600 font-medium"
        />
      </div>

      {/* My Specialists Section */}
      <div className="mt-8">
        <MySpecialistsCard />
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <ActivityFeed activities={activities} />
      </div>

      {/* Password Setup Modal */}
      {showPasswordModal && <SetPasswordModal onSuccess={handlePasswordSet} />}
    </PatientLayout>
  );
}
