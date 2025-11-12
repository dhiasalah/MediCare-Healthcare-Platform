/**
 * PatientContactInfo Component
 * Displays patient contact information
 */

import React from "react";
import { Mail, Phone, MapPin, Calendar } from "lucide-react";
import type { Patient } from "@/types";

interface PatientContactInfoProps {
  patient: Patient;
}

const ContactField = React.memo(
  ({
    icon: Icon,
    label,
    value,
  }: {
    icon: React.ElementType;
    label: string;
    value: string | undefined;
  }) => (
    <div className="flex items-start gap-3">
      <Icon className="h-5 w-5 text-gray-400 mt-0.5" />
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-sm text-gray-900">{value || "Non renseigné"}</p>
      </div>
    </div>
  )
);
ContactField.displayName = "ContactField";

export const PatientContactInfo = React.memo(
  ({ patient }: PatientContactInfoProps) => (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
        <Mail className="h-5 w-5 mr-2 text-blue-600" />
        Informations de contact
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ContactField icon={Mail} label="Email" value={patient.email} />
        <ContactField icon={Phone} label="Téléphone" value={patient.phone} />
        <div className="md:col-span-2">
          <ContactField icon={MapPin} label="Adresse" value={patient.address} />
        </div>
        <ContactField
          icon={Calendar}
          label="Date de naissance"
          value={
            patient.date_of_birth
              ? new Date(patient.date_of_birth).toLocaleDateString("fr-FR")
              : undefined
          }
        />
      </div>
    </div>
  )
);
PatientContactInfo.displayName = "PatientContactInfo";
