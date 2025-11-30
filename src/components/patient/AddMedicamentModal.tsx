import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CalendarIcon,
  Pill,
  Clock,
  FileText,
  Plus,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMedicaments } from "@/hooks/patient/useMedicaments";
import {
  medicamentSchema,
  MedicamentFormData,
} from "@/lib/validations/medicament";

interface AddMedicamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddMedicamentModal({
  isOpen,
  onClose,
  onSuccess,
}: AddMedicamentModalProps) {
  const { addMedicament } = useMedicaments();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<MedicamentFormData>({
    resolver: zodResolver(medicamentSchema),
    defaultValues: {
      name: "",
      dosage: "",
      frequency: "",
      duration_days: null,
      start_date: new Date().toISOString().split("T")[0],
      instructions: "",
    },
  });

  const onSubmit = async (data: MedicamentFormData) => {
    setIsLoading(true);

    const success = await addMedicament({
      ...data,
      status: "active",
    });

    setIsLoading(false);

    if (success) {
      onSuccess();
      onClose();
      reset();
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-emerald-50">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Pill className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl">
                Ajouter un nouveau médicament
              </DialogTitle>
              <DialogDescription className="text-base mt-1">
                Remplissez les informations du médicament ci-dessous
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-lg p-6 shadow-sm space-y-8">
            {/* Medication Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b-2 border-emerald-200">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Pill className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Informations du médicament
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="name" className="font-medium mb-2 block">
                    Nom du médicament *
                  </Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="Ex: Paracétamol, Ibuprofène, Doliprane..."
                    className={cn(
                      "transition-colors",
                      errors.name
                        ? "border-red-500 focus:border-red-500"
                        : "focus:border-emerald-500"
                    )}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="dosage" className="font-medium mb-2 block">
                    Dosage *
                  </Label>
                  <Input
                    id="dosage"
                    {...register("dosage")}
                    placeholder="Ex: 500mg, 1g, 10ml..."
                    className={cn(
                      "transition-colors",
                      errors.dosage
                        ? "border-red-500 focus:border-red-500"
                        : "focus:border-emerald-500"
                    )}
                  />
                  {errors.dosage && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.dosage.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="frequency" className="font-medium mb-2 block">
                    Fréquence *
                  </Label>
                  <Input
                    id="frequency"
                    {...register("frequency")}
                    placeholder="Ex: 3x/jour, matin et soir..."
                    className={cn(
                      "transition-colors",
                      errors.frequency
                        ? "border-red-500 focus:border-red-500"
                        : "focus:border-emerald-500"
                    )}
                  />
                  {errors.frequency && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.frequency.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Schedule Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b-2 border-blue-200">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Période de traitement
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="start_date"
                    className="font-medium mb-2 block"
                  >
                    <CalendarIcon className="h-4 w-4 inline mr-1" />
                    Date de début *
                  </Label>
                  <Controller
                    control={control}
                    name="start_date"
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground",
                              errors.start_date
                                ? "border-red-500"
                                : "focus:border-blue-500"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(new Date(field.value), "PPP", {
                                locale: fr,
                              })
                            ) : (
                              <span>Sélectionner une date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            onSelect={(date) =>
                              field.onChange(
                                date ? date.toISOString().split("T")[0] : ""
                              )
                            }
                            disabled={(date) => date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                  {errors.start_date && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.start_date.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="duration_days"
                    className="font-medium mb-2 block"
                  >
                    Durée du traitement (jours)
                  </Label>
                  <Input
                    id="duration_days"
                    type="number"
                    min="1"
                    {...register("duration_days", {
                      setValueAs: (v) =>
                        v === "" ? undefined : parseInt(v, 10),
                    })}
                    placeholder="Ex: 7, 14, 30..."
                    className="focus:border-blue-500 transition-colors"
                  />
                  {errors.duration_days && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.duration_days.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Instructions Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b-2 border-orange-200">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Instructions supplémentaires
                </h3>
              </div>

              <div>
                <Label
                  htmlFor="instructions"
                  className="font-medium mb-2 block"
                >
                  <FileText className="h-4 w-4 inline mr-1" />
                  Instructions (optionnel)
                </Label>
                <Textarea
                  id="instructions"
                  {...register("instructions")}
                  placeholder="Ex: À prendre pendant les repas, éviter l'alcool, ne pas conduire après la prise..."
                  rows={4}
                  className="focus:border-orange-500 transition-colors resize-none"
                />
                {errors.instructions && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.instructions.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6 gap-3 border-t pt-6">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleClose}
              className="min-w-[120px]"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              size="lg"
              className="min-w-[150px] bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-md"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Ajout en cours...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter le médicament
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
