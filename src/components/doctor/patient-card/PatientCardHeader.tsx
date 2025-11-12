/**
 * PatientCardHeader Component
 * Displays patient name, age, and gender badges
 */

import React from "react";
import type { Patient } from "@/types";
import { GENDER_LABELS } from "../constants";

interface PatientCardHeaderProps {
  patient: Patient;
}

const getAge = (dateOfBirth: string | null | undefined): number | null => {
  if (!dateOfBirth) return null;
  return new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
};

export const PatientCardHeader = React.memo(
  ({ patient }: PatientCardHeaderProps) => {
    const age = getAge(patient.date_of_birth);
    const genderLabel =
      GENDER_LABELS[patient.gender as keyof typeof GENDER_LABELS] || "Autre";

    return (
      <div className="flex items-center gap-2 mb-1">
        <h3 className="font-semibold text-gray-900 text-lg">
          {patient.first_name} {patient.last_name}
        </h3>
        {age && (
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
            {age} ans
          </span>
        )}
        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">
          {genderLabel}
        </span>
      </div>
    );
  }
);
PatientCardHeader.displayName = "PatientCardHeader";
