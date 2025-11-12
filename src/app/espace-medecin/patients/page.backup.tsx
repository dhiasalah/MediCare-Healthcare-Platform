"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormModal } from "@/components/ui/form-modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  Users,
  Search,
  Calendar,
  FileText,
  Plus,
  Edit,
  Trash2,
  Clock,
} from "lucide-react";
import DoctorLayout from "@/components/DoctorLayout";
import { Patient, Appointment } from "@/types";
import { usePatients } from "@/hooks/usePatients";
import { useAppointments } from "@/hooks/useAppointments";
import { showToast } from "@/hooks/useToast";
import { patientSchema, type PatientFormData } from "@/lib/validations";
import PatientSpecialistsCard from "@/components/PatientSpecialistsCard";

export default function PatientsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"patients" | "appointments">(
    "patients"
  );

  // Use the custom hooks for patient and appointment management
  const { patients, isLoading, createPatient, updatePatient, deletePatient } =
    usePatients();
  const { appointments } = useAppointments();

  // React Hook Form for Add Patient
  const addForm = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      date_of_birth: "",
      gender: "" as "M" | "F" | "O",
      address: "",
      emergency_contact: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      emergency_contact_relation: "",
      allergies: "",
      medical_history: "",
      blood_type: "",
      insurance_number: "",
      insurance_provider: "",
    },
  });

  // React Hook Form for Edit Patient
  const editForm = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      date_of_birth: "",
      gender: "" as "M" | "F" | "O",
      address: "",
      emergency_contact: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      emergency_contact_relation: "",
      allergies: "",
      medical_history: "",
      blood_type: "",
      insurance_number: "",
      insurance_provider: "",
    },
  });

  // Handler for adding a new patient
  const handleAddPatient = async (data: PatientFormData) => {
    try {
      await createPatient(data);
      showToast.success("Patient ajouté avec succès!");
      setIsAddModalOpen(false);
      addForm.reset();
    } catch (error) {
      console.error("Error adding patient:", error);
      showToast.error("Erreur lors de l'ajout du patient");
    }
  };

  // Handler for editing a patient
  const handleEditPatient = async (data: PatientFormData) => {
    if (!selectedPatient) return;
    try {
      await updatePatient(selectedPatient.id, data);
      showToast.success("Patient modifié avec succès!");
      setIsEditModalOpen(false);
      editForm.reset();
      setSelectedPatient(null);
    } catch (error) {
      console.error("Error updating patient:", error);
      showToast.error("Erreur lors de la modification du patient");
    }
  };

  // Handler for deleting a patient
  const handleDeletePatient = async () => {
    if (!selectedPatient) return;
    try {
      await deletePatient(selectedPatient.id);
      showToast.success("Patient supprimé avec succès!");
      setIsDeleteModalOpen(false);
      setSelectedPatient(null);
    } catch (error) {
      console.error("Error deleting patient:", error);
      showToast.error("Erreur lors de la suppression du patient");
    }
  };

  // Filter patients based on search query
  const filteredPatients = patients.filter((patient) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      patient.first_name?.toLowerCase().includes(query) ||
      patient.last_name?.toLowerCase().includes(query) ||
      patient.email?.toLowerCase().includes(query) ||
      patient.phone?.toLowerCase().includes(query)
    );
  });

  const openEditModal = (patient: Patient) => {
    setSelectedPatient(patient);
    editForm.reset({
      first_name: patient.first_name || "",
      last_name: patient.last_name || "",
      email: patient.email || "",
      phone: patient.phone || "",
      date_of_birth: patient.date_of_birth || "",
      gender: (patient.gender as "M" | "F" | "O") || ("" as "M" | "F" | "O"),
      address: patient.address || "",
      emergency_contact: "",
      emergency_contact_name: patient.emergency_contact_name || "",
      emergency_contact_phone: patient.emergency_contact_phone || "",
      emergency_contact_relation: patient.emergency_contact_relation || "",
      allergies: patient.allergies || "",
      medical_history: patient.medical_history || "",
      blood_type: patient.blood_type || "",
      insurance_number: patient.insurance_number || "",
      insurance_provider: patient.insurance_provider || "",
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsDeleteModalOpen(true);
  };

  const openViewDetailsModal = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsViewDetailsOpen(true);
  };

  return (
    <DoctorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Patients & Rendez-vous
            </h2>
            <p className="text-gray-600">
              Gérez vos patients, consultez leurs dossiers et leurs rendez-vous
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Rechercher</span>
            </Button>
            <Button
              className="flex items-center space-x-2"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span>Nouveau patient</span>
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <Card>
          <CardContent className="p-0">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab("patients")}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === "patients"
                    ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Users className="h-4 w-4 inline mr-2" />
                Patients ({filteredPatients.length})
              </button>
              <button
                onClick={() => setActiveTab("appointments")}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === "appointments"
                    ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Calendar className="h-4 w-4 inline mr-2" />
                Rendez-vous ({appointments.length})
              </button>
            </div>
          </CardContent>
        </Card>

        {activeTab === "patients" && (
          <>
            {/* Search and Filter */}
            <Card>
              <CardContent className="p-4">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Rechercher un patient..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <Button variant="outline">Filtres</Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Patients */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Patients récents
                </CardTitle>
                <CardDescription>Patients vus récemment</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : patients.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Aucun patient trouvé</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Ajoutez votre premier patient pour commencer
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPatients.slice(0, 5).map((patient) => {
                      const initials = `${patient.first_name?.[0] || ""}${
                        patient.last_name?.[0] || ""
                      }`.toUpperCase();
                      const age = patient.date_of_birth
                        ? new Date().getFullYear() -
                          new Date(patient.date_of_birth).getFullYear()
                        : null;

                      return (
                        <div
                          key={patient.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium">
                                {initials}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {patient.first_name || ""}{" "}
                                {patient.last_name || ""}
                              </p>
                              <p className="text-sm text-gray-600">
                                {patient.date_of_birth &&
                                  `Né(e) le ${new Date(
                                    patient.date_of_birth
                                  ).toLocaleDateString("fr-FR")}`}
                                {age && ` • ${age} ans`}
                              </p>
                              <p className="text-sm text-blue-600">
                                {patient.email || ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openViewDetailsModal(patient)}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Dossier
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditModal(patient)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Modifier
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openDeleteModal(patient)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Supprimer
                            </Button>
                            <Button size="sm">
                              <Calendar className="h-4 w-4 mr-1" />
                              RDV
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* All Patients */}
            <Card>
              <CardHeader>
                <CardTitle>Tous mes patients</CardTitle>
                <CardDescription>
                  Liste complète de votre patientèle
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : filteredPatients.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Aucun patient trouvé</p>
                    <p className="text-sm text-gray-400 mt-2">
                      {searchQuery
                        ? "Aucun patient ne correspond à votre recherche"
                        : "Ajoutez votre premier patient pour commencer"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredPatients.map((patient) => {
                      const initials = `${patient.first_name?.[0] || ""}${
                        patient.last_name?.[0] || ""
                      }`.toUpperCase();
                      const age = patient.date_of_birth
                        ? new Date().getFullYear() -
                          new Date(patient.date_of_birth).getFullYear()
                        : null;

                      return (
                        <div
                          key={patient.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {initials}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {patient.first_name || ""}{" "}
                                {patient.last_name || ""}
                              </p>
                              <p className="text-xs text-gray-600">
                                {age && `${age} ans`} •{" "}
                                {patient.medical_history || "Aucun antécédent"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Créé le</p>
                            <p className="text-xs font-medium">
                              {new Date(patient.created_at).toLocaleDateString(
                                "fr-FR"
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mt-4 flex justify-center">
                  <Button variant="outline">
                    Voir tous les patients ({filteredPatients.length})
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
                <CardDescription>Gestion rapide des patients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    className="h-16 flex flex-col items-center justify-center space-y-2"
                    onClick={() => setIsAddModalOpen(true)}
                  >
                    <Users className="h-5 w-5" />
                    <span className="text-sm">Nouveau patient</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-16 flex flex-col items-center justify-center space-y-2"
                  >
                    <Search className="h-5 w-5" />
                    <span className="text-sm">Recherche avancée</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-16 flex flex-col items-center justify-center space-y-2"
                  >
                    <FileText className="h-5 w-5" />
                    <span className="text-sm">Dossiers récents</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-16 flex flex-col items-center justify-center space-y-2"
                  >
                    <Calendar className="h-5 w-5" />
                    <span className="text-sm">Planifier RDV</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === "appointments" && (
          <>
            {/* Appointments Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Rendez-vous du jour
                </CardTitle>
                <CardDescription>
                  Gérez les rendez-vous de vos patients
                </CardDescription>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      Aucun rendez-vous aujourd&apos;hui
                    </h3>
                    <p className="text-gray-500">
                      Les rendez-vous programmés apparaîtront ici
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments &&
                      appointments.map((appointment: Appointment) => (
                        <div
                          key={appointment.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Users className="h-5 w-5 text-blue-600" />
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {appointment.patient_info?.full_name ||
                                  `${appointment.patient_info?.first_name} ${appointment.patient_info?.last_name}` ||
                                  "Patient Inconnu"}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {new Date(
                                  appointment.appointment_datetime
                                ).toLocaleDateString("fr-FR")}{" "}
                                à{" "}
                                {new Date(
                                  appointment.appointment_datetime
                                ).toLocaleTimeString("fr-FR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                              <p className="text-xs text-gray-400">
                                Status: {appointment.status_display}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Clock className="h-4 w-4 mr-1" />
                              Voir détails
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Add Patient Modal */}
      <FormModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          addForm.reset();
        }}
        title="Ajouter un nouveau patient"
        onSubmit={addForm.handleSubmit(handleAddPatient)}
        isLoading={addForm.formState.isSubmitting}
        size="lg"
      >
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="add_firstName">Prénom *</Label>
            <Input
              id="add_firstName"
              {...addForm.register("first_name")}
              placeholder="Prénom du patient"
              className={
                addForm.formState.errors.first_name ? "border-red-500" : ""
              }
            />
            {addForm.formState.errors.first_name && (
              <p className="text-sm text-red-500 mt-1">
                {addForm.formState.errors.first_name.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="add_lastName">Nom *</Label>
            <Input
              id="add_lastName"
              {...addForm.register("last_name")}
              placeholder="Nom du patient"
              className={
                addForm.formState.errors.last_name ? "border-red-500" : ""
              }
            />
            {addForm.formState.errors.last_name && (
              <p className="text-sm text-red-500 mt-1">
                {addForm.formState.errors.last_name.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="add_email">Email</Label>
            <Input
              id="add_email"
              type="email"
              {...addForm.register("email")}
              placeholder="email@exemple.com"
              className={addForm.formState.errors.email ? "border-red-500" : ""}
            />
            {addForm.formState.errors.email && (
              <p className="text-sm text-red-500 mt-1">
                {addForm.formState.errors.email.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="add_dateOfBirth">Date de naissance *</Label>
            <Input
              id="add_dateOfBirth"
              type="date"
              {...addForm.register("date_of_birth")}
              className={
                addForm.formState.errors.date_of_birth ? "border-red-500" : ""
              }
            />
            {addForm.formState.errors.date_of_birth && (
              <p className="text-sm text-red-500 mt-1">
                {addForm.formState.errors.date_of_birth.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="add_gender">Genre *</Label>
            <select
              id="add_gender"
              {...addForm.register("gender")}
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                addForm.formState.errors.gender
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            >
              <option value="">Sélectionner...</option>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
              <option value="O">Autre</option>
            </select>
            {addForm.formState.errors.gender && (
              <p className="text-sm text-red-500 mt-1">
                {addForm.formState.errors.gender.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="add_phone">Téléphone *</Label>
            <Input
              id="add_phone"
              {...addForm.register("phone")}
              placeholder="+33 6 12 34 56 78"
              className={addForm.formState.errors.phone ? "border-red-500" : ""}
            />
            {addForm.formState.errors.phone && (
              <p className="text-sm text-red-500 mt-1">
                {addForm.formState.errors.phone.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="add_address">Adresse *</Label>
            <Input
              id="add_address"
              {...addForm.register("address")}
              placeholder="Adresse complète"
              className={
                addForm.formState.errors.address ? "border-red-500" : ""
              }
            />
            {addForm.formState.errors.address && (
              <p className="text-sm text-red-500 mt-1">
                {addForm.formState.errors.address.message}
              </p>
            )}
          </div>

          {/* Emergency Contact Section */}
          <div className="md:col-span-2 mt-4 pt-4 border-t">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Contact d&apos;urgence
            </h3>
          </div>
          <div>
            <Label htmlFor="add_emergencyContactName">Nom du contact *</Label>
            <Input
              id="add_emergencyContactName"
              {...addForm.register("emergency_contact_name")}
              placeholder="Nom complet"
              className={
                addForm.formState.errors.emergency_contact_name
                  ? "border-red-500"
                  : ""
              }
            />
            {addForm.formState.errors.emergency_contact_name && (
              <p className="text-sm text-red-500 mt-1">
                {addForm.formState.errors.emergency_contact_name.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="add_emergencyContactPhone">
              Téléphone du contact *
            </Label>
            <Input
              id="add_emergencyContactPhone"
              {...addForm.register("emergency_contact_phone")}
              placeholder="+33 6 12 34 56 78"
              className={
                addForm.formState.errors.emergency_contact_phone
                  ? "border-red-500"
                  : ""
              }
            />
            {addForm.formState.errors.emergency_contact_phone && (
              <p className="text-sm text-red-500 mt-1">
                {addForm.formState.errors.emergency_contact_phone.message}
              </p>
            )}
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="add_emergencyContactRelation">
              Lien de parenté *
            </Label>
            <Input
              id="add_emergencyContactRelation"
              {...addForm.register("emergency_contact_relation")}
              placeholder="Ex: Époux/Épouse, Parent, Ami(e), etc."
              className={
                addForm.formState.errors.emergency_contact_relation
                  ? "border-red-500"
                  : ""
              }
            />
            {addForm.formState.errors.emergency_contact_relation && (
              <p className="text-sm text-red-500 mt-1">
                {addForm.formState.errors.emergency_contact_relation.message}
              </p>
            )}
          </div>

          {/* Medical Information Section */}
          <div className="md:col-span-2 mt-4 pt-4 border-t">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informations médicales
            </h3>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="add_allergies">Allergies</Label>
            <textarea
              id="add_allergies"
              {...addForm.register("allergies")}
              placeholder="Allergies connues (médicaments, aliments, etc.)..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="add_medicalHistory">Antécédents médicaux</Label>
            <textarea
              id="add_medicalHistory"
              {...addForm.register("medical_history")}
              placeholder="Antécédents, maladies, traitements en cours..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>
        </form>
      </FormModal>

      {/* Edit Patient Modal */}
      <FormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          editForm.reset();
          setSelectedPatient(null);
        }}
        title={`Modifier ${selectedPatient?.first_name || ""} ${
          selectedPatient?.last_name || ""
        }`}
        onSubmit={editForm.handleSubmit(handleEditPatient)}
        isLoading={editForm.formState.isSubmitting}
        size="lg"
      >
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="edit_firstName">Prénom *</Label>
            <Input
              id="edit_firstName"
              {...editForm.register("first_name")}
              placeholder="Prénom du patient"
              className={
                editForm.formState.errors.first_name ? "border-red-500" : ""
              }
            />
            {editForm.formState.errors.first_name && (
              <p className="text-sm text-red-500 mt-1">
                {editForm.formState.errors.first_name.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="edit_lastName">Nom *</Label>
            <Input
              id="edit_lastName"
              {...editForm.register("last_name")}
              placeholder="Nom du patient"
              className={
                editForm.formState.errors.last_name ? "border-red-500" : ""
              }
            />
            {editForm.formState.errors.last_name && (
              <p className="text-sm text-red-500 mt-1">
                {editForm.formState.errors.last_name.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="edit_dateOfBirth">Date de naissance *</Label>
            <Input
              id="edit_dateOfBirth"
              type="date"
              {...editForm.register("date_of_birth")}
              className={
                editForm.formState.errors.date_of_birth ? "border-red-500" : ""
              }
            />
            {editForm.formState.errors.date_of_birth && (
              <p className="text-sm text-red-500 mt-1">
                {editForm.formState.errors.date_of_birth.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="edit_gender">Genre *</Label>
            <select
              id="edit_gender"
              {...editForm.register("gender")}
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                editForm.formState.errors.gender
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            >
              <option value="">Sélectionner...</option>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
              <option value="O">Autre</option>
            </select>
            {editForm.formState.errors.gender && (
              <p className="text-sm text-red-500 mt-1">
                {editForm.formState.errors.gender.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="edit_address">Adresse *</Label>
            <Input
              id="edit_address"
              {...editForm.register("address")}
              placeholder="Adresse complète"
              className={
                editForm.formState.errors.address ? "border-red-500" : ""
              }
            />
            {editForm.formState.errors.address && (
              <p className="text-sm text-red-500 mt-1">
                {editForm.formState.errors.address.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="edit_phone">Téléphone *</Label>
            <Input
              id="edit_phone"
              {...editForm.register("phone")}
              placeholder="+33 6 12 34 56 78"
              className={
                editForm.formState.errors.phone ? "border-red-500" : ""
              }
            />
            {editForm.formState.errors.phone && (
              <p className="text-sm text-red-500 mt-1">
                {editForm.formState.errors.phone.message}
              </p>
            )}
          </div>

          {/* Emergency Contact Section */}
          <div className="md:col-span-2 mt-4 pt-4 border-t">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Contact d&apos;urgence
            </h3>
          </div>
          <div>
            <Label htmlFor="edit_emergencyContactName">Nom du contact *</Label>
            <Input
              id="edit_emergencyContactName"
              {...editForm.register("emergency_contact_name")}
              placeholder="Nom complet"
              className={
                editForm.formState.errors.emergency_contact_name
                  ? "border-red-500"
                  : ""
              }
            />
            {editForm.formState.errors.emergency_contact_name && (
              <p className="text-sm text-red-500 mt-1">
                {editForm.formState.errors.emergency_contact_name.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="edit_emergencyContactPhone">
              Téléphone du contact *
            </Label>
            <Input
              id="edit_emergencyContactPhone"
              {...editForm.register("emergency_contact_phone")}
              placeholder="+33 6 12 34 56 78"
              className={
                editForm.formState.errors.emergency_contact_phone
                  ? "border-red-500"
                  : ""
              }
            />
            {editForm.formState.errors.emergency_contact_phone && (
              <p className="text-sm text-red-500 mt-1">
                {editForm.formState.errors.emergency_contact_phone.message}
              </p>
            )}
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="edit_emergencyContactRelation">
              Lien de parenté *
            </Label>
            <Input
              id="edit_emergencyContactRelation"
              {...editForm.register("emergency_contact_relation")}
              placeholder="Ex: Époux/Épouse, Parent, Ami(e), etc."
              className={
                editForm.formState.errors.emergency_contact_relation
                  ? "border-red-500"
                  : ""
              }
            />
            {editForm.formState.errors.emergency_contact_relation && (
              <p className="text-sm text-red-500 mt-1">
                {editForm.formState.errors.emergency_contact_relation.message}
              </p>
            )}
          </div>

          {/* Medical Information Section */}
          <div className="md:col-span-2 mt-4 pt-4 border-t">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informations médicales
            </h3>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="edit_allergies">Allergies</Label>
            <textarea
              id="edit_allergies"
              {...editForm.register("allergies")}
              placeholder="Allergies connues (médicaments, aliments, etc.)..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="edit_medicalHistory">Antécédents médicaux</Label>
            <textarea
              id="edit_medicalHistory"
              {...editForm.register("medical_history")}
              placeholder="Antécédents, maladies, traitements en cours..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>
        </form>
      </FormModal>

      {/* Delete Patient Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeletePatient}
        title="Supprimer le patient"
        message={`Êtes-vous sûr de vouloir supprimer le patient ${
          selectedPatient?.first_name || ""
        } ${
          selectedPatient?.last_name || ""
        } ? Cette action est irréversible et supprimera également tout l'historique médical associé.`}
        confirmLabel="Supprimer"
        variant="danger"
        isLoading={isLoading}
      />

      {/* View Patient Details Modal */}
      {isViewDetailsOpen && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Dossier de {selectedPatient.first_name}{" "}
                  {selectedPatient.last_name}
                </h2>
                <p className="text-gray-600">
                  {selectedPatient.email} • {selectedPatient.phone}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsViewDetailsOpen(false);
                  setSelectedPatient(null);
                }}
              >
                Fermer
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Patient Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations personnelles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Nom complet</p>
                      <p className="font-medium">
                        {selectedPatient.first_name} {selectedPatient.last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date de naissance</p>
                      <p className="font-medium">
                        {selectedPatient.date_of_birth
                          ? new Date(
                              selectedPatient.date_of_birth
                            ).toLocaleDateString("fr-FR")
                          : "Non renseignée"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Sexe</p>
                      <p className="font-medium">
                        {selectedPatient.gender === "M"
                          ? "Masculin"
                          : selectedPatient.gender === "F"
                          ? "Féminin"
                          : "Autre"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{selectedPatient.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Téléphone</p>
                      <p className="font-medium">{selectedPatient.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Adresse</p>
                      <p className="font-medium">{selectedPatient.address}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Medical Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations médicales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Antécédents médicaux
                    </p>
                    <p className="text-sm">
                      {selectedPatient.medical_history || "Aucun"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Allergies</p>
                    <p className="text-sm">
                      {selectedPatient.allergies || "Aucune"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Groupe sanguin</p>
                    <p className="text-sm">
                      {selectedPatient.blood_type || "Non renseigné"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact d&apos;urgence</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Nom</p>
                      <p className="font-medium">
                        {selectedPatient.emergency_contact_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Téléphone</p>
                      <p className="font-medium">
                        {selectedPatient.emergency_contact_phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Relation</p>
                      <p className="font-medium">
                        {selectedPatient.emergency_contact_relation ||
                          "Non renseignée"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Specialists Section - Only show if user is primary doctor */}
              <PatientSpecialistsCard
                patient={selectedPatient}
                isPrimaryDoctor={true}
              />
            </div>
          </div>
        </div>
      )}
    </DoctorLayout>
  );
}
