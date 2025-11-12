"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, User } from "lucide-react";
import { appointmentsAPI } from "@/lib/api";
import { User as UserType } from "@/types";
import { useToast } from "@/hooks/useToast";
import { AppointmentCalendar } from "./AppointmentCalendar";

// Zod validation schema
const appointmentFormSchema = z.object({
  consultation_type: z
    .enum([
      "general",
      "follow_up",
      "emergency",
      "routine_checkup",
      "specialist",
    ])
    .refine((val) => val, "Veuillez sélectionner un type de consultation"),
  reason_for_visit: z
    .string()
    .min(3, "La raison doit contenir au moins 3 caractères")
    .max(500, "La raison ne peut pas dépasser 500 caractères"),
  symptoms: z
    .string()
    .max(1000, "Les symptômes ne peuvent pas dépasser 1000 caractères")
    .optional()
    .or(z.literal("")),
  priority: z
    .enum(["low", "medium", "high", "urgent"])
    .refine((val) => val, "Veuillez sélectionner une priorité"),
  contact_phone: z
    .string()
    .regex(/^[\d+\s\-()]*$/, "Numéro de téléphone invalide")
    .optional()
    .or(z.literal("")),
  patient_notes: z
    .string()
    .max(1000, "Les notes ne peuvent pas dépasser 1000 caractères")
    .optional()
    .or(z.literal("")),
});

type AppointmentFormType = z.infer<typeof appointmentFormSchema>;

interface AppointmentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  patientId: number;
}

export function AppointmentBookingModal({
  isOpen,
  onClose,
  onSuccess,
  patientId,
}: AppointmentBookingModalProps) {
  const { success, error: toastError } = useToast();
  const [step, setStep] = useState(1); // 1: Select Doctor, 2: Select Time Slot, 3: Enter Details
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<UserType[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [availableSlots, setAvailableSlots] = useState<
    Array<{
      id: string;
      doctor_id: number;
      doctor_name: string;
      date: string;
      start_time: string;
      end_time: string;
      is_available: boolean;
      duration_minutes: number;
    }>
  >([]);
  const [selectedSlot, setSelectedSlot] = useState<{
    id: string;
    doctor_id: number;
    doctor_name: string;
    date: string;
    start_time: string;
    end_time: string;
    is_available: boolean;
    duration_minutes: number;
  } | null>(null);

  // Initialize react-hook-form with zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<AppointmentFormType>({
    resolver: zodResolver(appointmentFormSchema),
    mode: "onBlur",
    defaultValues: {
      consultation_type: "general",
      priority: "medium",
      reason_for_visit: "",
      symptoms: "",
      contact_phone: "",
      patient_notes: "",
    },
  });

  const consultationType = watch("consultation_type");
  const priority = watch("priority");

  // Fetch doctors on mount
  useEffect(() => {
    if (isOpen) {
      fetchDoctors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Fetch available slots when doctor is selected
  useEffect(() => {
    if (selectedDoctor && step === 2) {
      fetchAvailableSlots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDoctor, step]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await appointmentsAPI.getAvailableDoctors();
      // Ensure response is an array
      const doctorsArray = Array.isArray(response) ? response : [];
      setDoctors(doctorsArray);
    } catch (err) {
      toastError(
        "Erreur",
        err instanceof Error
          ? err.message
          : "Impossible de charger les médecins"
      );
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching available slots for doctor:", selectedDoctor);
      const response = await appointmentsAPI.getAvailableSlots({
        doctor: selectedDoctor,
        available_only: true,
      });
      // Ensure response is an array
      const slotsArray = Array.isArray(response) ? response : [];
      console.log("✅ Available slots response:", response);
      console.log("📊 Available slots count:", slotsArray.length);
      console.log("📋 Slots array:", slotsArray);
      setAvailableSlots(slotsArray);
    } catch (err) {
      console.error("❌ Error fetching slots:", err);
      toastError(
        "Erreur",
        err instanceof Error
          ? err.message
          : "Impossible de charger les créneaux disponibles"
      );
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (step === 1 && selectedDoctor) {
      setStep(2);
    } else if (step === 2 && selectedSlot) {
      setStep(3);
    }
  };

  const handleBookAppointment = async (data: AppointmentFormType) => {
    if (!selectedDoctor || !selectedSlot) {
      toastError("Erreur", "Veuillez sélectionner un médecin et un créneau");
      return;
    }

    try {
      setLoading(true);

      // Use the new bookWithVirtualSlot endpoint with slot data
      const bookingData = {
        patient: patientId,
        doctor: selectedDoctor,
        date: selectedSlot.date,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        consultation_type: data.consultation_type,
        reason_for_visit: data.reason_for_visit,
        symptoms: data.symptoms || "",
        priority: data.priority,
        contact_phone: data.contact_phone || "",
        patient_notes: data.patient_notes || "",
      };

      await appointmentsAPI.bookWithVirtualSlot(bookingData);
      success("Succès", "Rendez-vous réservé avec succès");
      onSuccess();
      onClose();
      resetForm();
    } catch (err) {
      toastError(
        "Erreur",
        err instanceof Error
          ? err.message
          : "Impossible de réserver le rendez-vous"
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedDoctor(null);
    setSelectedSlot(null);
    reset({
      consultation_type: "general",
      priority: "medium",
      reason_for_visit: "",
      symptoms: "",
      contact_phone: "",
      patient_notes: "",
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getDoctorName = (doctorId: number) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    return doctor?.first_name && doctor?.last_name
      ? `Dr. ${doctor.first_name} ${doctor.last_name}`
      : "Médecin sélectionné";
  };

  const getSlotInfo = (slot: typeof selectedSlot) => {
    if (!slot || typeof slot === "string") {
      return null;
    }
    return slot;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Réserver un rendez-vous</DialogTitle>
          <DialogDescription>
            Étape {step} sur 3 -{" "}
            {step === 1
              ? "Sélectionnez un médecin"
              : step === 2
              ? "Choisissez un créneau"
              : "Complétez vos informations"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: Select Doctor */}
          {step === 1 && (
            <div className="space-y-4">
              <Label>Médecin</Label>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="grid gap-3">
                  {doctors.map((doctor) => (
                    <Card
                      key={doctor.id}
                      className={`p-4 cursor-pointer transition-all ${
                        selectedDoctor === doctor.id
                          ? "bg-blue-50 border-blue-500 border-2"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedDoctor(doctor.id)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            Dr. {doctor.first_name} {doctor.last_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {doctor.specialization ||
                              "Spécialité non spécifiée"}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Time Slot */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Médecin sélectionné:</p>
                <p className="font-semibold text-gray-900">
                  {getDoctorName(selectedDoctor!)}
                </p>
              </div>
              <Label>Sélectionnez une date et un créneau</Label>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : availableSlots.length === 0 ? (
                <p className="text-gray-600 text-center py-8">
                  Aucun créneau disponible pour ce médecin
                </p>
              ) : (
                <AppointmentCalendar
                  slots={availableSlots}
                  selectedSlot={selectedSlot || undefined}
                  onSelectSlot={(slot) =>
                    setSelectedSlot(slot as typeof selectedSlot)
                  }
                />
              )}
            </div>
          )}

          {/* Step 3: Enter Details */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Appointment Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                  Récapitulatif de votre rendez-vous
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Médecin:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {getDoctorName(selectedDoctor!)}
                    </span>
                  </div>
                  {selectedSlot && getSlotInfo(selectedSlot) && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Date:</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {new Date(
                            getSlotInfo(selectedSlot)!.date
                          ).toLocaleDateString("fr-FR", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Horaire:</span>
                        <span className="text-sm font-semibold text-green-600">
                          {getSlotInfo(selectedSlot)!.start_time.substring(
                            0,
                            5
                          )}{" "}
                          -{" "}
                          {getSlotInfo(selectedSlot)!.end_time.substring(0, 5)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Consultation Details Section */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                      1
                    </span>
                    Informations de consultation
                  </h4>
                  <div className="space-y-4 pl-8">
                    <div>
                      <Label htmlFor="consultation_type" className="mb-2 block">
                        Type de consultation
                      </Label>
                      <Select
                        value={consultationType}
                        onValueChange={(value) =>
                          setValue(
                            "consultation_type",
                            value as
                              | "general"
                              | "follow_up"
                              | "emergency"
                              | "routine_checkup"
                              | "specialist"
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">
                            Consultation générale
                          </SelectItem>
                          <SelectItem value="follow_up">Suivi</SelectItem>
                          <SelectItem value="routine_checkup">
                            Visite de routine
                          </SelectItem>
                          <SelectItem value="specialist">
                            Consultation spécialisée
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.consultation_type && (
                        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                          {errors.consultation_type.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="priority" className="mb-2 block">
                        Priorité
                      </Label>
                      <Select
                        value={priority}
                        onValueChange={(value) =>
                          setValue(
                            "priority",
                            value as "low" | "medium" | "high" | "urgent"
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Basse</SelectItem>
                          <SelectItem value="medium">Normal</SelectItem>
                          <SelectItem value="high">Élevée</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.priority && (
                        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                          {errors.priority.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical Information Section */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                      2
                    </span>
                    Informations médicales
                  </h4>
                  <div className="space-y-4 pl-8">
                    <div>
                      <Label htmlFor="reason_for_visit" className="mb-2 block">
                        Raison de la visite{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="reason_for_visit"
                        placeholder="Ex: Mal de tête persistant depuis 3 jours"
                        {...register("reason_for_visit")}
                        className={`mt-0 ${
                          errors.reason_for_visit ? "border-red-500" : ""
                        }`}
                      />
                      {errors.reason_for_visit && (
                        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                          {errors.reason_for_visit.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="symptoms" className="mb-2 block">
                        Symptômes
                      </Label>
                      <Textarea
                        id="symptoms"
                        placeholder="Décrivez vos symptômes actuels (optionnel)"
                        {...register("symptoms")}
                        className={`mt-0 resize-none ${
                          errors.symptoms ? "border-red-500" : ""
                        }`}
                        rows={3}
                      />
                      {errors.symptoms && (
                        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                          {errors.symptoms.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                      3
                    </span>
                    Coordonnées de contact
                  </h4>
                  <div className="space-y-4 pl-8">
                    <div>
                      <Label htmlFor="contact_phone" className="mb-2 block">
                        Téléphone de contact
                      </Label>
                      <Input
                        id="contact_phone"
                        type="tel"
                        placeholder="+33 6 12 34 56 78"
                        {...register("contact_phone")}
                        className={`mt-0 ${
                          errors.contact_phone ? "border-red-500" : ""
                        }`}
                      />
                      {errors.contact_phone && (
                        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                          {errors.contact_phone.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="patient_notes" className="mb-2 block">
                        Notes supplémentaires
                      </Label>
                      <Textarea
                        id="patient_notes"
                        placeholder="Ajoutez des informations complémentaires qui pourraient être utiles au médecin (optionnel)"
                        {...register("patient_notes")}
                        className={`mt-0 resize-none ${
                          errors.patient_notes ? "border-red-500" : ""
                        }`}
                        rows={2}
                      />
                      {errors.patient_notes && (
                        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                          {errors.patient_notes.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={loading}
              >
                Précédent
              </Button>
            )}
            {step < 3 ? (
              <Button
                onClick={handleContinue}
                disabled={
                  loading ||
                  (step === 1 && !selectedDoctor) ||
                  (step === 2 && !selectedSlot)
                }
                className="ml-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  "Continuer"
                )}
              </Button>
            ) : (
              <Button
                onClick={handleSubmit(handleBookAppointment)}
                disabled={loading}
                className="ml-auto bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Réservation...
                  </>
                ) : (
                  "Réserver le rendez-vous"
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
