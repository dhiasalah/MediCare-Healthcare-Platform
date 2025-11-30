import { useState, useEffect } from "react";
import api from "@/lib/api";
import { showToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/lib/errorHandler";
import type { Medicament } from "@/types/patient";

export function useMedicaments() {
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedicaments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get("/api/patients/my-medicaments/");
      setMedicaments(response.data);
    } catch (error: unknown) {
      console.error("Error fetching medicaments:", error);
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      showToast.error("Erreur", "Impossible de charger vos médicaments");
    } finally {
      setIsLoading(false);
    }
  };

  const addMedicament = async (data: Partial<Medicament>) => {
    try {
      const response = await api.post("/api/patients/medicaments/", data);
      setMedicaments([...medicaments, response.data]);
      showToast.success("Médicament ajouté avec succès");
      return true;
    } catch (error: unknown) {
      console.error("Error adding medicament:", error);
      const errorMessage = getErrorMessage(error);
      showToast.error("Erreur", errorMessage);
      return false;
    }
  };

  const updateMedicament = async (id: number, data: Partial<Medicament>) => {
    try {
      const response = await api.patch(`/api/patients/medicaments/${id}/`, data);
      setMedicaments(medicaments.map(m => m.id === id ? response.data : m));
      showToast.success("Médicament mis à jour");
      return true;
    } catch (error: unknown) {
      console.error("Error updating medicament:", error);
      const errorMessage = getErrorMessage(error);
      showToast.error("Erreur", errorMessage);
      return false;
    }
  };

  const deleteMedicament = async (id: number) => {
    try {
      await api.delete(`/api/patients/medicaments/${id}/`);
      setMedicaments(medicaments.filter(m => m.id !== id));
      showToast.success("Médicament supprimé");
      return true;
    } catch (error: unknown) {
      console.error("Error deleting medicament:", error);
      const errorMessage = getErrorMessage(error);
      showToast.error("Erreur", errorMessage);
      return false;
    }
  };

  useEffect(() => {
    fetchMedicaments();
  }, []);

  return {
    medicaments,
    isLoading,
    error,
    fetchMedicaments,
    addMedicament,
    updateMedicament,
    deleteMedicament
  };
}
