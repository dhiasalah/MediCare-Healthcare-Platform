"use client";

import PatientLayout from "@/components/PatientLayout";

export function LoadingState() {
  return (
    <PatientLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Chargement...</p>
      </div>
    </PatientLayout>
  );
}
