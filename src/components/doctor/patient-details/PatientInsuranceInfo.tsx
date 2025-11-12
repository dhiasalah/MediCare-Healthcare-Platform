/**
 * PatientInsuranceInfo Component
 * Displays insurance information
 */

import React from "react";
import { Shield } from "lucide-react";
import type { Patient } from "@/types";

interface PatientInsuranceInfoProps {
  patient: Patient;
}

export const PatientInsuranceInfo = React.memo(
  ({ patient }: PatientInsuranceInfoProps) => {
    if (!patient.insurance_provider) {
      return null;
    }

    return (
      <div className="bg-green-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
          <Shield className="h-5 w-5 mr-2 text-green-600" />
          Assurance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600 font-medium">Fournisseur</p>
            <p className="text-sm text-gray-900">
              {patient.insurance_provider}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-medium">
              Numéro de police
            </p>
            <p className="text-sm text-gray-900">
              {patient.insurance_number || "Non renseigné"}
            </p>
          </div>
        </div>
      </div>
    );
  }
);
PatientInsuranceInfo.displayName = "PatientInsuranceInfo";
