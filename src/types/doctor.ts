/**
 * Doctor Space Types
 * Type definitions for doctor-specific features
 */

export interface DoctorStats {
  patientsToday: number;
  patientsTodayChange: number;
  consultationsCompleted: number;
  appointmentsPending: number;
  urgentCases: number;
}

export interface QuickAccessCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  nextItem?: string;
}

export interface RecentActivity {
  id: number;
  type: "appointment" | "consultation" | "patient_added" | "prescription";
  title: string;
  description: string;
  time: string;
  icon: string;
  color: string;
}

export interface UpcomingAppointment {
  id: number;
  patientName: string;
  time: string;
  type: string;
  status: "confirmed" | "pending" | "cancelled";
}

// Re-export patient-related types that doctors use
export type { Patient, Appointment, Consultation } from "@/types";
