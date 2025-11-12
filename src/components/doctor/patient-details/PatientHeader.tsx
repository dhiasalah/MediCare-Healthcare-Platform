/**
 * PatientHeader Component
 * Displays patient avatar, name, age, and gender
 */

import React from "react";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Patient } from "@/types";
import { GENDER_LABELS } from "../constants";

interface PatientHeaderProps {
  patient: Patient;
  onEdit?: () => void;
}

const PatientAvatarInitials = React.memo(
  ({ patient }: { patient: Patient }) => {
    const initials = `${patient.first_name?.[0] || ""}${
      patient.last_name?.[0] || ""
    }`.toUpperCase();

    return (
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
        <span className="text-white font-bold text-2xl">{initials}</span>
      </div>
    );
  }
);
PatientAvatarInitials.displayName = "PatientAvatarInitials";

export const PatientHeader = React.memo(
  ({ patient, onEdit }: PatientHeaderProps) => {
    const age = patient.date_of_birth
      ? new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()
      : null;

    const genderLabel =
      GENDER_LABELS[patient.gender as keyof typeof GENDER_LABELS] || "Autre";

    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <PatientAvatarInitials patient={patient} />
          <div>
            <h2 className="text-2xl font-bold">
              {patient.first_name} {patient.last_name}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
              {age && <span>{age} ans</span>}
              {age && <span>•</span>}
              <span>{genderLabel}</span>
              {patient.blood_type && (
                <>
                  <span>•</span>
                  <span className="text-red-600 font-medium">
                    Groupe {patient.blood_type}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        {onEdit && (
          <Button onClick={onEdit} variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        )}
      </div>
    );
  }
);
PatientHeader.displayName = "PatientHeader";
