/**
 * PatientDetailsModal Component
 * Modal for viewing patient details - refactored to use sub-components
 */

import React from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import type { Patient } from "@/types";
import {
  PatientHeader,
  PatientContactInfo,
  PatientMedicalInfo,
  PatientEmergencyContact,
  PatientInsuranceInfo,
  PatientFooter,
} from "./patient-details";

interface PatientDetailsModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

export const PatientDetailsModal = React.memo(
  ({ patient, isOpen, onClose, onEdit }: PatientDetailsModalProps) => {
    if (!patient) return null;

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <PatientHeader patient={patient} onEdit={onEdit} />
          </DialogHeader>

          <div className="space-y-6 mt-6">
            <PatientContactInfo patient={patient} />
            <PatientMedicalInfo patient={patient} />
            <PatientEmergencyContact patient={patient} />
            <PatientInsuranceInfo patient={patient} />
            <PatientFooter patient={patient} />
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);
PatientDetailsModal.displayName = "PatientDetailsModal";
