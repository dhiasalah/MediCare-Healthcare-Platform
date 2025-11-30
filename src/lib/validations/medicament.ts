import { z } from "zod";

export const medicamentSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom du médicament doit contenir au moins 2 caractères"),
  dosage: z.string().min(1, "Le dosage est requis"),
  frequency: z.string().min(1, "La fréquence est requise"),
  start_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Date invalide",
  }),
  duration_days: z
    .number()
    .min(1, "La durée doit être d'au moins 1 jour")
    .optional()
    .nullable(),
  instructions: z.string().optional(),
});

export type MedicamentFormData = z.infer<typeof medicamentSchema>;
