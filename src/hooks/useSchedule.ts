import { useState, useCallback } from "react";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/errorHandler";
import {
  DoctorWeeklySchedule,
  DoctorWeeklyScheduleCreate,
  BulkScheduleUpdate,
  DoctorDayOff,
  DoctorDayOffCreate,
  DoctorExceptionalSchedule,
  DoctorExceptionalScheduleCreate,
  AvailabilityCheck,
  InitializeScheduleRequest,
} from "@/types";

// Hook for managing weekly schedules
export const useWeeklySchedule = () => {
  const [schedules, setSchedules] = useState<DoctorWeeklySchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMySchedule = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<DoctorWeeklySchedule[]>(
        "/api/appointments/weekly-schedules/my_schedule/"
      );
      setSchedules(response.data);
      return response.data;
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDoctorSchedule = useCallback(async (doctorId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<DoctorWeeklySchedule[]>(
        `/api/appointments/weekly-schedules/doctor_schedule/?doctor_id=${doctorId}`
      );
      setSchedules(response.data);
      return response.data;
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const initializeSchedule = useCallback(
    async (data?: InitializeScheduleRequest) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.post<{
          message: string;
          schedules: DoctorWeeklySchedule[];
        }>(
          "/api/appointments/weekly-schedules/initialize_schedule/",
          data || {}
        );
        setSchedules(response.data.schedules);
        return response.data;
      } catch (err) {
        const errorMsg = getErrorMessage(err);
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const bulkUpdateSchedule = useCallback(async (data: BulkScheduleUpdate) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put<DoctorWeeklySchedule[]>(
        "/api/appointments/weekly-schedules/bulk_update/",
        data
      );
      setSchedules(response.data);
      return response.data;
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      console.error("Bulk update error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createSchedule = useCallback(
    async (data: DoctorWeeklyScheduleCreate) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.post<DoctorWeeklySchedule>(
          "/api/appointments/weekly-schedules/",
          data
        );
        await fetchMySchedule();
        return response.data;
      } catch (err) {
        const errorMsg = getErrorMessage(err);
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchMySchedule]
  );

  const updateSchedule = useCallback(
    async (id: number, data: Partial<DoctorWeeklyScheduleCreate>) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.patch<DoctorWeeklySchedule>(
          `/api/appointments/weekly-schedules/${id}/`,
          data
        );
        setSchedules((prev) =>
          prev.map((s) => (s.id === id ? response.data : s))
        );
        return response.data;
      } catch (err) {
        const errorMsg = getErrorMessage(err);
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteSchedule = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/api/appointments/weekly-schedules/${id}/`);
      setSchedules((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    schedules,
    loading,
    error,
    fetchMySchedule,
    fetchDoctorSchedule,
    initializeSchedule,
    bulkUpdateSchedule,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  };
};

// Hook for managing days off (congés)
export const useDaysOff = () => {
  const [daysOff, setDaysOff] = useState<DoctorDayOff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyDaysOff = useCallback(async (upcoming = false) => {
    setLoading(true);
    setError(null);
    try {
      const url = upcoming
        ? "/api/appointments/days-off/my_days_off/?upcoming=true"
        : "/api/appointments/days-off/my_days_off/";
      const response = await api.get<DoctorDayOff[]>(url);
      setDaysOff(response.data);
      return response.data;
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des congés";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDoctorDaysOff = useCallback(
    async (doctorId: number, upcoming = false) => {
      setLoading(true);
      setError(null);
      try {
        const upcomingParam = upcoming ? "&upcoming=true" : "";
        const response = await api.get<DoctorDayOff[]>(
          `/api/appointments/days-off/doctor_days_off/?doctor_id=${doctorId}${upcomingParam}`
        );
        setDaysOff(response.data);
        return response.data;
      } catch (err) {
        const errorMsg = getErrorMessage(err);
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const checkAvailability = useCallback(async (date: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<AvailabilityCheck>(
        `/api/appointments/days-off/check_availability/?date=${date}`
      );
      return response.data;
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createDayOff = useCallback(async (data: DoctorDayOffCreate) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post<DoctorDayOff>(
        "/api/appointments/days-off/",
        data
      );
      setDaysOff((prev) => [...prev, response.data]);
      return response.data;
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDayOff = useCallback(
    async (id: number, data: Partial<DoctorDayOffCreate>) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.patch<DoctorDayOff>(
          `/api/appointments/days-off/${id}/`,
          data
        );
        setDaysOff((prev) =>
          prev.map((d) => (d.id === id ? response.data : d))
        );
        return response.data;
      } catch (err) {
        const errorMsg = getErrorMessage(err);
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteDayOff = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/api/appointments/days-off/${id}/`);
      setDaysOff((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    daysOff,
    loading,
    error,
    fetchMyDaysOff,
    fetchDoctorDaysOff,
    checkAvailability,
    createDayOff,
    updateDayOff,
    deleteDayOff,
  };
};

// Hook for managing exceptional schedules
export const useExceptionalSchedules = () => {
  const [exceptionalSchedules, setExceptionalSchedules] = useState<
    DoctorExceptionalSchedule[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyExceptionalSchedules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<DoctorExceptionalSchedule[]>(
        "/api/appointments/exceptional-schedules/my_exceptional_schedules/"
      );
      setExceptionalSchedules(response.data);
      return response.data;
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDoctorExceptionalSchedules = useCallback(
    async (doctorId: number) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<DoctorExceptionalSchedule[]>(
          `/api/appointments/exceptional-schedules/doctor_exceptional_schedules/?doctor_id=${doctorId}`
        );
        setExceptionalSchedules(response.data);
        return response.data;
      } catch (err) {
        const errorMsg = getErrorMessage(err);
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createExceptionalSchedule = useCallback(
    async (data: DoctorExceptionalScheduleCreate) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.post<DoctorExceptionalSchedule>(
          "/api/appointments/exceptional-schedules/",
          data
        );
        setExceptionalSchedules((prev) => [...prev, response.data]);
        return response.data;
      } catch (err) {
        const errorMsg = getErrorMessage(err);
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateExceptionalSchedule = useCallback(
    async (id: number, data: Partial<DoctorExceptionalScheduleCreate>) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.patch<DoctorExceptionalSchedule>(
          `/api/appointments/exceptional-schedules/${id}/`,
          data
        );
        setExceptionalSchedules((prev) =>
          prev.map((e) => (e.id === id ? response.data : e))
        );
        return response.data;
      } catch (err) {
        const errorMsg = getErrorMessage(err);
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteExceptionalSchedule = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/api/appointments/exceptional-schedules/${id}/`);
      setExceptionalSchedules((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    exceptionalSchedules,
    loading,
    error,
    fetchMyExceptionalSchedules,
    fetchDoctorExceptionalSchedules,
    createExceptionalSchedule,
    updateExceptionalSchedule,
    deleteExceptionalSchedule,
  };
};
