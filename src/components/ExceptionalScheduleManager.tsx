"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useExceptionalSchedules } from "@/hooks/useSchedule";
import {
  DoctorExceptionalScheduleCreate,
  APPOINTMENT_DURATIONS,
} from "@/types";
import { Loader2, Plus, Trash2, CalendarClock } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function ExceptionalScheduleManager() {
  const {
    exceptionalSchedules,
    loading,
    fetchMyExceptionalSchedules,
    createExceptionalSchedule,
    deleteExceptionalSchedule,
  } = useExceptionalSchedules();
  const { success, error: toastError } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<DoctorExceptionalScheduleCreate>({
    date: "",
    morning_start: null,
    morning_end: null,
    afternoon_start: null,
    afternoon_end: null,
    appointment_duration: 30,
    reason: "",
  });

  useEffect(() => {
    fetchMyExceptionalSchedules();
  }, [fetchMyExceptionalSchedules]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createExceptionalSchedule(formData);
      success("Succès", "Horaire exceptionnel ajouté");
      setShowForm(false);
      setFormData({
        date: "",
        morning_start: null,
        morning_end: null,
        afternoon_start: null,
        afternoon_end: null,
        appointment_duration: 30,
        reason: "",
      });
    } catch {
      toastError("Erreur", "Erreur lors de l'ajout");
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !confirm("Êtes-vous sûr de vouloir supprimer cet horaire exceptionnel ?")
    )
      return;
    try {
      await deleteExceptionalSchedule(id);
      success("Succès", "Horaire supprimé");
    } catch {
      toastError("Erreur", "Erreur lors de la suppression");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5" />
              Horaires exceptionnels
            </CardTitle>
            <CardDescription>
              Définissez des horaires spéciaux pour des dates précises
            </CardDescription>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            variant={showForm ? "outline" : "default"}
          >
            <Plus className="h-4 w-4 mr-2" />
            {showForm ? "Annuler" : "Ajouter"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 border rounded-lg p-4 bg-gray-50 dark:bg-gray-900"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exc-date">Date *</Label>
                <Input
                  id="exc-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Durée consultation</Label>
                <Select
                  value={formData.appointment_duration?.toString()}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      appointment_duration: parseInt(value),
                    })
                  }
                >
                  <SelectTrigger id="duration">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APPOINTMENT_DURATIONS.map((d) => (
                      <SelectItem key={d.value} value={d.value.toString()}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 dark:bg-blue-950 p-4 rounded">
              <div className="md:col-span-2">
                <h4 className="font-medium text-sm mb-2">Session du matin</h4>
              </div>
              <div className="space-y-2">
                <Label htmlFor="exc-morning-start">Début</Label>
                <Input
                  id="exc-morning-start"
                  type="time"
                  value={formData.morning_start || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      morning_start: e.target.value || null,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exc-morning-end">Fin</Label>
                <Input
                  id="exc-morning-end"
                  type="time"
                  value={formData.morning_end || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      morning_end: e.target.value || null,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-orange-50 dark:bg-orange-950 p-4 rounded">
              <div className="md:col-span-2">
                <h4 className="font-medium text-sm mb-2">
                  Session de l&apos;après-midi
                </h4>
              </div>
              <div className="space-y-2">
                <Label htmlFor="exc-afternoon-start">Début</Label>
                <Input
                  id="exc-afternoon-start"
                  type="time"
                  value={formData.afternoon_start || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      afternoon_start: e.target.value || null,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exc-afternoon-end">Fin</Label>
                <Input
                  id="exc-afternoon-end"
                  type="time"
                  value={formData.afternoon_end || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      afternoon_end: e.target.value || null,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exc-reason">Raison (optionnel)</Label>
              <Textarea
                id="exc-reason"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                placeholder="Ex: Formation, journée courte, etc."
              />
            </div>

            <Button type="submit" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter l&apos;horaire
            </Button>
          </form>
        )}

        {loading && exceptionalSchedules.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : exceptionalSchedules.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            Aucun horaire exceptionnel défini
          </p>
        ) : (
          <div className="space-y-4">
            {exceptionalSchedules.map((schedule) => (
              <div
                key={schedule.id}
                className="border rounded-lg p-4 flex items-start justify-between hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarClock className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold">
                      {format(new Date(schedule.date), "EEEE d MMMM yyyy", {
                        locale: fr,
                      })}
                    </span>
                  </div>
                  <div className="text-sm space-y-1">
                    {schedule.morning_start && schedule.morning_end && (
                      <p className="text-gray-600 dark:text-gray-400">
                        Matin: {schedule.morning_start} - {schedule.morning_end}
                      </p>
                    )}
                    {schedule.afternoon_start && schedule.afternoon_end && (
                      <p className="text-gray-600 dark:text-gray-400">
                        Après-midi: {schedule.afternoon_start} -{" "}
                        {schedule.afternoon_end}
                      </p>
                    )}
                    <p className="text-gray-500">
                      Durée: {schedule.appointment_duration} min
                    </p>
                  </div>
                  {schedule.reason && (
                    <p className="text-sm text-gray-500 mt-2">
                      {schedule.reason}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(schedule.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
