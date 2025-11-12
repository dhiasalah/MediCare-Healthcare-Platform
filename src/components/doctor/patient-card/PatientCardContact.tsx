/**
 * PatientCardContact Component
 * Displays patient contact information
 */

import React from "react";
import { Mail, Phone } from "lucide-react";
import type { Patient } from "@/types";

interface PatientCardContactProps {
  patient: Patient;
}

export const PatientCardContact = React.memo(
  ({ patient }: PatientCardContactProps) => {
    if (!patient.email && !patient.phone) return null;

    return (
      <div className="space-y-1 text-sm text-gray-600">
        {patient.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-gray-400" />
            <span className="truncate">{patient.email}</span>
          </div>
        )}
        {patient.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-gray-400" />
            <span>{patient.phone}</span>
          </div>
        )}
      </div>
    );
  }
);
PatientCardContact.displayName = "PatientCardContact";
