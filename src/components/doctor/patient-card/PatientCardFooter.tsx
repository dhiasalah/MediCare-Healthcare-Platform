/**
 * PatientCardFooter Component
 * Footer with creation date and blood type
 */

import React from "react";
import type { Patient } from "@/types";

interface PatientCardFooterProps {
  patient: Patient;
}

export const PatientCardFooter = React.memo(
  ({ patient }: PatientCardFooterProps) => (
    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
      <span>
        Créé le {new Date(patient.created_at).toLocaleDateString("fr-FR")}
      </span>
      {patient.blood_type && (
        <span className="px-2 py-1 bg-red-50 text-red-600 rounded font-medium">
          Groupe: {patient.blood_type}
        </span>
      )}
    </div>
  )
);
PatientCardFooter.displayName = "PatientCardFooter";
