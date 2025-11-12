/**
 * PatientMedicalInfo Component
 * Displays medical information, allergies, and history
 */

import React from "react";
import { Heart, AlertCircle } from "lucide-react";
import type { Patient } from "@/types";

interface PatientMedicalInfoProps {
  patient: Patient;
}

export const PatientMedicalInfo = React.memo(
  ({ patient }: PatientMedicalInfoProps) => {
    if (!patient.medical_history && !patient.allergies) {
      return null;
    }

    return (
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
          <Heart className="h-5 w-5 mr-2 text-red-600" />
          Informations médicales
        </h3>
        <div className="space-y-3">
          {patient.medical_history && (
            <div>
              <p className="text-xs text-gray-600 font-medium mb-1">
                Antécédents médicaux
              </p>
              <p className="text-sm text-gray-900 bg-white rounded p-2">
                {patient.medical_history}
              </p>
            </div>
          )}
          {patient.allergies && (
            <div>
              <p className="text-xs text-gray-600 font-medium mb-1 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1 text-orange-500" />
                Allergies
              </p>
              <p className="text-sm text-gray-900 bg-white rounded p-2 border-l-4 border-l-orange-500">
                {patient.allergies}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
);
PatientMedicalInfo.displayName = "PatientMedicalInfo";
