/**
 * DoctorSelectionCard Component
 * Displays available doctors for patient to select as primary doctor
 */

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Stethoscope, UserPlus } from "lucide-react";
import { useAvailableDoctors, useAssignDoctor } from "@/hooks/patient";
import type { AvailableDoctor } from "@/types/patient";

interface DoctorSelectionCardProps {
  onDoctorAssigned: () => void;
}

export function DoctorSelectionCard({
  onDoctorAssigned,
}: DoctorSelectionCardProps) {
  const { doctors, isLoading, refetchDoctors } = useAvailableDoctors();
  const { assignDoctor, isAssigning } = useAssignDoctor();
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);

  const handleAssignDoctor = async () => {
    if (!selectedDoctorId) return;

    const success = await assignDoctor(selectedDoctorId);
    if (success) {
      onDoctorAssigned();
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center text-blue-900">
          <UserPlus className="h-6 w-6 mr-3" />
          Sélection de votre médecin traitant
        </CardTitle>
        <CardDescription className="text-blue-700">
          Pour accéder à votre espace patient, veuillez d&apos;abord
          sélectionner un médecin traitant
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="ml-3 text-gray-600">
              Chargement des médecins disponibles...
            </p>
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-8">
            <Stethoscope className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Aucun médecin disponible pour le moment
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Tous les médecins ont atteint leur capacité maximale de patients.
              Veuillez réessayer ultérieurement.
            </p>
            <Button onClick={refetchDoctors} variant="outline" className="mt-4">
              Actualiser
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-sm text-gray-700">
              Sélectionnez votre médecin traitant parmi les médecins disponibles
              (chaque médecin peut avoir maximum 4 patients) :
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctors.map((doctor) => (
                <DoctorCard
                  key={doctor.id}
                  doctor={doctor}
                  isSelected={selectedDoctorId === doctor.id}
                  onSelect={() => setSelectedDoctorId(doctor.id)}
                />
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button
                onClick={handleAssignDoctor}
                disabled={!selectedDoctorId || isAssigning}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isAssigning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Assignation en cours...
                  </>
                ) : (
                  "Confirmer la sélection"
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface DoctorCardProps {
  doctor: AvailableDoctor;
  isSelected: boolean;
  onSelect: () => void;
}

function DoctorCard({ doctor, isSelected, onSelect }: DoctorCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
        isSelected
          ? "border-blue-600 bg-blue-50 shadow-md"
          : "border-gray-300 hover:border-gray-400 hover:shadow"
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
          <Stethoscope className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">
            Dr. {doctor.full_name}
          </p>
          <p className="text-sm text-gray-600 truncate">
            {doctor.specialization}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Patients: {doctor.patient_count}/4
            </span>
            <span className="text-xs text-green-600 font-medium">
              {doctor.available_slots} place(s)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
