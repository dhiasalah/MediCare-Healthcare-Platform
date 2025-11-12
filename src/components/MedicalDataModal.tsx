"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Heart, TrendingUp, Zap, AlertCircle, CheckCircle } from "lucide-react";
import { medicalRecordsAPI } from "@/lib/api";

// Zod validation schema
const medicalRecordSchema = z.object({
  patient: z.coerce.number().positive("Patient ID doit être valide"),
  health_status: z
    .enum(["good", "fair", "poor"])
    .refine((val) => ["good", "fair", "poor"].includes(val), {
      message: "État général invalide",
    }),
  systolic_bp: z.coerce
    .number()
    .min(50, "Tension systolique minimum: 50 mmHg")
    .max(300, "Tension systolique maximum: 300 mmHg")
    .nullable()
    .optional(),
  diastolic_bp: z.coerce
    .number()
    .min(30, "Tension diastolique minimum: 30 mmHg")
    .max(200, "Tension diastolique maximum: 200 mmHg")
    .nullable()
    .optional(),
  heart_rate: z.coerce
    .number()
    .min(30, "Fréquence cardiaque minimum: 30 bpm")
    .max(250, "Fréquence cardiaque maximum: 250 bpm")
    .nullable()
    .optional(),
  temperature: z.coerce
    .number()
    .min(35, "Température minimum: 35°C")
    .max(42, "Température maximum: 42°C")
    .nullable()
    .optional(),
  respiratory_rate: z.coerce
    .number()
    .min(8, "Fréquence respiratoire minimum: 8 bpm")
    .max(60, "Fréquence respiratoire maximum: 60 bpm")
    .nullable()
    .optional(),
  oxygen_saturation: z.coerce
    .number()
    .min(70, "Saturation oxygène minimum: 70%")
    .max(100, "Saturation oxygène maximum: 100%")
    .nullable()
    .optional(),
  weight: z.coerce
    .number()
    .min(20, "Poids minimum: 20 kg")
    .max(300, "Poids maximum: 300 kg")
    .nullable()
    .optional(),
  height: z.coerce
    .number()
    .min(50, "Taille minimum: 50 cm")
    .max(250, "Taille maximum: 250 cm")
    .nullable()
    .optional(),
  waist_circumference: z.coerce
    .number()
    .min(20, "Tour de taille minimum: 20 cm")
    .max(200, "Tour de taille maximum: 200 cm")
    .nullable()
    .optional(),
  recorded_at: z.string().optional(),
});

type MedicalRecordData = z.infer<typeof medicalRecordSchema>;

interface MedicalDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: number;
  onSuccess?: () => void;
}

export default function MedicalDataModal({
  isOpen,
  onClose,
  patientId,
  onSuccess,
}: MedicalDataModalProps) {
  const [formData, setFormData] = useState<MedicalRecordData>({
    patient: patientId,
    health_status: "good",
  });

  const [recordId, setRecordId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Fetch existing medical record when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchMedicalRecord = async () => {
        try {
          const lastRecord = await medicalRecordsAPI.getPatientLatest(
            patientId
          );
          if (lastRecord) {
            setRecordId(lastRecord.id);
            setFormData({
              patient: patientId,
              health_status: lastRecord.health_status || "good",
              systolic_bp: lastRecord.systolic_bp || null,
              diastolic_bp: lastRecord.diastolic_bp || null,
              heart_rate: lastRecord.heart_rate || null,
              temperature: lastRecord.temperature || null,
              respiratory_rate: lastRecord.respiratory_rate || null,
              oxygen_saturation: lastRecord.oxygen_saturation || null,
              weight: lastRecord.weight || null,
              height: lastRecord.height || null,
              waist_circumference: lastRecord.waist_circumference || null,
            });
          } else {
            // No existing record, reset to new
            setRecordId(null);
            setFormData({
              patient: patientId,
              health_status: "good",
            });
          }
        } catch (err) {
          console.error("Error fetching medical record:", err);
          // If error, reset to create mode
          setRecordId(null);
          setFormData({
            patient: patientId,
            health_status: "good",
          });
        }
      };

      fetchMedicalRecord();
    }
  }, [isOpen, patientId]);

  const handleInputChange = (
    field: keyof MedicalRecordData,
    value: string | number | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value === "" ? null : value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    setValidationErrors({});

    try {
      console.log("Validating medical data...");

      // Validate form data with Zod
      const validationResult = medicalRecordSchema.safeParse(formData);

      if (!validationResult.success) {
        // Extract validation errors
        const errors: Record<string, string> = {};
        validationResult.error.issues.forEach((issue) => {
          const path = issue.path.join(".");
          errors[path] = issue.message;
        });
        setValidationErrors(errors);
        setError("Veuillez corriger les erreurs de validation");
        setLoading(false);
        return;
      }

      console.log("Submitting medical data...");

      const medicalData = {
        ...validationResult.data,
        // Convert string values to numbers
        systolic_bp: validationResult.data.systolic_bp
          ? parseInt(String(validationResult.data.systolic_bp))
          : null,
        diastolic_bp: validationResult.data.diastolic_bp
          ? parseInt(String(validationResult.data.diastolic_bp))
          : null,
        heart_rate: validationResult.data.heart_rate
          ? parseInt(String(validationResult.data.heart_rate))
          : null,
        temperature: validationResult.data.temperature
          ? parseFloat(String(validationResult.data.temperature))
          : null,
        respiratory_rate: validationResult.data.respiratory_rate
          ? parseInt(String(validationResult.data.respiratory_rate))
          : null,
        oxygen_saturation: validationResult.data.oxygen_saturation
          ? parseInt(String(validationResult.data.oxygen_saturation))
          : null,
        weight: validationResult.data.weight
          ? parseFloat(String(validationResult.data.weight))
          : null,
        height: validationResult.data.height
          ? parseInt(String(validationResult.data.height))
          : null,
        waist_circumference: validationResult.data.waist_circumference
          ? parseFloat(String(validationResult.data.waist_circumference))
          : null,
      };

      let response;
      if (recordId) {
        // Update existing record
        console.log("Updating existing medical record:", recordId);
        response = await medicalRecordsAPI.update(recordId, medicalData);
      } else {
        // Create new record
        console.log("Creating new medical record");
        response = await medicalRecordsAPI.create(medicalData);
        // Store the ID for future updates
        if (response && response.id) {
          setRecordId(response.id);
        }
      }

      console.log("Medical data submitted successfully:", response);
      setSuccess(true);
      setTimeout(() => {
        setFormData({
          patient: patientId,
          health_status: "good",
        });
        setValidationErrors({});
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      }, 1500);
    } catch (err) {
      let errorMessage =
        "Une erreur est survenue lors de l'enregistrement des données médicales";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.error("Error saving medical data:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50 border border-blue-100 shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg -m-6 mb-6 p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-white">
                Renseigner les données médicales
              </DialogTitle>
              <DialogDescription className="text-blue-100 mt-1">
                Enregistrez les mesures et l&apos;état de santé du patient
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-900">Erreur</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-900">Succès</p>
              <p className="text-sm text-green-700">
                Les données médicales ont été enregistrées avec succès
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 px-1">
          {/* État général */}
          <div className="bg-white rounded-lg p-5 border border-slate-200 hover:border-blue-300 transition-colors">
            <Label className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-yellow-600" />
              </div>
              État général
            </Label>
            <div className="space-y-1.5">
              <Select
                value={formData.health_status}
                onValueChange={(value) =>
                  handleInputChange(
                    "health_status",
                    value as "good" | "fair" | "poor"
                  )
                }
              >
                <SelectTrigger
                  className={`w-full bg-white border-slate-200 hover:border-blue-400 focus:border-blue-500 ${
                    validationErrors.health_status
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="good">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      Bon
                    </span>
                  </SelectItem>
                  <SelectItem value="fair">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                      Moyen
                    </span>
                  </SelectItem>
                  <SelectItem value="poor">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      Mauvais
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.health_status && (
                <p className="text-xs text-red-600 mt-1">
                  {validationErrors.health_status}
                </p>
              )}
            </div>
          </div>

          {/* Signes vitaux */}
          <div className="bg-white rounded-lg p-5 border border-slate-200 hover:border-blue-300 transition-colors">
            <Label className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-red-600" />
              </div>
              Signes vitaux
            </Label>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label
                  htmlFor="systolic_bp"
                  className="text-xs font-medium text-gray-700 line-clamp-2"
                >
                  Tension systolique (mmHg)
                </Label>
                <Input
                  id="systolic_bp"
                  type="number"
                  min="50"
                  max="300"
                  placeholder="120"
                  value={formData.systolic_bp ?? ""}
                  onChange={(e) =>
                    handleInputChange(
                      "systolic_bp",
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  className={`bg-slate-50 border-slate-200 hover:border-slate-300 focus:border-blue-500 h-10 ${
                    validationErrors.systolic_bp
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                />
                {validationErrors.systolic_bp && (
                  <p className="text-xs text-red-600 mt-1">
                    {validationErrors.systolic_bp}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="diastolic_bp"
                  className="text-xs font-medium text-gray-700 line-clamp-2"
                >
                  Tension diastolique (mmHg)
                </Label>
                <Input
                  id="diastolic_bp"
                  type="number"
                  min="30"
                  max="200"
                  placeholder="80"
                  value={formData.diastolic_bp ?? ""}
                  onChange={(e) =>
                    handleInputChange(
                      "diastolic_bp",
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  className={`bg-slate-50 border-slate-200 hover:border-slate-300 focus:border-blue-500 h-10 ${
                    validationErrors.diastolic_bp
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                />
                {validationErrors.diastolic_bp && (
                  <p className="text-xs text-red-600 mt-1">
                    {validationErrors.diastolic_bp}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="heart_rate"
                  className="text-xs font-medium text-gray-700 line-clamp-2"
                >
                  Fréquence cardiaque (bpm)
                </Label>
                <Input
                  id="heart_rate"
                  type="number"
                  min="30"
                  max="250"
                  placeholder="72"
                  value={formData.heart_rate ?? ""}
                  onChange={(e) =>
                    handleInputChange(
                      "heart_rate",
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  className={`bg-slate-50 border-slate-200 hover:border-slate-300 focus:border-blue-500 h-10 ${
                    validationErrors.heart_rate
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                />
                {validationErrors.heart_rate && (
                  <p className="text-xs text-red-600 mt-1">
                    {validationErrors.heart_rate}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="temperature"
                  className="text-xs font-medium text-gray-700 line-clamp-2"
                >
                  Température (°C)
                </Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  min="35"
                  max="42"
                  placeholder="36.7"
                  value={formData.temperature ?? ""}
                  onChange={(e) =>
                    handleInputChange(
                      "temperature",
                      e.target.value ? parseFloat(e.target.value) : null
                    )
                  }
                  className={`bg-slate-50 border-slate-200 hover:border-slate-300 focus:border-blue-500 h-10 ${
                    validationErrors.temperature
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                />
                {validationErrors.temperature && (
                  <p className="text-xs text-red-600 mt-1">
                    {validationErrors.temperature}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="respiratory_rate"
                  className="text-xs font-medium text-gray-700 line-clamp-2"
                >
                  Fréquence respiratoire (bpm)
                </Label>
                <Input
                  id="respiratory_rate"
                  type="number"
                  min="8"
                  max="60"
                  placeholder="16"
                  value={formData.respiratory_rate ?? ""}
                  onChange={(e) =>
                    handleInputChange(
                      "respiratory_rate",
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  className={`bg-slate-50 border-slate-200 hover:border-slate-300 focus:border-blue-500 h-10 ${
                    validationErrors.respiratory_rate
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                />
                {validationErrors.respiratory_rate && (
                  <p className="text-xs text-red-600 mt-1">
                    {validationErrors.respiratory_rate}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="oxygen_saturation"
                  className="text-xs font-medium text-gray-700 line-clamp-2"
                >
                  Saturation oxygène (%)
                </Label>
                <Input
                  id="oxygen_saturation"
                  type="number"
                  min="70"
                  max="100"
                  placeholder="98"
                  value={formData.oxygen_saturation ?? ""}
                  onChange={(e) =>
                    handleInputChange(
                      "oxygen_saturation",
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  className={`bg-slate-50 border-slate-200 hover:border-slate-300 focus:border-blue-500 h-10 ${
                    validationErrors.oxygen_saturation
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                />
                {validationErrors.oxygen_saturation && (
                  <p className="text-xs text-red-600 mt-1">
                    {validationErrors.oxygen_saturation}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Mesures corporelles */}
          <div className="bg-white rounded-lg p-5 border border-slate-200 hover:border-blue-300 transition-colors">
            <Label className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              Mesures corporelles
            </Label>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label
                  htmlFor="weight"
                  className="text-xs font-medium text-gray-700"
                >
                  Poids (kg)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="72"
                  value={formData.weight ?? ""}
                  onChange={(e) =>
                    handleInputChange(
                      "weight",
                      e.target.value ? parseFloat(e.target.value) : null
                    )
                  }
                  className={`bg-slate-50 border-slate-200 hover:border-slate-300 focus:border-blue-500 h-10 ${
                    validationErrors.weight
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                />
                {validationErrors.weight && (
                  <p className="text-xs text-red-600 mt-1">
                    {validationErrors.weight}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="height"
                  className="text-xs font-medium text-gray-700"
                >
                  Taille (cm)
                </Label>
                <Input
                  id="height"
                  type="number"
                  min="50"
                  max="250"
                  placeholder="175"
                  value={formData.height ?? ""}
                  onChange={(e) =>
                    handleInputChange(
                      "height",
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  className={`bg-slate-50 border-slate-200 hover:border-slate-300 focus:border-blue-500 h-10 ${
                    validationErrors.height
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                />
                {validationErrors.height && (
                  <p className="text-xs text-red-600 mt-1">
                    {validationErrors.height}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="waist_circumference"
                  className="text-xs font-medium text-gray-700"
                >
                  Tour de taille (cm)
                </Label>
                <Input
                  id="waist_circumference"
                  type="number"
                  step="0.1"
                  placeholder="85"
                  value={formData.waist_circumference ?? ""}
                  onChange={(e) =>
                    handleInputChange(
                      "waist_circumference",
                      e.target.value ? parseFloat(e.target.value) : null
                    )
                  }
                  className={`bg-slate-50 border-slate-200 hover:border-slate-300 focus:border-blue-500 h-10 ${
                    validationErrors.waist_circumference
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                />
                {validationErrors.waist_circumference && (
                  <p className="text-xs text-red-600 mt-1">
                    {validationErrors.waist_circumference}
                  </p>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 ml-1">
              * La date et l&apos;heure seront enregistrées automatiquement
            </p>
          </div>

          <DialogFooter className="gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading || success}
              className="px-6"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading || success}
              className="px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enregistrement...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Enregistré !
                </>
              ) : (
                <>
                  <Heart className="h-4 w-4 mr-2" />
                  Enregistrer
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
