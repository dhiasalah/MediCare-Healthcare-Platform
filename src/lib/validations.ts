import { z } from "zod";

// ==================== AUTH SCHEMAS ====================

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Format d'email invalide"),
  password: z
    .string()
    .min(1, "Le mot de passe est requis")
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export const signupSchema = z
  .object({
    // Account credentials
    username: z
      .string()
      .min(1, "Le nom d'utilisateur est requis")
      .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Le nom d'utilisateur ne peut contenir que des lettres, chiffres et underscores"
      ),
    email: z
      .string()
      .min(1, "L'email est requis")
      .email("Format d'email invalide"),
    password: z
      .string()
      .min(1, "Le mot de passe est requis")
      .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    password_confirm: z.string().min(1, "Veuillez confirmer le mot de passe"),

    // Basic info
    first_name: z.string().min(1, "Le prénom est requis"),
    last_name: z.string().min(1, "Le nom est requis"),
    user_type: z.enum(["patient", "doctor", "admin"]),
    phone: z.string().min(1, "Le téléphone est requis"),
    date_of_birth: z.string().min(1, "La date de naissance est requise"),
    address: z.string().min(1, "L'adresse est requise"),

    // Doctor-specific fields (optional, will validate based on user_type)
    medical_license_number: z.string().optional(),
    specialization: z.string().optional(),

    // Patient-specific fields (optional, will validate based on user_type)
    medical_history: z.string().optional(),
    allergies: z.string().optional(),
    emergency_contact_name: z.string().optional(),
    emergency_contact_phone: z.string().optional(),
    doctor_id: z.number().optional(),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "Les mots de passe ne correspondent pas",
    path: ["password_confirm"],
  })
  .refine(
    (data) => {
      if (data.user_type === "doctor") {
        return !!data.medical_license_number && !!data.specialization;
      }
      return true;
    },
    {
      message: "Le numéro de licence médicale est requis pour les médecins",
      path: ["medical_license_number"],
    }
  )
  .refine(
    (data) => {
      if (data.user_type === "doctor") {
        return !!data.specialization;
      }
      return true;
    },
    {
      message: "La spécialisation est requise pour les médecins",
      path: ["specialization"],
    }
  )
  .refine(
    (data) => {
      if (data.user_type === "patient") {
        return !!data.emergency_contact_name && !!data.emergency_contact_phone;
      }
      return true;
    },
    {
      message: "Le contact d'urgence est requis pour les patients",
      path: ["emergency_contact_name"],
    }
  );

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;

// ==================== PATIENT SCHEMAS ====================

export const patientSchema = z.object({
  first_name: z.string().min(1, "Le prénom est requis"),
  last_name: z.string().min(1, "Le nom est requis"),
  email: z
    .string()
    .email("Format d'email invalide")
    .optional()
    .or(z.literal("")),
  phone: z.string().min(1, "Le téléphone est requis"),
  date_of_birth: z.string().min(1, "La date de naissance est requise"),
  gender: z.enum(["M", "F", "O"]).refine((val) => val !== undefined, {
    message: "Le genre est requis",
  }),
  address: z.string().min(1, "L'adresse est requise"),

  // Emergency contact (required)
  emergency_contact_name: z
    .string()
    .min(1, "Le nom du contact d'urgence est requis"),
  emergency_contact_phone: z
    .string()
    .min(1, "Le téléphone du contact d'urgence est requis"),
  emergency_contact_relation: z
    .string()
    .min(1, "Le lien de parenté est requis"),

  // Medical info (optional)
  emergency_contact: z.string().optional(),
  allergies: z.string().optional(),
  medical_history: z.string().optional(),
  blood_type: z.string().optional(),
  insurance_number: z.string().optional(),
  insurance_provider: z.string().optional(),
});

export type PatientFormData = z.infer<typeof patientSchema>;

// ==================== APPOINTMENT SCHEMAS ====================

export const appointmentSchema = z.object({
  patient: z.number().min(1, "Veuillez sélectionner un patient"),
  date: z.string().min(1, "La date est requise"),
  time_slot: z.number().min(1, "Le créneau horaire est requis"),
  reason: z.string().min(1, "Le motif de consultation est requis"),
  notes: z.string().optional(),
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;

// ==================== CONSULTATION SCHEMAS ====================

export const consultationSchema = z.object({
  patient: z.number().min(1, "Veuillez sélectionner un patient"),
  appointment: z.number().optional(),
  date: z.string().min(1, "La date est requise"),
  reason: z.string().min(1, "Le motif est requis"),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  notes: z.string().optional(),
  follow_up_date: z.string().optional(),
});

export type ConsultationFormData = z.infer<typeof consultationSchema>;

// ==================== TIME SLOT SCHEMAS ====================

export const timeSlotSchema = z.object({
  date: z.string().min(1, "La date est requise"),
  start_time: z.string().min(1, "L'heure de début est requise"),
  end_time: z.string().min(1, "L'heure de fin est requise"),
  is_available: z.boolean().default(true),
});

export type TimeSlotFormData = z.infer<typeof timeSlotSchema>;

// ==================== PROFILE SCHEMAS ====================

export const profileSchema = z.object({
  first_name: z.string().min(1, "Le prénom est requis"),
  last_name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Format d'email invalide"),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  address: z.string().optional(),

  // Doctor-specific
  medical_license_number: z.string().optional(),
  specialization: z.string().optional(),

  // Patient-specific
  medical_history: z.string().optional(),
  allergies: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
