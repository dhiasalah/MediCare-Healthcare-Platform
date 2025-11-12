/**
 * useDoctorStats Hook
 * Manages doctor dashboard statistics
 */

import { useState, useEffect } from "react";
// import api from "@/lib/api";
import type { DoctorStats } from "@/types/doctor";

export function useDoctorStats() {
  const [stats, setStats] = useState<DoctorStats>({
    patientsToday: 0,
    patientsTodayChange: 0,
    consultationsCompleted: 0,
    appointmentsPending: 0,
    urgentCases: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API endpoint when available
      // const response = await api.get("/api/doctors/dashboard/stats/");
      // setStats(response.data);

      // Mock data for now
      setStats({
        patientsToday: 12,
        patientsTodayChange: 2,
        consultationsCompleted: 8,
        appointmentsPending: 4,
        urgentCases: 2,
      });

      setError(null);
    } catch (err) {
      console.error("Error fetching doctor stats:", err);
      setError("Failed to load statistics");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
}
