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
} from "lucide-react";
import DoctorLayout from "@/components/DoctorLayout";
import { Patient } from "@/types";
import { usePatients } from "@/hooks/usePatients";
import api, { patientsAPI } from "@/lib/api";
import { showToast } from "@/hooks/useToast";

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

        {/* Documents Section */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents médicaux
            </CardTitle>
            <CardDescription>
              Tous les documents associés à ce patient
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingDocuments ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">
                  Aucun document disponible
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Les documents ajoutés apparaîtront ici
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {doc.title}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {doc.description}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                          <span>{getDocumentTypeLabel(doc.document_type)}</span>
                          <span>•</span>
                          <span>
                            {new Date(doc.uploaded_at).toLocaleDateString(
                              "fr-FR"
                            )}
                          </span>
                          {doc.uploaded_by_name && (
                            <>
                              <span>•</span>
                              <span>Par: {doc.uploaded_by_name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(doc.file, "_blank")}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(doc)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Télécharger
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DoctorLayout>
  );
}
