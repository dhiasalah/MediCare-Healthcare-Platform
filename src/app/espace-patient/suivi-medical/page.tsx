"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Activity, TrendingUp, Plus, AlertCircle } from "lucide-react";
import PatientLayout from "@/components/PatientLayout";
import Link from "next/link";
import { useState, useEffect } from "react";
import { medicalRecordsAPI } from "@/lib/api";

interface MedicalRecord {
  id: number;
  systolic_bp: number | null;
  diastolic_bp: number | null;
  heart_rate: number | null;
  temperature: number | null;
  respiratory_rate: number | null;
  oxygen_saturation: number | null;
  weight: number | null;
  height: number | null;
  waist_circumference: number | null;
  bmi: number | null;
  health_status: string;
  recorded_at: string;
  doctor_name: string;
}

export default function SuiviMedicalPage() {
  const [medicalRecord, setMedicalRecord] = useState<MedicalRecord | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatientData();
  }, []);

  const fetchPatientData = async () => {
    try {
      setLoading(true);

      // Get medical records
      const medicalRes = await medicalRecordsAPI.getMyRecords();

      if (medicalRes && medicalRes.length > 0) {
        setMedicalRecord(medicalRes[0]); // Get the latest record
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      // Don't show error to user - just display placeholders
    } finally {
      setLoading(false);
    }
  };

  const getHealthStatusDisplay = (
    status: string | undefined
  ): { label: string; color: string } => {
    const defaultStatus = { label: "N/A", color: "text-gray-600" };
    if (!status) return defaultStatus;

    switch (status) {
      case "good":
        return { label: "Bon", color: "text-green-600" };
      case "fair":
        return { label: "Moyen", color: "text-yellow-600" };
      case "poor":
        return { label: "Mauvais", color: "text-red-600" };
      default:
        return defaultStatus;
    }
  };

  return (
    <PatientLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Suivi Médical</h2>
            <p className="text-gray-600">
              Consultez et gérez vos données de santé
            </p>
          </div>
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Ajouter une mesure</span>
          </Button>
        </div>

        {/* Heart Disease Risk Assessment */}
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-900">
              <AlertCircle className="h-5 w-5 mr-2 text-blue-600" />
              Évaluation du Risque Cardiaque
            </CardTitle>
            <CardDescription>
              Faites une analyse prédictive de votre risque de maladie cardiaque
              basée sur vos données cliniques
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 mb-4">
              Notre outil d&apos;intelligence artificielle utilise vos mesures
              cliniques pour évaluer votre risque cardiaque et vous fournir des
              recommandations personnalisées.
            </p>
            <Link href="/espace-patient/heart-prediction">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Heart className="h-4 w-4 mr-2" />
                Accéder à l&apos;évaluation
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Health Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                État général
              </CardTitle>
              <Heart className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-gray-400">Chargement...</div>
              ) : medicalRecord ? (
                <>
                  <div
                    className={`text-2xl font-bold ${
                      getHealthStatusDisplay(medicalRecord.health_status).color
                    }`}
                  >
                    {getHealthStatusDisplay(medicalRecord.health_status).label}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Dernière évaluation:{" "}
                    {new Date(medicalRecord.recorded_at).toLocaleDateString(
                      "fr-FR"
                    )}
                  </p>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-gray-400">N/A</div>
                  <p className="text-xs text-muted-foreground">
                    En attente de données du médecin
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">IMC</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-gray-400">Chargement...</div>
              ) : medicalRecord && medicalRecord.bmi ? (
                <>
                  <div className="text-2xl font-bold">{medicalRecord.bmi}</div>
                  <p className="text-xs text-muted-foreground">
                    {medicalRecord.bmi < 18.5 && "Insuffisant poids (< 18.5)"}
                    {medicalRecord.bmi >= 18.5 &&
                      medicalRecord.bmi < 25 &&
                      "Normal (18.5-25)"}
                    {medicalRecord.bmi >= 25 &&
                      medicalRecord.bmi < 30 &&
                      "Surpoids (25-30)"}
                    {medicalRecord.bmi >= 30 && "Obésité (> 30)"}
                  </p>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-gray-400">N/A</div>
                  <p className="text-xs text-muted-foreground">
                    En attente de données
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Dernière visite
              </CardTitle>
              <Activity className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-gray-400">Chargement...</div>
              ) : medicalRecord ? (
                <>
                  <div className="text-2xl font-bold">
                    {new Date(medicalRecord.recorded_at).toLocaleDateString(
                      "fr-FR"
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Dr. {medicalRecord.doctor_name}
                  </p>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-gray-400">N/A</div>
                  <p className="text-xs text-muted-foreground">
                    Pas de visite enregistrée
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Vital Signs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Signes vitaux
            </CardTitle>
            <CardDescription>Vos mesures récentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200">
                <div>
                  <p className="font-medium">Tension artérielle</p>
                  <p className="text-sm text-gray-600">
                    Systolique / Diastolique
                  </p>
                </div>
                <div className="text-right">
                  {loading ? (
                    <p className="font-bold text-lg text-gray-400">
                      Chargement...
                    </p>
                  ) : medicalRecord &&
                    medicalRecord.systolic_bp &&
                    medicalRecord.diastolic_bp ? (
                    <>
                      <p className="font-bold text-lg text-green-600">
                        {medicalRecord.systolic_bp}/{medicalRecord.diastolic_bp}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(medicalRecord.recorded_at).toLocaleDateString(
                          "fr-FR"
                        )}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-bold text-lg text-gray-400">N/A</p>
                      <p className="text-xs text-gray-500">
                        En attente de données
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200">
                <div>
                  <p className="font-medium">Fréquence cardiaque</p>
                  <p className="text-sm text-gray-600">Battements par minute</p>
                </div>
                <div className="text-right">
                  {loading ? (
                    <p className="font-bold text-lg text-gray-400">
                      Chargement...
                    </p>
                  ) : medicalRecord && medicalRecord.heart_rate ? (
                    <>
                      <p className="font-bold text-lg text-green-600">
                        {medicalRecord.heart_rate} BPM
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(medicalRecord.recorded_at).toLocaleDateString(
                          "fr-FR"
                        )}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-bold text-lg text-gray-400">N/A</p>
                      <p className="text-xs text-gray-500">
                        En attente de données
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200">
                <div>
                  <p className="font-medium">Température</p>
                  <p className="text-sm text-gray-600">
                    Température corporelle
                  </p>
                </div>
                <div className="text-right">
                  {loading ? (
                    <p className="font-bold text-lg text-gray-400">
                      Chargement...
                    </p>
                  ) : medicalRecord && medicalRecord.temperature ? (
                    <>
                      <p className="font-bold text-lg text-green-600">
                        {medicalRecord.temperature}°C
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(medicalRecord.recorded_at).toLocaleDateString(
                          "fr-FR"
                        )}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-bold text-lg text-gray-400">N/A</p>
                      <p className="text-xs text-gray-500">
                        En attente de données
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200">
                <div>
                  <p className="font-medium">Fréquence respiratoire</p>
                  <p className="text-sm text-gray-600">
                    Respirations par minute
                  </p>
                </div>
                <div className="text-right">
                  {loading ? (
                    <p className="font-bold text-lg text-gray-400">
                      Chargement...
                    </p>
                  ) : medicalRecord && medicalRecord.respiratory_rate ? (
                    <>
                      <p className="font-bold text-lg text-green-600">
                        {medicalRecord.respiratory_rate} BPM
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(medicalRecord.recorded_at).toLocaleDateString(
                          "fr-FR"
                        )}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-bold text-lg text-gray-400">N/A</p>
                      <p className="text-xs text-gray-500">
                        En attente de données
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200">
                <div>
                  <p className="font-medium">Saturation en oxygène</p>
                  <p className="text-sm text-gray-600">
                    Pourcentage d&apos;oxygène dans le sang
                  </p>
                </div>
                <div className="text-right">
                  {loading ? (
                    <p className="font-bold text-lg text-gray-400">
                      Chargement...
                    </p>
                  ) : medicalRecord && medicalRecord.oxygen_saturation ? (
                    <>
                      <p className="font-bold text-lg text-green-600">
                        {medicalRecord.oxygen_saturation}%
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(medicalRecord.recorded_at).toLocaleDateString(
                          "fr-FR"
                        )}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-bold text-lg text-gray-400">N/A</p>
                      <p className="text-xs text-gray-500">
                        En attente de données
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Body Measurements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Mesures corporelles
            </CardTitle>
            <CardDescription>Suivi de votre évolution physique</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200">
                <div>
                  <p className="font-medium">Poids</p>
                  <p className="text-sm text-gray-600">Évolution mensuelle</p>
                </div>
                <div className="text-right">
                  {loading ? (
                    <p className="font-bold text-lg text-gray-400">
                      Chargement...
                    </p>
                  ) : medicalRecord && medicalRecord.weight ? (
                    <>
                      <p className="font-bold text-lg">
                        {medicalRecord.weight} kg
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(medicalRecord.recorded_at).toLocaleDateString(
                          "fr-FR"
                        )}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-bold text-lg text-gray-400">N/A</p>
                      <p className="text-xs text-gray-500">
                        En attente de données
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200">
                <div>
                  <p className="font-medium">Taille</p>
                  <p className="text-sm text-gray-600">Mesure de référence</p>
                </div>
                <div className="text-right">
                  {loading ? (
                    <p className="font-bold text-lg text-gray-400">
                      Chargement...
                    </p>
                  ) : medicalRecord && medicalRecord.height ? (
                    <>
                      <p className="font-bold text-lg">
                        {medicalRecord.height} cm
                      </p>
                      <p className="text-xs text-gray-500">
                        Mesure de référence
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-bold text-lg text-gray-400">N/A</p>
                      <p className="text-xs text-gray-500">
                        En attente de données
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200">
                <div>
                  <p className="font-medium">Tour de taille</p>
                  <p className="text-sm text-gray-600">Indicateur de santé</p>
                </div>
                <div className="text-right">
                  {loading ? (
                    <p className="font-bold text-lg text-gray-400">
                      Chargement...
                    </p>
                  ) : medicalRecord && medicalRecord.waist_circumference ? (
                    <>
                      <p className="font-bold text-lg text-green-600">
                        {medicalRecord.waist_circumference} cm
                      </p>
                      <p className="text-xs text-gray-500">
                        {medicalRecord.waist_circumference > 88
                          ? "Élevé"
                          : "Normal"}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-bold text-lg text-gray-400">N/A</p>
                      <p className="text-xs text-gray-500">
                        En attente de données
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PatientLayout>
  );
}
