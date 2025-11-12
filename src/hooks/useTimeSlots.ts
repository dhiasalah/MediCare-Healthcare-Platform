import { useState, useEffect } from "react";
import { timeSlotsAPI } from "@/lib/api";
import { TimeSlot } from "@/types";
import { getErrorMessage } from "@/lib/errorHandler";

export function useTimeSlots() {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeSlots = async (params?: {
    date?: string;
    doctor_id?: number;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await timeSlotsAPI.getAll(params);
      console.log("TimeSlots API response:", data);
      // Ensure data is always an array
      const timeSlotArray = Array.isArray(data)
        ? data
        : (data as { results?: unknown[]; timeSlots?: unknown[] })?.results ||
          (data as { results?: unknown[]; timeSlots?: unknown[] })?.timeSlots ||
          [];
      setTimeSlots(timeSlotArray);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      console.error("Error fetching time slots:", error);
      // Set empty array on error to prevent map error
      setTimeSlots([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createTimeSlot = async (timeSlotData: {
    doctor: number;
    date: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      const newTimeSlot = await timeSlotsAPI.create(timeSlotData);
      setTimeSlots((prev) => [...prev, newTimeSlot]);
      return newTimeSlot;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTimeSlot = async (
    id: number,
    timeSlotData: Partial<{
      date: string;
      start_time: string;
      end_time: string;
      is_available: boolean;
      duration_minutes: number;
    }>
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedTimeSlot = await timeSlotsAPI.update(id, timeSlotData);
      setTimeSlots((prev) =>
        prev.map((slot) => (slot.id === id ? updatedTimeSlot : slot))
      );
      return updatedTimeSlot;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTimeSlot = async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      await timeSlotsAPI.delete(id);
      setTimeSlots((prev) => prev.filter((slot) => slot.id !== id));
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getDoctorAvailability = async (doctorId: number, date: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const availability = await timeSlotsAPI.getDoctorAvailability(
        doctorId,
        date
      );
      return availability;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const bulkCreateSlots = async (bulkData: {
    date: string;
    start_time: string;
    end_time: string;
    slot_duration: number;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      const createdSlots = await timeSlotsAPI.createBulk(bulkData);
      await fetchTimeSlots(); // Refresh the list
      return createdSlots;
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
    fetchTimeSlots();
  }, []);

  return {
    timeSlots,
    isLoading,
    error,
    fetchTimeSlots,
    createTimeSlot,
    updateTimeSlot,
    deleteTimeSlot,
    getDoctorAvailability,
    bulkCreateSlots,
    clearError,
  };
}
