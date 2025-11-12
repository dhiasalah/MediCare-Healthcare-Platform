/**
 * Patient Space Types
 * All interfaces and types related to patient functionality
 */

export interface PatientRecord {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  blood_type: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relation: string;
  insurance_number: string;
  insurance_provider: string;
  allergies: string;
  medical_history: string;
  current_medications: string;
  primary_doctor: number;
  primary_doctor_name: string;
  created_at: string;
  updated_at: string;
}

export interface AvailableDoctor {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  specialization: string;
  patient_count: number;
  available_slots: number;
}

export interface PatientDocument {
  id: number;
  patient: number;
  patient_name: string;
  uploaded_by: number | null;
  uploaded_by_name: string;
  document_type: string;
  title: string;
  description: string;
  file: string;
  file_url: string;
  file_size: string;
  file_extension: string;
  related_specialist: number | null;
  specialist_name: string | null;
  is_visible_to_all_doctors: boolean;
  uploaded_at: string;
  updated_at: string;
}

export interface ReferralPDF {
  id: number;
  patient_specialist: number;
  patient_name: string;
  specialist_name: string;
  assigned_by_name: string;
  pdf_file: string;
  pdf_url: string;
  generated_at: string;
  patient_summary: string;
  referral_reason: string;
  additional_notes: string;
}

export interface DocumentUploadData {
  title: string;
  description: string;
  document_type: string;
  file: File | null;
}

export interface Specialist {
  id: number;
  specialist: number;
  specialist_name: string;
  specialist_specialization: string;
  assigned_at: string;
  assigned_by: number;
  assigned_by_name: string;
  status: "active" | "inactive";
  referral_pdf: string | null;
  referral_pdf_url: string | null;
}

export interface Appointment {
  id: number;
  patient: number;
  patient_name: string;
  doctor: number;
  doctor_name: string;
  appointment_date: string;
  appointment_time: string;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  reason: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface TimeSlot {
  id: number;
  doctor: number;
  doctor_name: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  appointment: number | null;
}

export const DOCUMENT_TYPES = [
  { value: "medical_test", label: "Résultat de test médical" },
  { value: "prescription", label: "Ordonnance" },
  { value: "medical_image", label: "Image médicale" },
  { value: "report", label: "Rapport médical" },
  { value: "insurance", label: "Document d'assurance" },
  { value: "other", label: "Autre" },
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number]["value"];
