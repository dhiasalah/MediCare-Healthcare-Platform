/**
 * PatientCardAvatar Component
 * Displays patient avatar with initials
 */

import React from "react";
import type { Patient } from "@/types";

interface PatientCardAvatarProps {
  patient: Patient;
}

export const PatientCardAvatar = React.memo(
  ({ patient }: PatientCardAvatarProps) => {
    const initials = `${patient.first_name?.[0] || ""}${
      patient.last_name?.[0] || ""
    }`.toUpperCase();

    return (
      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
        <span className="text-white font-semibold text-lg">{initials}</span>
      </div>
    );
  }
);
PatientCardAvatar.displayName = "PatientCardAvatar";
