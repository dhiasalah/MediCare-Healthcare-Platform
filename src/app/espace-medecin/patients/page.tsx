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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Users,
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Trash2,
} from "lucide-react";
import DoctorLayout from "@/components/DoctorLayout";
import { PatientCard, PatientForm } from "@/components/doctor";
import MedicalDataModal from "@/components/MedicalDataModal";
import { Patient } from "@/types";
import { usePatients } from "@/hooks/usePatients";
import { showToast } from "@/hooks/useToast";
import { patientSchema, type PatientFormData } from "@/lib/validations";

const PATIENTS_PER_PAGE = 6;

export default function PatientsPage() {
  // State Management
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMedicalDataModalOpen, setIsMedicalDataModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllPatients, setShowAllPatients] = useState(false);

  // Data Hooks
  const { patients, isLoading, createPatient, updatePatient, deletePatient } =
    usePatients();

  // Forms
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

  const editForm = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
  });

  // Handlers
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

  const handleEditPatient = async (data: PatientFormData) => {
    if (!selectedPatient) return;
    try {
      await updatePatient(selectedPatient.id, data);
      showToast.success("Patient modifié avec succès!");
      setIsEditModalOpen(false);
      setSelectedPatient(null);
    } catch (error) {
      console.error("Error updating patient:", error);
      showToast.error("Erreur lors de la modification du patient");
    }
  };

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

  const openMedicalDataModal = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsMedicalDataModalOpen(true);
  };

  const handleMedicalDataSuccess = () => {
    // Refresh patients list if needed
    setIsMedicalDataModalOpen(false);
    setSelectedPatient(null);
  };

  // Filter and pagination
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

  const displayedPatients = showAllPatients
    ? filteredPatients
    : filteredPatients.slice(0, PATIENTS_PER_PAGE);

  return (
    <DoctorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Mes Patients</h2>
            <p className="text-gray-600 mt-1">Gérez et suivez vos patients</p>
          </div>
          <Button
            size="lg"
            className="flex items-center space-x-2 shadow-md hover:shadow-lg transition-shadow"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="h-5 w-5" />
            <span>Nouveau patient</span>
          </Button>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher un patient (nom, email, téléphone...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total patients
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {patients.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Résultats</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {filteredPatients.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Search className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Affichés</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {displayedPatients.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patients List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Liste des patients
            </CardTitle>
            <CardDescription>
              {filteredPatients.length} patient(s) trouvé(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-500">Chargement des patients...</p>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium text-lg">
                  Aucun patient trouvé
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  {searchQuery
                    ? "Aucun patient ne correspond à votre recherche"
                    : "Ajoutez votre premier patient pour commencer"}
                </p>
                {!searchQuery && (
                  <Button
                    className="mt-4"
                    onClick={() => setIsAddModalOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un patient
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {displayedPatients.map((patient) => (
                    <PatientCard
                      key={patient.id}
                      patient={patient}
                      onEdit={openEditModal}
                      onDelete={openDeleteModal}
                      onMedicalData={openMedicalDataModal}
                    />
                  ))}
                </div>

                {/* Show More/Less Button */}
                {filteredPatients.length > PATIENTS_PER_PAGE && (
                  <div className="mt-6 flex justify-center">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setShowAllPatients(!showAllPatients)}
                      className="min-w-[250px] hover:bg-gray-50"
                    >
                      {showAllPatients ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-2" />
                          Voir moins de patients
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-2" />
                          Voir tous les patients ({filteredPatients.length})
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Patient Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-blue-50">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl">
                  Ajouter un nouveau patient
                </DialogTitle>
                <DialogDescription className="text-base mt-1">
                  Remplissez les informations du patient ci-dessous
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={addForm.handleSubmit(handleAddPatient)}>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <PatientForm form={addForm} idPrefix="add" isEditMode={false} />
            </div>
            <DialogFooter className="mt-6 gap-3 border-t pt-6">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => {
                  setIsAddModalOpen(false);
                  addForm.reset();
                }}
                className="min-w-[120px]"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={addForm.formState.isSubmitting}
                size="lg"
                className="min-w-[150px] bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md"
              >
                {addForm.formState.isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Ajout en cours...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter le patient
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Patient Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-green-50">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl">
                  Modifier{" "}
                  {selectedPatient
                    ? `${selectedPatient.first_name} ${selectedPatient.last_name}`
                    : "le patient"}
                </DialogTitle>
                <DialogDescription className="text-base mt-1">
                  Modifiez les informations du patient ci-dessous
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(handleEditPatient)}>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <PatientForm form={editForm} idPrefix="edit" isEditMode={true} />
            </div>
            <DialogFooter className="mt-6 gap-3 border-t pt-6">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedPatient(null);
                }}
                className="min-w-[120px]"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={editForm.formState.isSubmitting}
                size="lg"
                className="min-w-[150px] bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-md"
              >
                {editForm.formState.isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4 mr-2" />
                    Sauvegarder les modifications
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Confirmer la suppression
            </DialogTitle>
            <DialogDescription>
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          {selectedPatient && (
            <div className="py-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-2">
                  Êtes-vous sûr de vouloir supprimer ce patient ?
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedPatient.first_name} {selectedPatient.last_name}
                </p>
                {selectedPatient.email && (
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedPatient.email}
                  </p>
                )}
              </div>
              <p className="text-sm text-red-600 mt-4 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Toutes les données associées seront également supprimées.
              </p>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedPatient(null);
              }}
            >
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeletePatient}>
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Medical Data Modal */}
      {selectedPatient && (
        <MedicalDataModal
          isOpen={isMedicalDataModalOpen}
          onClose={() => {
            setIsMedicalDataModalOpen(false);
            setSelectedPatient(null);
          }}
          patientId={selectedPatient.id}
          onSuccess={handleMedicalDataSuccess}
        />
      )}
    </DoctorLayout>
  );
}
