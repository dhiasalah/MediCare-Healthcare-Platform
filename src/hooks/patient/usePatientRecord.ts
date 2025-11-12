/**
 * usePatientRecord Hook
 * Manages patient record data and doctor assignment
 */

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { showToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/lib/errorHandler";
import type { PatientRecord, AvailableDoctor } from "@/types/patient";

export function usePatientRecord() {
  const [patientRecord, setPatientRecord] = useState<PatientRecord | null>(
    null
  );
  const [hasPatientRecord, setHasPatientRecord] = useState<boolean | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatientRecord = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get("/api/patients/my-record/");
      setPatientRecord(response.data);
      setHasPatientRecord(true);
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 404) {
        setHasPatientRecord(false);
      } else {
        console.error("Error fetching patient record:", error);
        const errorMessage = getErrorMessage(error);
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPatientRecord = () => {
    fetchPatientRecord();
  };

  useEffect(() => {
    fetchPatientRecord();
  }, []);

  return {
    patientRecord,
    hasPatientRecord,
    isLoading,
    error,
    refreshPatientRecord,
  };
}

export function useAvailableDoctors() {
  const [doctors, setDoctors] = useState<AvailableDoctor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctors = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get("/api/accounts/doctors/available/");
      setDoctors(response.data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      showToast.error("Erreur", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return {
    doctors,
    isLoading,
    error,
    refetchDoctors: fetchDoctors,
  };
}

export function useAssignDoctor() {
  const [isAssigning, setIsAssigning] = useState(false);

  const assignDoctor = async (doctorId: number): Promise<boolean> => {
    setIsAssigning(true);

    try {
      const response = await api.post("/api/patients/assign-doctor/", {
        doctor_id: doctorId,
      });

      showToast.success(response.data.message || "Médecin assigné avec succès");
      return true;
    } catch (error: unknown) {
      console.error("Error assigning doctor:", error);
      const errorMessage = getErrorMessage(error);
      showToast.error("Erreur", errorMessage);
      return false;
    } finally {
      setIsAssigning(false);
    }
  };

  return {
    assignDoctor,
    isAssigning,
  };
}
