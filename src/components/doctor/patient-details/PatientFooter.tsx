/**
 * PatientFooter Component
 * Displays patient creation date
 */

import React from "react";
import type { Patient } from "@/types";

interface PatientFooterProps {
  patient: Patient;
}

export const PatientFooter = React.memo(({ patient }: PatientFooterProps) => (
  <div className="text-center text-xs text-gray-500 pt-4 border-t">
    Patient créé le{" "}
    {new Date(patient.created_at).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}
  </div>
));
PatientFooter.displayName = "PatientFooter";
