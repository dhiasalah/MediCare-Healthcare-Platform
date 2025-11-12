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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWeeklySchedule } from "@/hooks/useSchedule";
import { SessionTimePicker } from "./SessionTimePicker";
import {
  DAY_NAMES,
  APPOINTMENT_DURATIONS,
  DayOfWeek,
  DoctorWeeklyScheduleCreate,
} from "@/types";
import { Loader2, Clock, Save, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/useToast";

export default function WeeklyScheduleEditor() {
  const {
    schedules,
    loading,
    error,
    fetchMySchedule,
    bulkUpdateSchedule,
    initializeSchedule,
  } = useWeeklySchedule();
  const { success, error: toastError } = useToast();
  const [localSchedules, setLocalSchedules] = useState<
    DoctorWeeklyScheduleCreate[]
  >([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMySchedule();
  }, [fetchMySchedule]);

  useEffect(() => {
    if (schedules.length > 0) {
      const mapped = schedules.map((s) => {
        // Convert time format from "HH:MM:SS" to "HH:MM"
        const formatTime = (time: string | null | undefined) => {
          if (!time) return null;
          return time.substring(0, 5); // Get "HH:MM" from "HH:MM:SS"
        };

        return {
          day_of_week: s.day_of_week,
          is_available: s.is_available,
          morning_start: formatTime(s.morning_start),
          morning_end: formatTime(s.morning_end),
          afternoon_start: formatTime(s.afternoon_start),
          afternoon_end: formatTime(s.afternoon_end),
          appointment_duration: s.appointment_duration,
        };
      });
      setLocalSchedules(mapped);
    } else if (schedules.length === 0 && !loading) {
      // Set default schedules if none exist
      const defaultSchedules: DoctorWeeklyScheduleCreate[] = [
        // Monday to Friday: 9:00-12:00, 13:00-17:00
        {
          day_of_week: 0, // Monday
          is_available: true,
          morning_start: "09:00",
          morning_end: "12:00",
          afternoon_start: "13:00",
          afternoon_end: "17:00",
          appointment_duration: 30,
        },
        {
          day_of_week: 1, // Tuesday
          is_available: true,
          morning_start: "09:00",
          morning_end: "12:00",
          afternoon_start: "13:00",
          afternoon_end: "17:00",
          appointment_duration: 30,
        },
        {
          day_of_week: 2, // Wednesday
          is_available: true,
          morning_start: "09:00",
          morning_end: "12:00",
          afternoon_start: "13:00",
          afternoon_end: "17:00",
          appointment_duration: 30,
        },
        {
          day_of_week: 3, // Thursday
          is_available: true,
          morning_start: "09:00",
          morning_end: "12:00",
          afternoon_start: "13:00",
          afternoon_end: "17:00",
          appointment_duration: 30,
        },
        {
          day_of_week: 4, // Friday
          is_available: true,
          morning_start: "09:00",
          morning_end: "12:00",
          afternoon_start: "13:00",
          afternoon_end: "17:00",
          appointment_duration: 30,
        },
        {
          day_of_week: 5, // Saturday - NOT available
          is_available: false,
          morning_start: null,
          morning_end: null,
          afternoon_start: null,
          afternoon_end: null,
          appointment_duration: 30,
        },
        {
          day_of_week: 6, // Sunday - NOT available
          is_available: false,
          morning_start: null,
          morning_end: null,
          afternoon_start: null,
          afternoon_end: null,
          appointment_duration: 30,
        },
      ];
      setLocalSchedules(defaultSchedules);
    }
  }, [schedules, loading]);

  const handleInitialize = async () => {
    try {
      setSaving(true);
      await initializeSchedule();
      success(
        "Succès",
        "Emploi du temps initialisé avec les horaires par défaut"
      );
      setHasChanges(false);
    } catch {
      toastError("Erreur", error || "Erreur lors de l'initialisation");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validate only available days
      for (const schedule of localSchedules) {
        if (schedule.is_available) {
          // Check if at least one session exists
          const hasMorning = schedule.morning_start && schedule.morning_end;
          const hasAfternoon =
            schedule.afternoon_start && schedule.afternoon_end;

          if (!hasMorning && !hasAfternoon) {
            toastError(
              "Erreur de validation",
              `${
                DAY_NAMES[schedule.day_of_week]
              }: Définissez au moins une session (matin ou après-midi).`
            );
            setSaving(false);
            return;
          }

          // Check morning times if present
          if (hasMorning && schedule.morning_start! >= schedule.morning_end!) {
            toastError(
              "Erreur de validation",
              `${
                DAY_NAMES[schedule.day_of_week]
              }: L'heure de début du matin doit être avant l'heure de fin.`
            );
            setSaving(false);
            return;
          }

          // Check afternoon times if present
          if (
            hasAfternoon &&
            schedule.afternoon_start! >= schedule.afternoon_end!
          ) {
            toastError(
              "Erreur de validation",
              `${
                DAY_NAMES[schedule.day_of_week]
              }: L'heure de début de l'après-midi doit être avant l'heure de fin.`
            );
            setSaving(false);
            return;
          }

          // Check that afternoon starts after morning if both exist
          if (
            hasMorning &&
            hasAfternoon &&
            schedule.morning_end! > schedule.afternoon_start!
          ) {
            toastError(
              "Erreur de validation",
              `${
                DAY_NAMES[schedule.day_of_week]
              }: L'après-midi doit commencer après la fin de la matinée.`
            );
            setSaving(false);
            return;
          }
        }
      }

      await bulkUpdateSchedule({ schedules: localSchedules });
      success("Succès", "Emploi du temps mis à jour avec succès");
      setHasChanges(false);
    } catch {
      toastError("Erreur", error || "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const updateSchedule = (
    dayOfWeek: DayOfWeek,
    field: keyof DoctorWeeklyScheduleCreate,
    value: unknown
  ) => {
    setLocalSchedules((prev) => {
      const existing = prev.find((s) => s.day_of_week === dayOfWeek);
      if (existing) {
        return prev.map((s) =>
          s.day_of_week === dayOfWeek ? { ...s, [field]: value } : s
        );
      } else {
        const newSchedule: DoctorWeeklyScheduleCreate = {
          day_of_week: dayOfWeek,
          is_available: false,
          morning_start: null,
          morning_end: null,
          afternoon_start: null,
          afternoon_end: null,
          appointment_duration: 30,
          [field]: value,
        };
        return [...prev, newSchedule];
      }
    });
    setHasChanges(true);
  };

  const getScheduleForDay = (
    dayOfWeek: DayOfWeek
  ): DoctorWeeklyScheduleCreate => {
    const existing = localSchedules.find((s) => s.day_of_week === dayOfWeek);
    return (
      existing || {
        day_of_week: dayOfWeek,
        is_available: false,
        morning_start: null,
        morning_end: null,
        afternoon_start: null,
        afternoon_end: null,
        appointment_duration: 30,
      }
    );
  };

  if (loading && schedules.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    );
  }

  if (schedules.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Emploi du temps hebdomadaire</CardTitle>
          <CardDescription>
            Aucun emploi du temps configuré. Initialisez votre emploi du temps
            avec les horaires par défaut.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleInitialize} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Initialiser l&apos;emploi du temps
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Emploi du temps hebdomadaire
          </CardTitle>
          <CardDescription>
            Configurez vos horaires de disponibilité pour chaque jour de la
            semaine
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pb-24">
          {/* Day Grid - Compact Day Selector */}
          <div className="grid grid-cols-2 md:grid-cols-7 gap-2 mb-6">
            {([0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]).map((dayOfWeek) => {
              const schedule = getScheduleForDay(dayOfWeek);
              return (
                <button
                  key={dayOfWeek}
                  onClick={() => {
                    // Scroll to day section
                    document
                      .getElementById(`day-${dayOfWeek}`)
                      ?.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                      });
                  }}
                  className={`p-3 rounded-lg font-medium text-sm transition-all ${
                    schedule.is_available
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 border-2 border-blue-400"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-gray-300"
                  }`}
                >
                  <div className="text-xs font-bold">
                    {DAY_NAMES[dayOfWeek].substring(0, 3)}
                  </div>
                  <div className="text-xs">
                    {schedule.is_available ? "✓" : "✗"}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Schedule Details in Compact Accordion-like Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {([0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]).map((dayOfWeek) => {
              const schedule = getScheduleForDay(dayOfWeek);
              return (
                <div
                  key={dayOfWeek}
                  id={`day-${dayOfWeek}`}
                  className="border rounded-lg p-4 space-y-3 bg-white dark:bg-gray-950"
                >
                  {/* Day Header with Toggle */}
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-base">
                      {DAY_NAMES[dayOfWeek]}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor={`available-${dayOfWeek}`}
                        className="text-xs"
                      >
                        Disponible
                      </Label>
                      <Switch
                        id={`available-${dayOfWeek}`}
                        checked={schedule.is_available}
                        onCheckedChange={(checked) =>
                          updateSchedule(dayOfWeek, "is_available", checked)
                        }
                      />
                    </div>
                  </div>

                  {schedule.is_available && (
                    <div className="space-y-3">
                      {/* Morning Session - Enhanced Design */}
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-4 rounded-lg border border-blue-200 dark:border-blue-800 space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-300"></div>
                          <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100">
                            Session du matin
                          </h4>
                        </div>

                        <div className="bg-white dark:bg-gray-900 rounded p-3 space-y-2">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">
                                Heure de début
                              </Label>
                              <SessionTimePicker
                                value={schedule.morning_start}
                                onChange={(time) =>
                                  updateSchedule(
                                    dayOfWeek,
                                    "morning_start",
                                    time
                                  )
                                }
                                sessionType="morning"
                                emoji="☀️"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">
                                Heure de fin
                              </Label>
                              <SessionTimePicker
                                value={schedule.morning_end}
                                onChange={(time) =>
                                  updateSchedule(dayOfWeek, "morning_end", time)
                                }
                                sessionType="morning"
                                emoji="⏰"
                              />
                            </div>
                          </div>
                          {schedule.morning_start && schedule.morning_end && (
                            <div className="text-xs text-blue-700 dark:text-blue-300 font-medium bg-blue-50 dark:bg-blue-900 px-2 py-1 rounded">
                              ⏱️ Durée:{" "}
                              {(() => {
                                const [startHour, startMin] =
                                  schedule.morning_start.split(":").map(Number);
                                const [endHour, endMin] = schedule.morning_end
                                  .split(":")
                                  .map(Number);
                                const durationMin =
                                  endHour * 60 +
                                  endMin -
                                  (startHour * 60 + startMin);
                                const hours = Math.floor(durationMin / 60);
                                const mins = durationMin % 60;
                                return `${hours}h${
                                  mins > 0 ? mins + "min" : ""
                                }`;
                              })()}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Afternoon Session - Enhanced Design */}
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 p-4 rounded-lg border border-orange-200 dark:border-orange-800 space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-orange-600 dark:bg-orange-300"></div>
                          <h4 className="font-semibold text-sm text-orange-900 dark:text-orange-100">
                            Session de l&apos;après-midi
                          </h4>
                        </div>

                        <div className="bg-white dark:bg-gray-900 rounded p-3 space-y-2">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">
                                Heure de début
                              </Label>
                              <SessionTimePicker
                                value={schedule.afternoon_start}
                                onChange={(time) =>
                                  updateSchedule(
                                    dayOfWeek,
                                    "afternoon_start",
                                    time
                                  )
                                }
                                sessionType="afternoon"
                                emoji="🌤️"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">
                                Heure de fin
                              </Label>
                              <SessionTimePicker
                                value={schedule.afternoon_end}
                                onChange={(time) =>
                                  updateSchedule(
                                    dayOfWeek,
                                    "afternoon_end",
                                    time
                                  )
                                }
                                sessionType="afternoon"
                                emoji="🌅"
                              />
                            </div>
                          </div>
                          {schedule.afternoon_start &&
                            schedule.afternoon_end && (
                              <div className="text-xs text-orange-700 dark:text-orange-300 font-medium bg-orange-50 dark:bg-orange-900 px-2 py-1 rounded">
                                ⏱️ Durée:{" "}
                                {(() => {
                                  const [startHour, startMin] =
                                    schedule.afternoon_start
                                      .split(":")
                                      .map(Number);
                                  const [endHour, endMin] =
                                    schedule.afternoon_end
                                      .split(":")
                                      .map(Number);
                                  const durationMin =
                                    endHour * 60 +
                                    endMin -
                                    (startHour * 60 + startMin);
                                  const hours = Math.floor(durationMin / 60);
                                  const mins = durationMin % 60;
                                  return `${hours}h${
                                    mins > 0 ? mins + "min" : ""
                                  }`;
                                })()}
                              </div>
                            )}
                        </div>
                      </div>

                      {/* Appointment Duration */}
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 p-4 rounded-lg border border-purple-200 dark:border-purple-800 space-y-2">
                        <Label
                          htmlFor={`duration-${dayOfWeek}`}
                          className="text-xs font-semibold text-purple-900 dark:text-purple-100 flex items-center gap-2"
                        >
                          <span className="text-sm">⏳</span>
                          Durée de chaque rendez-vous
                        </Label>
                        <Select
                          value={schedule.appointment_duration?.toString()}
                          onValueChange={(value) =>
                            updateSchedule(
                              dayOfWeek,
                              "appointment_duration",
                              parseInt(value)
                            )
                          }
                        >
                          <SelectTrigger className="h-9 text-sm font-semibold border-2 border-purple-300 dark:border-purple-600 focus:border-purple-500 dark:focus:border-purple-400">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {APPOINTMENT_DURATIONS.map((duration) => (
                              <SelectItem
                                key={duration.value}
                                value={duration.value.toString()}
                              >
                                {duration.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {!schedule.is_available && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 italic py-2">
                      Non disponible ce jour
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>

        {/* Fixed Action Buttons - Always Visible at Bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 shadow-lg z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex gap-3">
            <Button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="flex-1 h-10"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Enregistrer
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                fetchMySchedule();
                setHasChanges(false);
              }}
              disabled={saving || !hasChanges}
              className="flex-1 h-10"
            >
              Annuler
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
