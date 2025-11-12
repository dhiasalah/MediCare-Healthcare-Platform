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
import { Stethoscope, Search } from "lucide-react";
import api from "@/lib/api";
import { User, Patient, SPECIALIZATIONS } from "@/types";
import { showToast } from "@/hooks/useToast";

const assignSpecialistSchema = z.object({
  specialist: z.number().min(1, "Veuillez sélectionner un spécialiste"),
  reason: z.string().min(1, "Le motif est requis"),
  notes: z.string().optional(),
});

type AssignSpecialistFormData = z.infer<typeof assignSpecialistSchema>;

interface AssignSpecialistModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onSuccess?: () => void;
}

export default function AssignSpecialistModal({
  isOpen,
  onClose,
  patient,
  onSuccess,
}: AssignSpecialistModalProps) {
  const [selectedSpecialization, setSelectedSpecialization] =
    useState<string>("");
  const [specialists, setSpecialists] = useState<User[]>([]);
  const [filteredSpecialists, setFilteredSpecialists] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialist, setSelectedSpecialist] = useState<User | null>(
    null
  );
  const [isLoadingSpecialists, setIsLoadingSpecialists] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<AssignSpecialistFormData>({
    resolver: zodResolver(assignSpecialistSchema),
    defaultValues: {
      specialist: 0,
      reason: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      fetchSpecialists();
    } else {
      // Reset form when modal closes
      reset();
      setSelectedSpecialization("");
      setSelectedSpecialist(null);
      setSearchTerm("");
    }
  }, [isOpen, reset]);

  useEffect(() => {
    // Filter specialists based on specialization and search term
    let filtered = [...specialists];

    // Filter by specialization if one is selected
    if (selectedSpecialization && selectedSpecialization !== "") {
      filtered = filtered.filter(
        (s) => s.specialization === selectedSpecialization
      );
    }

    // Filter by search term if entered
    if (searchTerm && searchTerm.trim() !== "") {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((s) => {
        const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();
        const email = s.email?.toLowerCase() || "";
        return fullName.includes(searchLower) || email.includes(searchLower);
      });
    }

    setFilteredSpecialists(filtered);
  }, [specialists, selectedSpecialization, searchTerm]);

  const fetchSpecialists = async () => {
    try {
      setIsLoadingSpecialists(true);
      const response = await api.get("/api/patients/available-specialists/");
      setSpecialists(response.data);
      setFilteredSpecialists(response.data);
    } catch (error) {
      console.error("Error fetching specialists:", error);
      showToast.error("Erreur lors du chargement des spécialistes");
      setSpecialists([]);
      setFilteredSpecialists([]);
    } finally {
      setIsLoadingSpecialists(false);
    }
  };

  const handleSelectSpecialist = (specialist: User) => {
    setSelectedSpecialist(specialist);
    setValue("specialist", specialist.id);
  };

  const onSubmit = async (data: AssignSpecialistFormData) => {
    if (!patient) return;

    try {
      // First, assign the specialist (PDF is now auto-generated on backend)
      const response = await api.post("/api/patients/assign-specialist/", {
        patient: patient.id,
        specialist: data.specialist,
        reason: data.reason,
        notes: data.notes || "",
      });

      // The PDF should be auto-generated on the backend now
      // But we can still try to generate it as a backup if needed
      if (response.data.data?.id) {
        try {
          await api.post("/api/medical-documents/referral-pdfs/generate/", {
            patient_specialist_id: response.data.data.id,
          });
        } catch (pdfError: unknown) {
          // PDF might already exist from backend auto-generation, so ignore this error
          console.log("PDF generation (backup attempt):", pdfError);
        }
      }

      showToast.success("Spécialiste assigné avec succès!");
      onSuccess?.();
      onClose();
    } catch (error: unknown) {
      console.error("Error assigning specialist:", error);
      const err = error as {
        response?: { data?: { non_field_errors?: string[]; error?: string } };
      };
      const errorMessage =
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.error ||
        "Erreur lors de l'assignation du spécialiste";
      showToast.error(errorMessage);
    }
  };

  if (!patient) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-blue-50 to-white">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Assigner un spécialiste
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-1">
            Référer{" "}
            <span className="font-semibold text-gray-900">
              {patient.first_name} {patient.last_name}
            </span>{" "}
            à un médecin spécialiste
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
            {/* Specialization Filter */}
            <div className="space-y-2">
              <Label
                htmlFor="specialization"
                className="text-sm font-semibold text-gray-700"
              >
                Filtrer par spécialisation
              </Label>
              <select
                id="specialization"
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Toutes les spécialisations</option>
                {SPECIALIZATIONS.map((spec) => (
                  <option key={spec.value} value={spec.value}>
                    {spec.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <Label
                htmlFor="search"
                className="text-sm font-semibold text-gray-700"
              >
                Rechercher un médecin
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Nom, prénom ou email du médecin..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Specialists List */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                Médecins disponibles (
                {isLoadingSpecialists ? "..." : filteredSpecialists.length})
                {selectedSpecialization && (
                  <span className="text-xs font-normal text-blue-600 ml-2">
                    •{" "}
                    {
                      SPECIALIZATIONS.find(
                        (s) => s.value === selectedSpecialization
                      )?.label
                    }
                  </span>
                )}
              </Label>
              {isLoadingSpecialists ? (
                <div className="flex flex-col items-center justify-center py-8 border rounded-md">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                  <p className="text-sm text-gray-500">
                    Chargement des médecins...
                  </p>
                </div>
              ) : filteredSpecialists.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border rounded-md">
                  <Stethoscope className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p className="font-medium">Aucun spécialiste trouvé</p>
                  {specialists.length > 0 ? (
                    <p className="text-xs mt-1">
                      Essayez de changer la spécialisation ou le terme de
                      recherche
                    </p>
                  ) : (
                    <p className="text-xs mt-1">
                      Aucun médecin avec spécialisation disponible
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto p-1">
                  {filteredSpecialists.map((specialist) => (
                    <div
                      key={specialist.id}
                      onClick={() => handleSelectSpecialist(specialist)}
                      className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedSpecialist?.id === specialist.id
                          ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200"
                          : "border-gray-200 hover:border-blue-300 hover:shadow-sm hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div
                          className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                            selectedSpecialist?.id === specialist.id
                              ? "bg-blue-500"
                              : "bg-gradient-to-br from-blue-400 to-blue-600"
                          }`}
                        >
                          <Stethoscope className="h-7 w-7 text-white" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 text-base truncate">
                                Dr. {specialist.first_name}{" "}
                                {specialist.last_name}
                              </h4>
                              <p className="text-sm font-medium text-blue-600 mt-0.5">
                                {SPECIALIZATIONS.find(
                                  (s) => s.value === specialist.specialization
                                )?.label || specialist.specialization}
                              </p>
                            </div>

                            {/* Selection Checkmark */}
                            {selectedSpecialist?.id === specialist.id && (
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                                <svg
                                  className="w-4 h-4 text-white"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="3"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path d="M5 13l4 4L19 7"></path>
                                </svg>
                              </div>
                            )}
                          </div>

                          {/* Contact Info */}
                          <div className="space-y-1.5 mt-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <svg
                                className="w-4 h-4 text-gray-400 flex-shrink-0"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                              </svg>
                              <span className="truncate">
                                {specialist.email}
                              </span>
                            </div>
                            {specialist.phone && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <svg
                                  className="w-4 h-4 text-gray-400 flex-shrink-0"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                </svg>
                                <span>{specialist.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <input type="hidden" {...register("specialist")} />
              {errors.specialist && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.specialist.message}
                </p>
              )}
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label
                htmlFor="reason"
                className="text-sm font-semibold text-gray-700"
              >
                Motif de consultation <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="reason"
                {...register("reason")}
                placeholder="Pourquoi référez-vous ce patient à ce spécialiste? (ex: Douleurs thoraciques persistantes, Consultation dermatologique pour eczéma...)"
                className="flex min-h-[90px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                rows={3}
              />
              {errors.reason && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.reason.message}
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label
                htmlFor="notes"
                className="text-sm font-semibold text-gray-700"
              >
                Notes additionnelles (optionnel)
              </Label>
              <textarea
                id="notes"
                {...register("notes")}
                placeholder="Notes ou instructions supplémentaires..."
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                rows={2}
              />
            </div>
          </div>

          {/* Actions - Sticky Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="min-w-[100px]"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !selectedSpecialist}
              className="min-w-[180px] bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Assignation...
                </>
              ) : (
                <>
                  <Stethoscope className="h-4 w-4 mr-2" />
                  Assigner le spécialiste
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
