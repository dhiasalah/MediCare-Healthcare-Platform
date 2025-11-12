// User types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: "doctor" | "patient" | "admin";
  phone?: string;
  date_of_birth?: string;
  address?: string;
  medical_license_number?: string;
  specialization?: string;
  medical_history?: string;
  allergies?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  created_at: string;
  updated_at: string;
  full_name: string;
}

// Patient types
export interface Patient {
  id: number;
  // Personal Information (from backend Patient model)
  first_name: string;
  last_name: string;
  full_name?: string;
  email?: string;
  phone: string;
  date_of_birth: string;
  age?: number;
  gender: "M" | "F" | "O";
  address: string;
  // Medical information
  medical_history?: string;
  allergies?: string;
  current_medications?: string;
  blood_type?: string;
  // Emergency contact fields
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relation: string;
  // Insurance information
  insurance_provider?: string;
  insurance_number?: string;
  // System fields
  doctor: number;
  doctor_name?: string;
  primary_doctor?: number;
  specialists?: PatientSpecialist[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Time slot types
export interface TimeSlot {
  id: number;
  doctor: number;
  doctor_name: string;
  doctor_specialization: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  duration_minutes: number;
  is_past: boolean;
  created_at: string;
  updated_at: string;
}

// Appointment types
export interface Appointment {
  id: number;
  patient: number;
  patient_info: User;
  doctor: number;
  doctor_info: User;
  time_slot: number;
  time_slot_info: TimeSlot;
  consultation_type:
    | "general"
    | "follow_up"
    | "emergency"
    | "routine_checkup"
    | "specialist";
  consultation_type_display: string;
  status:
    | "scheduled"
    | "confirmed"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "no_show";
  status_display: string;
  reason_for_visit: string;
  symptoms: string;
  priority: "low" | "medium" | "high" | "urgent";
  priority_display: string;
  contact_phone: string;
  patient_notes: string;
  doctor_notes: string;
  appointment_datetime: string;
  is_upcoming: boolean;
  is_today: boolean;
  can_cancel: boolean;
  created_at: string;
  updated_at: string;
  created_by?: number;
}

// Consultation types
export interface Consultation {
  id: number;
  appointment: number;
  appointment_info: Appointment;
  patient_info: User;
  doctor_info: User;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  status_display: string;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  chief_complaint: string;
  history_of_present_illness: string;
  vital_signs: Record<string, string | number | boolean | null>;
  vital_signs_summary?: string[];
  physical_examination: string;
  assessment: string;
  diagnosis: string;
  treatment_plan: string;
  prescriptions: string;
  follow_up_instructions: string;
  next_appointment_recommended: boolean;
  follow_up_date?: string;
  doctor_notes: string;
  detailed_vitals: VitalSigns[];
  detailed_prescriptions: Prescription[];
  notes: ConsultationNote[];
  created_at: string;
  updated_at: string;
  created_by?: number;
}

// Vital Signs types
export interface VitalSigns {
  id: number;
  systolic_bp?: number;
  diastolic_bp?: number;
  heart_rate?: number;
  temperature?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  bmi_status?: string;
  recorded_at: string;
  recorded_by: number;
  recorded_by_name: string;
}

// Prescription types
export interface Prescription {
  id: number;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  medication_type:
    | "tablet"
    | "capsule"
    | "syrup"
    | "injection"
    | "cream"
    | "drops"
    | "other";
  medication_type_display: string;
  quantity?: number;
  is_active: boolean;
  created_at: string;
}

// Consultation Note types
export interface ConsultationNote {
  id: number;
  note_type:
    | "assessment"
    | "plan"
    | "follow_up"
    | "lab_results"
    | "imaging"
    | "referral"
    | "general";
  note_type_display: string;
  title: string;
  content: string;
  created_at: string;
  created_by: number;
  created_by_name: string;
}

// API Response types
export interface APIResponse<T> {
  status: string;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

// Statistics types
export interface AppointmentStatistics {
  total_appointments: number;
  scheduled_appointments: number;
  completed_appointments: number;
  cancelled_appointments: number;
  today_appointments: number;
  upcoming_appointments: number;
  this_month_total: number;
  last_month_total: number;
  popular_time_slots: Array<{
    time_slot__start_time: string;
    count: number;
  }>;
}

export interface ConsultationStatistics {
  total_consultations: number;
  completed_consultations: number;
  in_progress_consultations: number;
  scheduled_consultations: number;
  today_consultations: number;
  this_month_consultations: number;
  average_duration_minutes: number;
  common_diagnoses: Array<{
    diagnosis: string;
    count: number;
  }>;
}

// Form data types
export interface PatientFormData {
  // User fields
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  date_of_birth: string;
  gender: "M" | "F" | "O" | "";
  address: string;
  // Emergency contact fields
  emergency_contact?: string; // deprecated - keeping for backward compatibility
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relation: string;
  // Medical information
  allergies?: string;
  medical_history?: string;
  blood_type?: string;
  // Insurance information
  insurance_number?: string;
  insurance_provider?: string;
}

export interface AppointmentFormData {
  patient: number;
  doctor: number;
  time_slot: number;
  consultation_type: string;
  reason_for_visit: string;
  symptoms: string;
  priority: string;
  contact_phone: string;
  patient_notes: string;
}

export interface TimeSlotFormData {
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
}

export interface BulkTimeSlotFormData {
  date: string;
  start_time: string;
  end_time: string;
  slot_duration: number;
}

export interface ConsultationFormData {
  appointment: number;
  chief_complaint: string;
  history_of_present_illness: string;
  vital_signs: Record<string, string | number | boolean | null>;
}

export interface VitalSignsFormData {
  systolic_bp?: number;
  diastolic_bp?: number;
  heart_rate?: number;
  temperature?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
  weight?: number;
  height?: number;
}

export interface PrescriptionFormData {
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  medication_type: string;
  quantity?: number;
}

export interface ConsultationNoteFormData {
  note_type: string;
  title: string;
  content: string;
}

// Auth types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  user_type: "doctor" | "patient";
  medical_license_number?: string;
  specialization?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
}

// Specialist types
export interface PatientSpecialist {
  id: number;
  patient: number;
  patient_name: string;
  specialist: number;
  specialist_name: string;
  specialist_specialization: string;
  specialist_email: string;
  specialist_phone: string;
  assigned_by: number;
  assigned_by_name: string;
  reason: string;
  status: "active" | "completed" | "cancelled";
  notes?: string;
  assigned_at: string;
  updated_at: string;
}

export interface Specialization {
  value: string;
  label: string;
}

export const SPECIALIZATIONS: Specialization[] = [
  { value: "general", label: "Médecin Généraliste" },
  { value: "cardiology", label: "Cardiologie" },
  { value: "dermatology", label: "Dermatologie" },
  { value: "pediatrics", label: "Pédiatrie" },
  { value: "gynecology", label: "Gynécologie" },
  { value: "ophthalmology", label: "Ophtalmologie" },
  { value: "psychiatry", label: "Psychiatrie" },
  { value: "orthopedics", label: "Orthopédie" },
  { value: "neurology", label: "Neurologie" },
  { value: "oncology", label: "Oncologie" },
  { value: "endocrinology", label: "Endocrinologie" },
  { value: "gastroenterology", label: "Gastro-entérologie" },
  { value: "pulmonology", label: "Pneumologie" },
  { value: "nephrology", label: "Néphrologie" },
  { value: "rheumatology", label: "Rhumatologie" },
  { value: "urology", label: "Urologie" },
  { value: "radiology", label: "Radiologie" },
  { value: "anesthesiology", label: "Anesthésie" },
  { value: "emergency", label: "Médecine d'urgence" },
  { value: "other", label: "Autre" },
];

// Doctor Schedule Types
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Monday, 1=Tuesday, ..., 6=Sunday

export interface DoctorWeeklySchedule {
  id: number;
  doctor: number;
  doctor_name?: string;
  day_of_week: DayOfWeek;
  day_name?: string;
  is_available: boolean;
  morning_start?: string | null; // HH:MM:SS format
  morning_end?: string | null;
  afternoon_start?: string | null;
  afternoon_end?: string | null;
  appointment_duration: number; // in minutes (15, 30, 45, 60)
}

export interface DoctorWeeklyScheduleCreate {
  day_of_week: DayOfWeek;
  is_available: boolean;
  morning_start?: string | null;
  morning_end?: string | null;
  afternoon_start?: string | null;
  afternoon_end?: string | null;
  appointment_duration?: number;
}

export interface BulkScheduleUpdate {
  schedules: DoctorWeeklyScheduleCreate[];
}

export interface DoctorDayOff {
  id: number;
  doctor: number;
  doctor_name?: string;
  date: string; // YYYY-MM-DD format
  is_full_day: boolean;
  unavailable_start?: string | null; // HH:MM:SS format
  unavailable_end?: string | null;
  reason?: string;
}

export interface DoctorDayOffCreate {
  date: string;
  is_full_day: boolean;
  unavailable_start?: string | null;
  unavailable_end?: string | null;
  reason?: string;
}

export interface DoctorExceptionalSchedule {
  id: number;
  doctor: number;
  doctor_name?: string;
  date: string; // YYYY-MM-DD format
  morning_start?: string | null; // HH:MM:SS format
  morning_end?: string | null;
  afternoon_start?: string | null;
  afternoon_end?: string | null;
  appointment_duration: number;
  reason?: string;
}

export interface DoctorExceptionalScheduleCreate {
  date: string;
  morning_start?: string | null;
  morning_end?: string | null;
  afternoon_start?: string | null;
  afternoon_end?: string | null;
  appointment_duration?: number;
  reason?: string;
}

export interface AvailabilityCheck {
  available: boolean;
  day_off?: DoctorDayOff;
}

export interface InitializeScheduleRequest {
  morning_start?: string;
  morning_end?: string;
  afternoon_start?: string;
  afternoon_end?: string;
  appointment_duration?: number;
}

// Day names in French
export const DAY_NAMES: Record<DayOfWeek, string> = {
  0: "Lundi",
  1: "Mardi",
  2: "Mercredi",
  3: "Jeudi",
  4: "Vendredi",
  5: "Samedi",
  6: "Dimanche",
};

// Appointment duration options
export const APPOINTMENT_DURATIONS = [
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "1 heure" },
];
