import { useState, useEffect } from "react";
import { appointmentsAPI } from "@/lib/api";
import { Appointment, AppointmentFormData } from "@/types";
import { showToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/lib/errorHandler";

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await appointmentsAPI.getAll();
      // Ensure data is always an array
      const appointmentsArray = Array.isArray(data) ? data : [];
      setAppointments(appointmentsArray);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      console.error("Error fetching appointments:", error);
      setAppointments([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const createAppointment = async (appointmentData: AppointmentFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      const newAppointment = await appointmentsAPI.create(appointmentData);
      setAppointments((prev) => [...prev, newAppointment]);
      showToast.success(
        "Rendez-vous créé",
        "Le rendez-vous a été créé avec succès"
      );
      return newAppointment;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      showToast.error("Erreur", errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAppointment = async (
    id: number,
    appointmentData: Partial<AppointmentFormData>
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedAppointment = await appointmentsAPI.update(
        id,
        appointmentData
      );
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? updatedAppointment : apt))
      );
      return updatedAppointment;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAppointment = async (id: number, reason?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await appointmentsAPI.cancel(id, reason);
      // Update appointment status instead of removing from list
      await fetchAppointments();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const completeAppointment = async (id: number, doctorNotes?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const completedAppointment = await appointmentsAPI.complete(
        id,
        doctorNotes
      );
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? completedAppointment : apt))
      );
      showToast.success(
        "Rendez-vous terminé",
        "Le rendez-vous a été marqué comme terminé"
      );
      return completedAppointment;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      showToast.error("Erreur", errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const rescheduleAppointment = async (id: number, newTimeSlotId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const rescheduledAppointment = await appointmentsAPI.reschedule(
        id,
        newTimeSlotId
      );
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? rescheduledAppointment : apt))
      );
      return rescheduledAppointment;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelAppointment = async (id: number, reason?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const cancelledAppointment = await appointmentsAPI.cancel(id, reason);
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? cancelledAppointment : apt))
      );
      showToast.success(
        "Rendez-vous annulé",
        "Le rendez-vous a été annulé avec succès"
      );
      return cancelledAppointment;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      showToast.error("Erreur", errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return {
    appointments,
    isLoading,
    error,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    completeAppointment,
    rescheduleAppointment,
    cancelAppointment,
    clearError,
  };
}
