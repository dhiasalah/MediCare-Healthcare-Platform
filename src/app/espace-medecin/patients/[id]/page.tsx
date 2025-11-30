"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Heart,
  Users,
  Shield,
  FileText,
  Download,
  Eye,
  Edit,
  Droplet,
  Clock,
  CheckCircle2,
  PauseCircle,
  XCircle,
  Timer,
  Sparkles,
  ChevronDown,
  ChevronUp,
  History,
} from "lucide-react";
import DoctorLayout from "@/components/DoctorLayout";
import { Patient } from "@/types";
import { usePatients } from "@/hooks/usePatients";
import api, { patientsAPI } from "@/lib/api";
import { showToast } from "@/hooks/useToast";
import { PrescribeMedicamentModal } from "@/components/doctor/PrescribeMedicamentModal";
import { Medicament } from "@/types/patient";
import { Pill, Plus } from "lucide-react";

interface Document {
  id: number;
  title: string;
  description: string;
  document_type: string;
  file: string;
  uploaded_at: string;
  uploaded_by_name?: string;
}

interface MedicalRecord {
  id: number;
  height?: number;
  weight?: number;
  blood_pressure?: string;
  heart_rate?: number;
  temperature?: number;
  notes?: string;
  [key: string]: unknown;
}

export default function PatientDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const { patients, isLoading } = usePatients();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [medicalRecord, setMedicalRecord] = useState<MedicalRecord | null>(
    null
  );
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [loadingMedicalRecord, setLoadingMedicalRecord] = useState(true);
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [loadingMedicaments, setLoadingMedicaments] = useState(true);
  const [isPrescribeModalOpen, setIsPrescribeModalOpen] = useState(false);

  // Display management states
  const [showAllActiveMeds, setShowAllActiveMeds] = useState(false);
  const [showHistoryMeds, setShowHistoryMeds] = useState(false);
  const [showAllDocuments, setShowAllDocuments] = useState(false);

  const ITEMS_LIMIT = 3; // Number of items to show initially

  useEffect(() => {
    if (!isLoading && patients.length > 0) {
      const foundPatient = patients.find((p) => p.id === parseInt(patientId));
      if (foundPatient) {
        setPatient(foundPatient);
      } else {
        showToast.error("Patient non trouvé");
        router.push("/espace-medecin/patients");
      }
    }
  }, [patients, isLoading, patientId, router]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await api.get(
          `/api/medical-documents/documents/patient/${patientId}/`
        );
        setDocuments(response.data || []);
      } catch (error) {
        console.error("Error fetching documents:", error);
        showToast.error("Erreur lors du chargement des documents");
      } finally {
        setLoadingDocuments(false);
      }
    };

    if (patientId) {
      fetchDocuments();
    }
  }, [patientId]);

  useEffect(() => {
    const fetchMedicalRecord = async () => {
      try {
        const data = await patientsAPI.getLatestMedicalRecord(
          parseInt(patientId)
        );
        setMedicalRecord(data);
      } catch (error) {
        console.error("Error fetching medical record:", error);
      } finally {
        setLoadingMedicalRecord(false);
      }
    };

    if (patientId) {
      fetchMedicalRecord();
    }
  }, [patientId]);

  const fetchMedicaments = async () => {
    try {
      const response = await api.get(
        `/api/patients/medicaments/?patient=${patientId}`
      );
      // Handle paginated response
      if (response.data.results && Array.isArray(response.data.results)) {
        setMedicaments(response.data.results);
      } else if (Array.isArray(response.data)) {
        setMedicaments(response.data);
      } else {
        setMedicaments([]);
      }
    } catch (error) {
      console.error("Error fetching medicaments:", error);
      setMedicaments([]);
    } finally {
      setLoadingMedicaments(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchMedicaments();
    }
  }, [patientId]);

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case "M":
        return "Masculin";
      case "F":
        return "Féminin";
      case "O":
        return "Autre";
      default:
        return "Non spécifié";
    }
  };

  const getHealthStatus = (medicalRecord: MedicalRecord | null) => {
    if (!medicalRecord)
      return { status: "Aucune donnée", color: "gray", bg: "gray-50" };

    const status = (medicalRecord.status as string)?.toLowerCase() || "";

    if (
      status.includes("bon") ||
      status.includes("good") ||
      status.includes("normal")
    ) {
      return { status: "Bon", color: "green", bg: "green-50" };
    } else if (
      status.includes("alerte") ||
      status.includes("warning") ||
      status.includes("attention")
    ) {
      return { status: "Alerte", color: "yellow", bg: "yellow-50" };
    } else if (
      status.includes("critique") ||
      status.includes("critical") ||
      status.includes("urgent")
    ) {
      return { status: "Critique", color: "red", bg: "red-50" };
    }

    return { status: "Normal", color: "blue", bg: "blue-50" };
  };

  const getDocumentTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      referral: "Lettre de référence",
      prescription: "Ordonnance",
      lab_result: "Résultat de laboratoire",
      imaging: "Imagerie médicale",
      report: "Rapport médical",
      other: "Autre",
    };
    return types[type] || type;
  };

  const handleDownload = async (document: Document) => {
    try {
      window.open(document.file, "_blank");
    } catch (error) {
      console.error("Error downloading document:", error);
      showToast.error("Erreur lors du téléchargement");
    }
  };

  if (isLoading || !patient) {
    return (
      <DoctorLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/espace-medecin/patients")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {patient.first_name} {patient.last_name}
            </h2>
            <p className="text-gray-600 mt-1">Dossier patient complet</p>
          </div>
          <div className="ml-auto">
            <Button
              variant="outline"
              onClick={() =>
                router.push(`/espace-medecin/patients?edit=${patientId}`)
              }
            >
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </div>
        </div>

        {/* Patient Summary Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                    patient.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      patient.is_active ? "bg-green-600" : "bg-red-600"
                    }`}
                  ></div>
                  {patient.is_active ? "Actif" : "Inactif"}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {patient.first_name?.[0]}
                {patient.last_name?.[0]}
              </div>
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Âge</p>
                  <p className="text-lg font-semibold">
                    {patient.date_of_birth
                      ? `${calculateAge(patient.date_of_birth)} ans`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Genre</p>
                  <p className="text-lg font-semibold">
                    {getGenderLabel(patient.gender || "")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Groupe sanguin</p>
                  <p className="text-lg font-semibold flex items-center gap-1">
                    {patient.blood_type ? (
                      <>
                        <Droplet className="h-4 w-4 text-red-500" />
                        {patient.blood_type}
                      </>
                    ) : (
                      "N/A"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Créé le</p>
                  <p className="text-lg font-semibold">
                    {patient.created_at
                      ? new Date(patient.created_at).toLocaleDateString("fr-FR")
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Renseignements / Patient Information */}
          <Card className="h-full">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-200 rounded-lg flex items-center justify-center">
                    <User className="h-4 w-4 text-purple-700" />
                  </div>
                  Renseignements
                </CardTitle>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                    patient.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      patient.is_active ? "bg-green-600" : "bg-red-600"
                    }`}
                  ></div>
                  {patient.is_active ? "Actif" : "Inactif"}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">ID Patient</p>
                  <p className="font-medium">#{patient.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Âge</p>
                  <p className="font-medium">
                    {patient.date_of_birth
                      ? `${calculateAge(patient.date_of_birth)} ans`
                      : "N/A"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Genre</p>
                  <p className="font-medium">
                    {getGenderLabel(patient.gender || "")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Groupe sanguin</p>
                  <p className="font-medium">
                    {patient.blood_type ? patient.blood_type : "Non renseigné"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date de création</p>
                <p className="font-medium">
                  {patient.created_at
                    ? new Date(patient.created_at).toLocaleDateString("fr-FR")
                    : "N/A"}
                </p>
              </div>

              {/* Medical Record Data */}
              {!loadingMedicalRecord && medicalRecord && (
                <>
                  <div
                    className={`border-t pt-4 mt-4 bg-gradient-to-br from-${
                      getHealthStatus(medicalRecord).bg
                    } to-white p-4 rounded-lg`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Données médicales
                      </p>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 bg-${
                          getHealthStatus(medicalRecord).color
                        }-100 text-${getHealthStatus(medicalRecord).color}-700`}
                      >
                        <Heart className="h-4 w-4" />
                        {getHealthStatus(medicalRecord).status}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(medicalRecord).map(([key, value]) => {
                        // Skip specific fields including record_at and recorded_at
                        const fieldsToSkip = [
                          "id",
                          "created_at",
                          "updated_at",
                          "patient",
                          "doctor",
                          "patient_name",
                          "doctor_name",
                          "record_created_at",
                          "record_updated_at",
                          "recorded_at",
                          "record_at",
                          "status",
                        ];

                        if (fieldsToSkip.includes(key) || !value) return null;

                        // Format key name for display
                        const displayKey = key
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase());

                        // Format value to string
                        const displayValue = String(value);

                        return (
                          <div key={key}>
                            <p className="text-sm text-gray-600">
                              {displayKey}
                            </p>
                            <p className="font-medium break-words">
                              {displayValue}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="h-full">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center">
                  <Mail className="h-4 w-4 text-blue-700" />
                </div>
                Informations de contact
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {patient.email && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <Mail className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Email
                    </p>
                    <p className="font-medium text-gray-900 break-all">
                      {patient.email}
                    </p>
                  </div>
                </div>
              )}
              {patient.phone && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <Phone className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Téléphone
                    </p>
                    <p className="font-medium text-gray-900">{patient.phone}</p>
                  </div>
                </div>
              )}
              {patient.address && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <MapPin className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Adresse
                    </p>
                    <p className="font-medium text-gray-900">
                      {patient.address}
                    </p>
                  </div>
                </div>
              )}
              {patient.date_of_birth && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <Calendar className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Date de naissance
                    </p>
                    <p className="font-medium text-gray-900">
                      {new Date(patient.date_of_birth).toLocaleDateString(
                        "fr-FR"
                      )}
                    </p>
                  </div>
                </div>
              )}
              {!patient.email &&
                !patient.phone &&
                !patient.address &&
                !patient.date_of_birth && (
                  <div className="text-center py-6 text-gray-500">
                    <p className="text-sm">
                      Aucune information de contact disponible
                    </p>
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card className="h-full">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center">
                  <Heart className="h-4 w-4 text-blue-700" />
                </div>
                Informations médicales
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Allergies</p>
                <p className="font-medium whitespace-pre-wrap">
                  {patient.allergies || "Aucune allergie connue"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Antécédents médicaux
                </p>
                <p className="font-medium whitespace-pre-wrap">
                  {patient.medical_history || "Aucun antécédent renseigné"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className="h-full">
            <CardHeader className="bg-red-50">
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-200 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-red-700" />
                </div>
                Contact d&apos;urgence
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600">Nom</p>
                <p className="font-medium">
                  {patient.emergency_contact_name || "Non renseigné"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Téléphone</p>
                <p className="font-medium">
                  {patient.emergency_contact_phone || "Non renseigné"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Relation</p>
                <p className="font-medium">
                  {patient.emergency_contact_relation || "Non renseignée"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Insurance Information */}
          <Card className="h-full">
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-200 rounded-lg flex items-center justify-center">
                  <Shield className="h-4 w-4 text-green-700" />
                </div>
                Assurance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600">Assureur</p>
                <p className="font-medium">
                  {patient.insurance_provider || "Non renseigné"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Numéro d&apos;assurance</p>
                <p className="font-medium">
                  {patient.insurance_number || "Non renseigné"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Medicaments Section */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-sm">
                  <Pill className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Traitements</CardTitle>
                  <CardDescription className="mt-1">
                    {medicaments.filter((m) => m.status === "active").length}{" "}
                    actif(s) ·{" "}
                    {medicaments.filter((m) => m.status !== "active").length}{" "}
                    historique
                  </CardDescription>
                </div>
              </div>
              <Button
                onClick={() => setIsPrescribeModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 shadow-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Prescrire
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {loadingMedicaments ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
              </div>
            ) : medicaments.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Pill className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun traitement
                </h3>
                <p className="text-gray-500 mb-4">
                  Ce patient n&apos;a pas de traitement en cours
                </p>
                <Button
                  onClick={() => setIsPrescribeModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Prescrire un médicament
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Active Medications */}
                {medicaments.filter((m) => m.status === "active").length >
                  0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">
                          En cours
                        </h3>
                        <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-0.5 rounded-full">
                          {
                            medicaments.filter((m) => m.status === "active")
                              .length
                          }
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {medicaments
                        .filter((m) => m.status === "active")
                        .slice(0, showAllActiveMeds ? undefined : ITEMS_LIMIT)
                        .map((med) => (
                          <div
                            key={med.id}
                            className="bg-white border border-emerald-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-200"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="h-11 w-11 rounded-xl flex items-center justify-center shadow-sm bg-gradient-to-br from-emerald-400 to-teal-500">
                                  <Pill className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">
                                    {med.name}
                                  </h4>
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
                                    <CheckCircle2 className="h-3 w-3" /> Actif
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">Dosage:</span>
                                <span className="font-medium">
                                  {med.dosage}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">
                                  Fréquence:
                                </span>
                                <span className="font-medium">
                                  {med.frequency}
                                </span>
                              </div>
                              {med.duration_days && (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500">Durée:</span>
                                  <span className="font-medium">
                                    {med.duration_days} jours
                                  </span>
                                  {med.days_remaining !== null &&
                                    med.days_remaining !== undefined &&
                                    med.days_remaining > 0 && (
                                      <span className="text-xs text-orange-600 font-medium">
                                        ({med.days_remaining}j restants)
                                      </span>
                                    )}
                                </div>
                              )}
                            </div>
                            {med.instructions && (
                              <div className="bg-amber-50 border border-amber-100 rounded-lg p-2 mt-3">
                                <p className="text-xs text-amber-700 line-clamp-2">
                                  {med.instructions}
                                </p>
                              </div>
                            )}
                            <div className="mt-3 pt-2 border-t border-gray-100 text-xs text-gray-500 flex items-center justify-between">
                              <span>
                                {new Date(med.created_at).toLocaleDateString(
                                  "fr-FR"
                                )}
                              </span>
                              {med.doctor_name && (
                                <span>{med.doctor_name}</span>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                    {medicaments.filter((m) => m.status === "active").length >
                      ITEMS_LIMIT && (
                      <Button
                        variant="ghost"
                        className="w-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        onClick={() => setShowAllActiveMeds(!showAllActiveMeds)}
                      >
                        {showAllActiveMeds ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-2" /> Voir moins
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-2" /> Voir tout (
                            {medicaments.filter((m) => m.status === "active")
                              .length - ITEMS_LIMIT}{" "}
                            de plus)
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}

                {/* History Medications */}
                {medicaments.filter((m) => m.status !== "active").length >
                  0 && (
                  <div className="space-y-4">
                    <button
                      onClick={() => setShowHistoryMeds(!showHistoryMeds)}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-gray-200 rounded-lg flex items-center justify-center">
                          <History className="h-4 w-4 text-gray-600" />
                        </div>
                        <h3 className="font-semibold text-gray-700">
                          Historique
                        </h3>
                        <span className="bg-gray-200 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
                          {
                            medicaments.filter((m) => m.status !== "active")
                              .length
                          }
                        </span>
                      </div>
                      {showHistoryMeds ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </button>

                    {showHistoryMeds && (
                      <div className="space-y-2 pl-2">
                        {medicaments
                          .filter((m) => m.status !== "active")
                          .map((med) => (
                            <div
                              key={med.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-lg flex items-center justify-center bg-gray-200">
                                  <Pill className="h-4 w-4 text-gray-500" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-700">
                                    {med.name}
                                  </h4>
                                  <p className="text-xs text-gray-500">
                                    {med.dosage} · {med.frequency}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                                    med.status === "stopped"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {med.status === "stopped"
                                    ? "Arrêté"
                                    : "Terminé"}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {new Date(med.created_at).toLocaleDateString(
                                    "fr-FR"
                                  )}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documents Section */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-sm">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Documents médicaux</CardTitle>
                <CardDescription className="mt-1">
                  {documents.length} document(s) disponible(s)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {loadingDocuments ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun document
                </h3>
                <p className="text-gray-500">
                  Les documents ajoutés apparaîtront ici
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents
                    .slice(0, showAllDocuments ? undefined : ITEMS_LIMIT)
                    .map((doc) => (
                      <div
                        key={doc.id}
                        className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                            <FileText className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate text-sm">
                              {doc.title}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                                {getDocumentTypeLabel(doc.document_type)}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(doc.uploaded_at).toLocaleDateString(
                                  "fr-FR"
                                )}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                              onClick={() => window.open(doc.file, "_blank")}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-indigo-50 hover:text-indigo-600"
                              onClick={() => handleDownload(doc)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {documents.length > ITEMS_LIMIT && (
                  <Button
                    variant="ghost"
                    className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => setShowAllDocuments(!showAllDocuments)}
                  >
                    {showAllDocuments ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-2" /> Voir moins
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-2" /> Voir tout (
                        {documents.length - ITEMS_LIMIT} de plus)
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {patient && (
        <PrescribeMedicamentModal
          isOpen={isPrescribeModalOpen}
          onClose={() => setIsPrescribeModalOpen(false)}
          onSuccess={fetchMedicaments}
          patientId={patient.id}
        />
      )}
    </DoctorLayout>
  );
}
