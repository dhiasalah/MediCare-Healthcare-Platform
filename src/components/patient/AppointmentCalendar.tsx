"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimeSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  duration_minutes: number;
  doctor_id?: number;
  doctor_name?: string;
}

interface AppointmentCalendarProps {
  slots: TimeSlot[];
  onSelectSlot: (slot: TimeSlot) => void;
  selectedSlot?: TimeSlot | null;
}

export function AppointmentCalendar({
  slots,
  onSelectSlot,
  selectedSlot,
}: AppointmentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [groupedSlots, setGroupedSlots] = useState<Map<string, TimeSlot[]>>(
    new Map()
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Group slots by date
  useEffect(() => {
    const grouped = new Map<string, TimeSlot[]>();
    slots.forEach((slot) => {
      if (!grouped.has(slot.date)) {
        grouped.set(slot.date, []);
      }
      grouped.get(slot.date)!.push(slot);
    });
    setGroupedSlots(grouped);
  }, [slots]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    // getDay() returns 0=Sunday, 1=Monday, ..., 6=Saturday
    // But we want Monday-first week (0=Monday, 1=Tuesday, ..., 6=Sunday)
    // So we need to convert: (getDay() + 6) % 7
    const jsDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return jsDay === 0 ? 6 : jsDay - 1;
  };

  const previousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
    setSelectedDate(null);
  };

  const formatDate = (year: number, month: number, day: number): string => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days: (number | null)[] = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add days of month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthName = currentMonth.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="w-full space-y-6">
      {/* Calendar View */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6 shadow-sm">
        {/* Month Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold capitalize text-gray-900">
              {monthName}
            </h3>
            <p className="text-sm text-gray-600 mt-1">Sélectionnez une date</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={previousMonth}
              className="h-10 w-10 bg-white hover:bg-blue-50 border-gray-300"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextMonth}
              className="h-10 w-10 bg-white hover:bg-blue-50 border-gray-300"
            >
              <ChevronRight className="h-5 w-5 text-gray-700" />
            </Button>
          </div>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-3 mb-4">
          {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-bold text-gray-600 uppercase tracking-wider"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-3">
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} />;
            }

            const dateStr = formatDate(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              day
            );
            const daySlots = groupedSlots.get(dateStr) || [];
            const hasSlots = daySlots.length > 0;
            const isToday = new Date(dateStr).getTime() === today.getTime();
            const isPast = new Date(dateStr) < today;
            const isSelected = selectedDate === dateStr;

            return (
              <button
                key={day}
                onClick={() => {
                  if (hasSlots && !isPast) {
                    setSelectedDate(dateStr);
                  }
                }}
                disabled={!hasSlots || isPast}
                className={`
                  aspect-square rounded-lg p-2 text-center transition-all duration-300
                  flex flex-col items-center justify-center relative
                  ${
                    isPast
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                      : ""
                  }
                  ${
                    !hasSlots && !isPast
                      ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                      : ""
                  }
                  ${
                    hasSlots && !isPast && !isSelected
                      ? "bg-white text-gray-900 hover:shadow-md hover:border-blue-300 cursor-pointer border-2 border-blue-100"
                      : ""
                  }
                  ${
                    isSelected
                      ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-2 border-indigo-700 shadow-lg scale-105"
                      : ""
                  }
                  ${
                    isToday && !isSelected
                      ? "border-2 border-blue-400 ring-2 ring-blue-200"
                      : ""
                  }
                `}
              >
                <span className="text-sm font-semibold">{day}</span>
                {hasSlots && !isPast && (
                  <div
                    className={`flex items-center justify-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                      isSelected
                        ? "bg-blue-200 text-blue-900"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    <Clock className="h-3 w-3" />
                    {daySlots.length}
                  </div>
                )}
                {isToday && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slots View */}
      {selectedDate && (
        <div className="animate-fadeIn">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white mb-4">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="h-6 w-6" />
              <h4 className="text-xl font-bold">Sélectionnez votre horaire</h4>
            </div>
            <p className="text-blue-100 text-sm">
              {new Date(selectedDate).toLocaleDateString("fr-FR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {(() => {
              const now = new Date();
              const isToday =
                new Date(selectedDate).toDateString() === now.toDateString();
              const currentTimeInMinutes =
                now.getHours() * 60 + now.getMinutes();

              const allSlots = groupedSlots.get(selectedDate) || [];
              const filteredSlots = allSlots.filter((slot) => {
                if (!isToday) {
                  // For future dates, show all slots
                  return true;
                }
                // For today, filter out slots that have already passed
                const [hours, minutes] = slot.start_time
                  .substring(0, 5)
                  .split(":")
                  .map(Number);
                const slotTimeInMinutes = hours * 60 + minutes;
                return slotTimeInMinutes >= currentTimeInMinutes;
              });

              return filteredSlots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => onSelectSlot(slot)}
                  className={`
                    p-4 rounded-xl font-medium transition-all duration-300
                    flex flex-col items-center justify-center gap-1 relative
                    group
                    ${
                      selectedSlot?.id === slot.id
                        ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white border-2 border-green-700 shadow-lg scale-105"
                        : "bg-white text-gray-900 border-2 border-gray-200 hover:border-blue-400 hover:shadow-md hover:bg-blue-50 cursor-pointer"
                    }
                  `}
                >
                  {selectedSlot?.id === slot.id && (
                    <CheckCircle2 className="h-5 w-5 absolute top-1 right-1" />
                  )}
                  <Clock className="h-5 w-5" />
                  <span className="text-sm">
                    {slot.start_time.substring(0, 5)}
                  </span>
                  <span
                    className={`text-xs ${
                      selectedSlot?.id === slot.id
                        ? "text-green-100"
                        : "text-gray-500"
                    }`}
                  >
                    {String(slot.duration_minutes)} min
                  </span>
                </button>
              ));
            })()}
          </div>

          {(() => {
            const now = new Date();
            const isToday =
              new Date(selectedDate).toDateString() === now.toDateString();
            const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
            const allSlots = groupedSlots.get(selectedDate) || [];
            const filteredSlots = allSlots.filter((slot) => {
              if (!isToday) return true;
              const [hours, minutes] = slot.start_time
                .substring(0, 5)
                .split(":")
                .map(Number);
              const slotTimeInMinutes = hours * 60 + minutes;
              return slotTimeInMinutes >= currentTimeInMinutes;
            });
            return (
              filteredSlots.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    Aucun créneau disponible pour cette date
                  </p>
                </div>
              )
            );
          })()}
        </div>
      )}

      {/* Selected Slot Summary */}
      {selectedSlot && (
        <div className="animate-slideUp bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 p-6 shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Créneau sélectionné
            </p>
          </div>
          <p className="text-2xl font-bold text-green-900">
            {new Date(selectedSlot.date).toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          <p className="text-lg font-semibold text-green-700 mt-2 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {selectedSlot.start_time.substring(0, 5)} -{" "}
            {selectedSlot.end_time.substring(0, 5)}
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 border border-gray-200">
        <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
          Légende
        </h5>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border-2 border-blue-100 rounded flex-shrink-0" />
            <span className="text-xs text-gray-600">Créneaux disponibles</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 rounded flex-shrink-0" />
            <span className="text-xs text-gray-600">Indisponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded flex-shrink-0" />
            <span className="text-xs text-gray-600">Jour sélectionné</span>
          </div>
        </div>
      </div>
    </div>
  );
}
