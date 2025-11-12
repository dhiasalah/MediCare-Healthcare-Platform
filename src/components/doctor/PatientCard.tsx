/**
 * PatientCard Component
 * Optimized patient card with memoization
 */

"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import type { Patient } from "@/types";
import {
  PatientCardAvatar,
  PatientCardHeader,
  PatientCardContact,
  PatientCardActions,
  PatientCardFooter,
} from "./patient-card";

interface PatientCardProps {
  patient: Patient;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
  onMedicalData?: (patient: Patient) => void;
  onSchedule?: (patient: Patient) => void;
}

export const PatientCard = React.memo(
  ({
    patient,
    onEdit,
    onDelete,
    onMedicalData,
    onSchedule,
  }: PatientCardProps) => {
    const router = useRouter();

    const handleView = useCallback(() => {
      router.push(`/espace-medecin/patients/${patient.id}`);
    }, [router, patient.id]);

    return (
      <Card className="p-4 hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
        <div className="flex items-start justify-between">
          {/* Patient Info */}
          <div className="flex items-start space-x-4 flex-1">
            <PatientCardAvatar patient={patient} />
            <div className="flex-1 min-w-0">
              <PatientCardHeader patient={patient} />
              <PatientCardContact patient={patient} />
              {patient.medical_history && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 line-clamp-2">
                    <span className="font-medium">Antécédents:</span>{" "}
                    {patient.medical_history}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <PatientCardActions
            patient={patient}
            onView={handleView}
            onEdit={onEdit}
            onDelete={onDelete}
            onMedicalData={onMedicalData}
            onSchedule={onSchedule}
          />
        </div>

        {/* Footer */}
        <PatientCardFooter patient={patient} />
      </Card>
    );
  }
);
PatientCard.displayName = "PatientCard";
