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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDaysOff } from "@/hooks/useSchedule";
import { DoctorDayOffCreate } from "@/types";
import {
  Loader2,
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function DayOffManager() {
  const { daysOff, loading, fetchMyDaysOff, createDayOff, deleteDayOff } =
    useDaysOff();
  const { success, error: toastError } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<DoctorDayOffCreate>({
    date: "",
    is_full_day: true,
    unavailable_start: null,
    unavailable_end: null,
    reason: "",
  });
  const [openPopover, setOpenPopover] = useState(false);

  useEffect(() => {
    fetchMyDaysOff(true);
  }, [fetchMyDaysOff]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDayOff(formData);
      success("Succès", "Congé ajouté avec succès");
      setShowForm(false);
      setFormData({
        date: "",
        is_full_day: true,
        unavailable_start: null,
        unavailable_end: null,
        reason: "",
      });
    } catch {
      toastError("Erreur", "Erreur lors de l'ajout du congé");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce congé ?")) return;
    try {
      await deleteDayOff(id);
      success("Succès", "Congé supprimé");
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
              <CalendarIcon className="h-5 w-5" />
              Jours de congé
            </CardTitle>
            <CardDescription>Gérez vos jours d&apos;absence</CardDescription>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            variant={showForm ? "outline" : "default"}
          >
            <Plus className="h-4 w-4 mr-2" />
            {showForm ? "Annuler" : "Ajouter un congé"}
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
                <Label htmlFor="date">Date *</Label>
                <Popover open={openPopover} onOpenChange={setOpenPopover}>
                  <PopoverTrigger asChild>
                    <Input
                      id="date"
                      readOnly
                      value={
                        formData.date
                          ? new Date(formData.date).toLocaleDateString(
                              "fr-FR",
                              {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                              }
                            )
                          : ""
                      }
                      placeholder="Sélectionnez une date"
                      className="w-full text-left cursor-pointer"
                      required
                    />
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={
                        formData.date ? new Date(formData.date) : undefined
                      }
                      onSelect={(date) => {
                        if (!date) return;
                        const yyyy = date.getFullYear();
                        const mm = String(date.getMonth() + 1).padStart(2, "0");
                        const dd = String(date.getDate()).padStart(2, "0");
                        setFormData({
                          ...formData,
                          date: `${yyyy}-${mm}-${dd}`,
                        });
                        setOpenPopover(false);
                      }}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Raison (optionnel)</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                placeholder="Ex: Congé annuel, formation, etc."
              />
            </div>

            <Button type="submit" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter le congé
            </Button>
          </form>
        )}

        {loading && daysOff.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : daysOff.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            Aucun congé programmé
          </p>
        ) : (
          <div className="space-y-4">
            {daysOff.map((dayOff) => (
              <div
                key={dayOff.id}
                className="border rounded-lg p-4 flex items-start justify-between hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarIcon className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold">
                      {format(new Date(dayOff.date), "EEEE d MMMM yyyy", {
                        locale: fr,
                      })}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      Toute la journée
                    </span>
                  </div>
                  {dayOff.reason && (
                    <p className="text-sm text-gray-500 mt-2">
                      {dayOff.reason}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(dayOff.id)}
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
