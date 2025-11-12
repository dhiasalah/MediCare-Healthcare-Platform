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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Heart,
  FileText,
  Pill,
  Stethoscope,
  Download,
  Share2,
  Edit,
  Clock,
  Droplet,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  Users,
  Calendar,
} from "lucide-react";
import { Patient } from "@/types";
import {
  medicalDocumentsAPI,
  consultationHistoryAPI,
  medicalRecordsAPI,
} from "@/lib/api";
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

interface Consultation {
  id: number;
  status: string;
  chief_complaint: string;
  diagnosis: string;
  assessment: string;
  treatment_plan: string;
  prescriptions: string;
  created_at: string;
  created_by: string;
  vital_signs?: Record<string, unknown>;
}

interface MedicalRecord {
  id: number;
  health_status: string;
  systolic_bp?: number;
  diastolic_bp?: number;
  heart_rate?: number;
  temperature?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
  weight?: number;
  height?: number;
  recorded_at: string;
}

interface DossierMedicalDetailProps {
  patient: Patient;
}

export default function DossierMedicalDetail({
  patient,
}: DossierMedicalDetailProps) {
  const [activeTab, setActiveTab] = useState("informations");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [medicalRecord, setMedicalRecord] = useState<MedicalRecord | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch documents
        const docsData = await medicalDocumentsAPI.getPatientDocuments(
          patient.id
        );
        setDocuments(Array.isArray(docsData) ? docsData : []);

        // Fetch consultations
        const consultData =
          await consultationHistoryAPI.getPatientConsultations(patient.id);
        setConsultations(Array.isArray(consultData) ? consultData : []);

        // Fetch latest medical record
        const medicalData = await medicalRecordsAPI.getPatientLatest(
          patient.id
        );
        setMedicalRecord(medicalData || null);
      } catch (err) {
        console.error("Error fetching dossier data:", err);
        showToast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patient.id]);

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      medical_test: "Résultat de test médical",
      prescription: "Ordonnance",
      medical_image: "Image médicale",
      report: "Rapport médical",
      insurance: "Document d'assurance",
      other: "Autre",
    };
    return labels[type] || type;
  };

  const getDocumentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      medical_test: "bg-blue-100 text-blue-800",
      prescription: "bg-green-100 text-green-800",
      medical_image: "bg-purple-100 text-purple-800",
      report: "bg-orange-100 text-orange-800",
      insurance: "bg-red-100 text-red-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateAge = () => {
    const today = new Date();
    const birthDate = new Date(patient.date_of_birth);
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

  return (
    <div className="space-y-6">
      {/* Patient Header Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-6">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white">
                <User className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {patient.first_name} {patient.last_name}
                  </h1>
                  <p className="text-sm text-gray-600">
                    Dossier médical complet
                  </p>
                </div>
                <div className="grid grid-cols-4 gap-6 mt-4 text-sm">
                  <div>
                    <span className="text-gray-600">Âge:</span>
                    <p className="font-medium text-gray-900">
                      {calculateAge()} ans
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Genre:</span>
                    <p className="font-medium text-gray-900">
                      {patient.gender === "M" ? "Masculin" : "Féminin"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Groupe sanguin:</span>
                    <p className="font-medium text-gray-900">
                      {patient.blood_type || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Statut:</span>
                    <p className="font-medium">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Actif
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button size="sm" variant="outline" className="gap-2">
                <Edit className="h-4 w-4" />
                Modifier
              </Button>
              <Button size="sm" variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Télécharger
              </Button>
              <Button size="sm" variant="outline" className="gap-2">
                <Share2 className="h-4 w-4" />
                Partager
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="informations" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Informations</span>
          </TabsTrigger>
          <TabsTrigger value="medical" className="gap-2">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Médical</span>
          </TabsTrigger>
          <TabsTrigger value="consultations" className="gap-2">
            <Stethoscope className="h-4 w-4" />
            <span className="hidden sm:inline">Consultations</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Documents</span>
          </TabsTrigger>
          <TabsTrigger value="contacts" className="gap-2">
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">Contacts</span>
          </TabsTrigger>
        </TabsList>

        {/* Informations Personnelles Tab */}
        <TabsContent value="informations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  Coordonnées
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <p className="font-medium text-gray-900">{patient.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Téléphone</label>
                  <p className="font-medium text-gray-900">{patient.phone}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Adresse</label>
                  <p className="font-medium text-gray-900 flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <span>{patient.address}</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Identification */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                  Identification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">
                    Date de naissance
                  </label>
                  <p className="font-medium text-gray-900">
                    {new Date(patient.date_of_birth).toLocaleDateString(
                      "fr-FR"
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Genre</label>
                  <p className="font-medium text-gray-900">
                    {patient.gender === "M" ? "Masculin" : "Féminin"}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Enregistré le</label>
                  <p className="font-medium text-gray-900">
                    {formatDate(patient.created_at)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insurance Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assurance</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-600">Assureur</label>
                <p className="font-medium text-gray-900">
                  {patient.insurance_provider || "Non renseigné"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">
                  Numéro de police
                </label>
                <p className="font-medium text-gray-900">
                  {patient.insurance_number || "Non renseigné"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dossier Médical Tab */}
        <TabsContent value="medical" className="space-y-4">
          {/* Allergies & Blood Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Allergies */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Allergies
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patient.allergies ? (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {patient.allergies}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500">Aucune allergie enregistrée</p>
                )}
              </CardContent>
            </Card>

            {/* Blood Type & Health Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Droplet className="h-5 w-5 text-red-600" />
                  Informations de santé
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">
                    Groupe sanguin
                  </label>
                  <p className="font-medium text-lg text-gray-900">
                    {patient.blood_type || "Non renseigné"}
                  </p>
                </div>
                {medicalRecord && (
                  <div>
                    <label className="text-sm text-gray-600">
                      État général
                    </label>
                    <div className="mt-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          medicalRecord.health_status === "good"
                            ? "bg-green-100 text-green-800"
                            : medicalRecord.health_status === "fair"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {medicalRecord.health_status === "good"
                          ? "Bon"
                          : medicalRecord.health_status === "fair"
                          ? "Moyen"
                          : "Mauvais"}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Medical History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Antécédents médicaux
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patient.medical_history ? (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {patient.medical_history}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">Aucun antécédent enregistré</p>
              )}
            </CardContent>
          </Card>

          {/* Current Medications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Pill className="h-5 w-5 text-green-600" />
                Médicaments actuels
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patient.current_medications ? (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {patient.current_medications}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">Aucun médicament enregistré</p>
              )}
            </CardContent>
          </Card>

          {/* Vital Signs if available */}
          {medicalRecord && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-600" />
                  Signes vitaux (Dernière mesure)
                </CardTitle>
                <CardDescription>
                  {formatDate(medicalRecord.recorded_at)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {medicalRecord.systolic_bp && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">
                        Tension systolique
                      </p>
                      <p className="text-lg font-medium text-gray-900">
                        {medicalRecord.systolic_bp} mmHg
                      </p>
                    </div>
                  )}
                  {medicalRecord.diastolic_bp && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">
                        Tension diastolique
                      </p>
                      <p className="text-lg font-medium text-gray-900">
                        {medicalRecord.diastolic_bp} mmHg
                      </p>
                    </div>
                  )}
                  {medicalRecord.heart_rate && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">
                        Fréquence cardiaque
                      </p>
                      <p className="text-lg font-medium text-gray-900">
                        {medicalRecord.heart_rate} bpm
                      </p>
                    </div>
                  )}
                  {medicalRecord.temperature && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Température</p>
                      <p className="text-lg font-medium text-gray-900">
                        {medicalRecord.temperature}°C
                      </p>
                    </div>
                  )}
                  {medicalRecord.respiratory_rate && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">
                        Fréquence respiratoire
                      </p>
                      <p className="text-lg font-medium text-gray-900">
                        {medicalRecord.respiratory_rate} bpm
                      </p>
                    </div>
                  )}
                  {medicalRecord.oxygen_saturation && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">
                        Saturation oxygène
                      </p>
                      <p className="text-lg font-medium text-gray-900">
                        {medicalRecord.oxygen_saturation}%
                      </p>
                    </div>
                  )}
                  {medicalRecord.weight && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Poids</p>
                      <p className="text-lg font-medium text-gray-900">
                        {medicalRecord.weight} kg
                      </p>
                    </div>
                  )}
                  {medicalRecord.height && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Taille</p>
                      <p className="text-lg font-medium text-gray-900">
                        {medicalRecord.height} cm
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Consultations Tab */}
        <TabsContent value="consultations" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                Chargement des consultations...
              </CardContent>
            </Card>
          ) : consultations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                Aucune consultation enregistrée
              </CardContent>
            </Card>
          ) : (
            consultations.map((consultation) => (
              <Card
                key={consultation.id}
                className="border-l-4 border-l-blue-500"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {consultation.chief_complaint || "Consultation"}
                      </CardTitle>
                      <CardDescription>
                        {formatDate(consultation.created_at)}
                      </CardDescription>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        consultation.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : consultation.status === "in_progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {consultation.status === "completed"
                        ? "Complétée"
                        : consultation.status === "in_progress"
                        ? "En cours"
                        : "Programmée"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {consultation.assessment && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Évaluation
                      </h4>
                      <p className="text-gray-700">{consultation.assessment}</p>
                    </div>
                  )}
                  {consultation.diagnosis && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Diagnostic
                      </h4>
                      <p className="text-gray-700">{consultation.diagnosis}</p>
                    </div>
                  )}
                  {consultation.treatment_plan && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Plan de traitement
                      </h4>
                      <p className="text-gray-700">
                        {consultation.treatment_plan}
                      </p>
                    </div>
                  )}
                  {consultation.prescriptions && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Ordonnances
                      </h4>
                      <p className="text-gray-700">
                        {consultation.prescriptions}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                Chargement des documents...
              </CardContent>
            </Card>
          ) : documents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                Aucun document enregistré
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {documents.map((document) => (
                <Card
                  key={document.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <FileText className="h-8 w-8 text-gray-400 mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {document.title}
                          </h4>
                          {document.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {document.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${getDocumentTypeColor(
                                document.document_type
                              )}`}
                            >
                              {getDocumentTypeLabel(document.document_type)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(document.uploaded_at)}
                            </span>
                            {document.uploaded_by_name && (
                              <span className="text-xs text-gray-500">
                                Par: {document.uploaded_by_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Contacts d'Urgence Tab */}
        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-600" />
                Contact d&apos;urgence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Nom</label>
                  <p className="font-medium text-gray-900">
                    {patient.emergency_contact_name}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Téléphone</label>
                  <p className="font-medium text-gray-900">
                    {patient.emergency_contact_phone}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">
                    Lien de parenté
                  </label>
                  <p className="font-medium text-gray-900">
                    {patient.emergency_contact_relation}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
