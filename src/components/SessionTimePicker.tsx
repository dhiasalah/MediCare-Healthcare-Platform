"use client";

import { useState, useRef, useEffect } from "react";

interface TimePickerProps {
  value: string | null | undefined;
  onChange: (time: string | null) => void;
  sessionType: "morning" | "afternoon";
  emoji: string;
  label?: string;
}

/**
 * Custom time picker that shows only appropriate times for the session
 * Morning: 7:00 - 12:30 (every 30 minutes)
 * Afternoon: 13:00 - 19:00 (every 30 minutes)
 */
export function SessionTimePicker({
  value,
  onChange,
  sessionType,
  emoji,
  label = "Sélectionner heure",
}: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Generate time slots based on session type
  const generateTimeSlots = () => {
    const slots: string[] = [];

    if (sessionType === "morning") {
      // Morning: 7:00 to 12:00 (every 30 minutes)
      for (let hour = 7; hour <= 12; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          if (hour === 12 && minute > 0) break; // Stop at 12:00
          slots.push(
            `${String(hour).padStart(2, "0")}:${String(minute).padStart(
              2,
              "0"
            )}`
          );
        }
      }
    } else if (sessionType === "afternoon") {
      // Afternoon: 13:00 to 19:00 (every 30 minutes)
      for (let hour = 13; hour <= 19; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          slots.push(
            `${String(hour).padStart(2, "0")}:${String(minute).padStart(
              2,
              "0"
            )}`
          );
        }
      }
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  const formatDisplayTime = (timeValue: string | null | undefined) => {
    if (!timeValue) return label;
    return timeValue;
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full h-9 text-sm font-semibold border-2 border-blue-300 dark:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-md bg-white dark:bg-gray-950 px-3 py-2 text-left flex items-center justify-between cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
      >
        <span>{formatDisplayTime(value)}</span>
        <span className="text-lg">{emoji}</span>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border-2 border-blue-300 dark:border-blue-600 rounded-lg shadow-lg z-50">
          <div className="max-h-64 overflow-y-auto">
            <div className="p-2 space-y-1">
              {/* Clear button */}
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded transition-colors"
              >
                ✕ Effacer
              </button>

              {/* Time slots */}
              {timeSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => {
                    onChange(time);
                    setOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm font-semibold rounded transition-colors flex items-center justify-between ${
                    value === time
                      ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                      : "hover:bg-blue-100 dark:hover:bg-blue-900 text-gray-900 dark:text-gray-100"
                  }`}
                >
                  <span className="font-mono">{time}</span>
                  {sessionType === "morning" && (
                    <span className="text-xs opacity-60">☀️</span>
                  )}
                  {sessionType === "afternoon" && (
                    <span className="text-xs opacity-60">🌤️</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
