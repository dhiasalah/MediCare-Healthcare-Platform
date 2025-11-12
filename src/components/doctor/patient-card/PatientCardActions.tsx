/**
 * PatientCardActions Component
 * Action buttons for patient card
 */

import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Eye, Edit, Trash2, Heart } from "lucide-react";
import type { Patient } from "@/types";

interface PatientCardActionsProps {
  patient: Patient;
  onView: () => void;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
  onMedicalData?: (patient: Patient) => void;
  onSchedule?: (patient: Patient) => void;
}

export const PatientCardActions = React.memo(
  ({
    patient,
    onView,
    onEdit,
    onDelete,
    onMedicalData,
    onSchedule,
  }: PatientCardActionsProps) => (
    <div className="flex flex-col gap-2 ml-4">
      <Button size="sm" variant="outline" onClick={onView} className="w-full">
        <Eye className="h-4 w-4 mr-1" />
        Voir
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => onEdit(patient)}
        className="w-full"
      >
        <Edit className="h-4 w-4 mr-1" />
        Modifier
      </Button>
      {onMedicalData && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onMedicalData(patient)}
          className="w-full text-green-600 hover:text-green-700 hover:bg-green-50"
        >
          <Heart className="h-4 w-4 mr-1" />
          Renseigner
        </Button>
      )}
      {onSchedule && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onSchedule(patient)}
          className="w-full text-blue-600 hover:text-blue-700"
        >
          <Calendar className="h-4 w-4 mr-1" />
          RDV
        </Button>
      )}
      <Button
        size="sm"
        variant="outline"
        onClick={() => onDelete(patient)}
        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Supprimer
      </Button>
    </div>
  )
);
PatientCardActions.displayName = "PatientCardActions";
