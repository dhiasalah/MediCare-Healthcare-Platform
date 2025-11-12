/**
 * PatientEmergencyContact Component
 * Displays emergency contact information
 */

import React from "react";
import { Users } from "lucide-react";
import type { Patient } from "@/types";

interface PatientEmergencyContactProps {
  patient: Patient;
}

export const PatientEmergencyContact = React.memo(
  ({ patient }: PatientEmergencyContactProps) => {
    if (!patient.emergency_contact_name) {
      return null;
    }

    return (
      <div className="bg-red-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
          <Users className="h-5 w-5 mr-2 text-red-600" />
          Contact d&apos;urgence
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600 font-medium">Nom</p>
            <p className="text-sm text-gray-900">
              {patient.emergency_contact_name}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-medium">Relation</p>
            <p className="text-sm text-gray-900">
              {patient.emergency_contact_relation || "Non précisée"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-medium">Téléphone</p>
            <p className="text-sm text-gray-900">
              {patient.emergency_contact_phone || "Non renseigné"}
            </p>
          </div>
        </div>
      </div>
    );
  }
);
PatientEmergencyContact.displayName = "PatientEmergencyContact";
