"use client";

import { Button } from "@/components/ui/button";
import {
  Pill,
  Clock,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  PauseCircle,
  User,
  FileText,
  Timer,
  Sparkles,
  History,
  ChevronDown,
  ChevronUp,
  XCircle,
} from "lucide-react";
import PatientLayout from "@/components/PatientLayout";
import { useMedicaments } from "@/hooks/patient/useMedicaments";
import { LoadingState } from "@/components/patient/LoadingState";
import { AddMedicamentModal } from "@/components/patient/AddMedicamentModal";
import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function MedicamentsPage() {
  const {
    medicaments,
    isLoading,
    updateMedicament,
    deleteMedicament,
    fetchMedicaments,
  } = useMedicaments();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showAllActive, setShowAllActive] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const ITEMS_LIMIT = 6; // Number of items to show initially

  if (isLoading) {
    return (
      <PatientLayout>
        <LoadingState />
      </PatientLayout>
    );
  }

  const activeMedicaments = medicaments.filter((m) => m.status === "active");
  const historyMedicaments = medicaments.filter((m) => m.status !== "active");

  return (
    <PatientLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Pill className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Mes Médicaments</h1>
                <p className="text-emerald-100 mt-1">
                  Gérez vos traitements et suivez vos prises
                </p>
              </div>
            </div>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-white text-emerald-600 hover:bg-emerald-50 shadow-md font-medium px-6"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Ajouter un médicament
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-200" />
                <span className="text-emerald-100 text-sm">En cours</span>
              </div>
              <p className="text-3xl font-bold mt-2">
                {activeMedicaments.length}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <History className="h-5 w-5 text-emerald-200" />
                <span className="text-emerald-100 text-sm">Historique</span>
              </div>
              <p className="text-3xl font-bold mt-2">
                {historyMedicaments.length}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-emerald-200" />
                <span className="text-emerald-100 text-sm">Total</span>
              </div>
              <p className="text-3xl font-bold mt-2">{medicaments.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-emerald-200" />
                <span className="text-emerald-100 text-sm">
                  Aujourd&apos;hui
                </span>
              </div>
              <p className="text-lg font-medium mt-2">
                {format(new Date(), "d MMM", { locale: fr })}
              </p>
            </div>
          </div>
        </div>

        <AddMedicamentModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={fetchMedicaments}
        />

        {/* Current Medications */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Pill className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Traitements en cours
              </h2>
              <p className="text-sm text-gray-500">Vos médicaments actifs</p>
            </div>
          </div>

          {activeMedicaments.length === 0 ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Pill className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun traitement en cours
              </h3>
              <p className="text-gray-500 mb-6">
                Ajoutez vos médicaments pour suivre vos traitements
              </p>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un médicament
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                {activeMedicaments
                  .slice(0, showAllActive ? undefined : ITEMS_LIMIT)
                  .map((med) => (
                    <div
                      key={med.id}
                      className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:border-emerald-200 flex flex-col h-full"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-sm">
                            <Pill className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {med.name}
                            </h3>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                              <CheckCircle2 className="h-3 w-3" />
                              Actif
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Details - flex-1 to take remaining space */}
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3 text-sm">
                          <div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-blue-600">
                              mg
                            </span>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Dosage</p>
                            <p className="font-medium text-gray-900">
                              {med.dosage}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                          <div className="h-8 w-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Clock className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Fréquence</p>
                            <p className="font-medium text-gray-900">
                              {med.frequency}
                            </p>
                          </div>
                        </div>

                        {med.duration_days && (
                          <div className="flex items-center gap-3 text-sm">
                            <div className="h-8 w-8 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Timer className="h-4 w-4 text-orange-600" />
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs">Durée</p>
                              <p className="font-medium text-gray-900">
                                {med.duration_days} jours
                              </p>
                              {med.days_remaining !== null &&
                                med.days_remaining > 0 && (
                                  <p className="text-xs text-orange-600 font-medium">
                                    {med.days_remaining} jour
                                    {med.days_remaining > 1 ? "s" : ""} restant
                                    {med.days_remaining > 1 ? "s" : ""}
                                  </p>
                                )}
                            </div>
                          </div>
                        )}

                        {med.doctor_name && (
                          <div className="flex items-center gap-3 text-sm">
                            <div className="h-8 w-8 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                              <User className="h-4 w-4 text-teal-600" />
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs">
                                Prescrit par
                              </p>
                              <p className="font-medium text-gray-900">
                                {med.doctor_name}
                              </p>
                            </div>
                          </div>
                        )}

                        {med.start_date && (
                          <div className="flex items-center gap-3 text-sm">
                            <div className="h-8 w-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Calendar className="h-4 w-4 text-indigo-600" />
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs">Début</p>
                              <p className="font-medium text-gray-900">
                                {format(
                                  new Date(med.start_date),
                                  "d MMMM yyyy",
                                  { locale: fr }
                                )}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Instructions */}
                        {med.instructions && (
                          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mt-4">
                            <div className="flex items-start gap-2">
                              <FileText className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-medium text-amber-800 mb-1">
                                  Instructions
                                </p>
                                <p className="text-sm text-amber-700">
                                  {med.instructions}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action - always at bottom */}
                      <Button
                        variant="outline"
                        className="w-full border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 mt-4"
                        onClick={() =>
                          updateMedicament(med.id, { status: "stopped" })
                        }
                      >
                        <PauseCircle className="h-4 w-4 mr-2" />
                        Arrêter le traitement
                      </Button>
                    </div>
                  ))}
              </div>

              {/* Show more/less button */}
              {activeMedicaments.length > ITEMS_LIMIT && (
                <Button
                  variant="ghost"
                  className="w-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                  onClick={() => setShowAllActive(!showAllActive)}
                >
                  {showAllActive ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-2" /> Voir moins
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" /> Voir tout (
                      {activeMedicaments.length - ITEMS_LIMIT} de plus)
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Medication History */}
        {historyMedicaments.length > 0 && (
          <div className="space-y-4">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-200 rounded-xl flex items-center justify-center">
                  <History className="h-5 w-5 text-gray-600" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg font-bold text-gray-700">
                    Historique des traitements
                  </h2>
                  <p className="text-sm text-gray-500">
                    {historyMedicaments.length} traitement(s) passé(s)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-gray-200 text-gray-600 text-sm font-medium px-3 py-1 rounded-full">
                  {historyMedicaments.length}
                </span>
                {showHistory ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </div>
            </button>

            {showHistory && (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {historyMedicaments.map((med) => (
                    <div
                      key={med.id}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Pill className="h-5 w-5 text-gray-500" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {med.name}
                            </h4>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              <span>{med.dosage}</span>
                              <span>•</span>
                              <span>{med.frequency}</span>
                              <span>•</span>
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                  med.status === "stopped"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {med.status === "stopped" ? (
                                  <>
                                    <XCircle className="h-3 w-3" />
                                    Arrêté
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="h-3 w-3" />
                                    Terminé
                                  </>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => deleteMedicament(med.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PatientLayout>
  );
}
