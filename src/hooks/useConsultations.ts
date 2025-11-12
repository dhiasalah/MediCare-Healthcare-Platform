import { useState, useEffect } from "react";
import { consultationsAPI } from "@/lib/api";
import { Consultation, ConsultationFormData } from "@/types";
import { getErrorMessage } from "@/lib/errorHandler";

export function useConsultations() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConsultations = async (params?: Record<string, unknown>) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await consultationsAPI.getAll(params);
      setConsultations(data);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      console.error("Error fetching consultations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createConsultation = async (consultationData: ConsultationFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      const newConsultation = await consultationsAPI.create(consultationData);
      setConsultations((prev) => [...prev, newConsultation]);
      return newConsultation;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateConsultation = async (
    id: number,
    consultationData: Partial<ConsultationFormData>
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedConsultation = await consultationsAPI.update(
        id,
        consultationData
      );
      setConsultations((prev) =>
        prev.map((cons) => (cons.id === id ? updatedConsultation : cons))
      );
      return updatedConsultation;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const startConsultation = async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const startedConsultation = await consultationsAPI.start(id);
      setConsultations((prev) =>
        prev.map((cons) => (cons.id === id ? startedConsultation : cons))
      );
      return startedConsultation;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const completeConsultation = async (
    id: number,
    completionData: Record<string, unknown>
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      const completedConsultation = await consultationsAPI.complete(
        id,
        completionData
      );
      setConsultations((prev) =>
        prev.map((cons) => (cons.id === id ? completedConsultation : cons))
      );
      return completedConsultation;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getConsultationById = async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const consultation = await consultationsAPI.getById(id);
      return consultation;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  return {
    consultations,
    isLoading,
    error,
    fetchConsultations,
    createConsultation,
    updateConsultation,
    startConsultation,
    completeConsultation,
    getConsultationById,
    clearError,
  };
}
