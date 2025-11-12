import { useState, useEffect } from "react";
import { patientsAPI } from "@/lib/api";
import type { Patient, PatientFormData } from "@/types";
import { showToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/lib/errorHandler";

export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all patients
  const fetchPatients = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await patientsAPI.getAll();
      setPatients(response.results || response); // Handle both paginated and direct responses
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      console.error("Error fetching patients:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Create patient
  const createPatient = async (
    patientData: PatientFormData
  ): Promise<Patient | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const newPatient = await patientsAPI.create(patientData);

      // Refresh the patients list
      await fetchPatients();

      showToast.success(
        "Patient créé",
        `Le patient ${
          newPatient.full_name || newPatient.first_name
        } a été créé avec succès`
      );
      return newPatient;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      showToast.error("Erreur", errorMessage);
      console.error("Error creating patient:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update patient
  const updatePatient = async (
    id: number,
    patientData: Partial<PatientFormData>
  ): Promise<Patient | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedPatient = await patientsAPI.update(id, patientData);

      // Update the patients list locally
      setPatients((prev) =>
        prev.map((patient) => (patient.id === id ? updatedPatient : patient))
      );

      return updatedPatient;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      console.error("Error updating patient:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete patient
  const deletePatient = async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await patientsAPI.delete(id);

      // Remove from local state
      setPatients((prev) => prev.filter((patient) => patient.id !== id));

      showToast.success(
        "Patient supprimé",
        "Le patient a été supprimé avec succès"
      );
      return true;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      showToast.error("Erreur", errorMessage);
      console.error("Error deleting patient:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Load patients on mount
  useEffect(() => {
    fetchPatients();
  }, []);

  return {
    patients,
    isLoading,
    error,
    fetchPatients,
    createPatient,
    updatePatient,
    deletePatient,
    clearError,
  };
};
