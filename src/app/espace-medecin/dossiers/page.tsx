"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FolderOpen,
  Search,
  FileText,
  User,
  FileEdit,
  Eye,
  Users,
  BarChart3,
  Clock,
  AlertCircle,
  CheckCircle2,
  Plus,
  Download,
  Filter,
  Calendar,
  Phone,
} from "lucide-react";
import DoctorLayout from "@/components/DoctorLayout";
import MedicalDataModal from "@/components/MedicalDataModal";
import { useState, useMemo } from "react";
import { usePatients } from "@/hooks/usePatients";
import { useRouter } from "next/navigation";

export default function DossiersPage() {
  const { patients, isLoading } = usePatients();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    null
  );
  const [filterStatus, setFilterStatus] = useState("all"); // all, active, inactive

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const s = searchQuery.toLowerCase();
      const matchesSearch =
        patient.first_name.toLowerCase().includes(s) ||
        patient.last_name.toLowerCase().includes(s) ||
        patient.email?.toLowerCase().includes(s);

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && patient.is_active) ||
        (filterStatus === "inactive" && !patient.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [patients, searchQuery, filterStatus]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: patients.length,
      active: patients.filter((p) => p.is_active).length,
      inactive: patients.filter((p) => !p.is_active).length,
    };
  }, [patients]);

  return (
    <DoctorLayout>
      <div className="space-y-8 pb-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            Dossiers médicaux
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez et consultez les dossiers médicaux de vos patients
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">
                    Patients totaux
                  </p>
                  <p className="text-3xl font-bold text-blue-900 mt-2">
                    {stats.total}
                  </p>
                </div>
                <Users className="h-12 w-12 text-blue-300" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">
                    Patients actifs
                  </p>
                  <p className="text-3xl font-bold text-green-900 mt-2">
                    {stats.active}
                  </p>
                </div>
                <CheckCircle2 className="h-12 w-12 text-green-300" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">
                    Patients inactifs
                  </p>
                  <p className="text-3xl font-bold text-orange-900 mt-2">
                    {stats.inactive}
                  </p>
                </div>
                <AlertCircle className="h-12 w-12 text-orange-300" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Recherche et filtrage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Rechercher par nom, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === "all" ? "default" : "outline"}
                  onClick={() => setFilterStatus("all")}
                >
                  Tous
                </Button>
                <Button
                  variant={filterStatus === "active" ? "default" : "outline"}
                  onClick={() => setFilterStatus("active")}
                >
                  Actifs
                </Button>
                <Button
                  variant={filterStatus === "inactive" ? "default" : "outline"}
                  onClick={() => setFilterStatus("inactive")}
                >
                  Inactifs
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <Plus className="h-8 w-8 text-blue-600 mb-2" />
              <p className="font-semibold text-sm">Nouveau patient</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <Download className="h-8 w-8 text-green-600 mb-2" />
              <p className="font-semibold text-sm">Exporter</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <FileText className="h-8 w-8 text-purple-600 mb-2" />
              <p className="font-semibold text-sm">Rapports</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <Calendar className="h-8 w-8 text-pink-600 mb-2" />
              <p className="font-semibold text-sm">Historique</p>
            </CardContent>
          </Card>
        </div>

        {/* Patients List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Dossiers des patients
              </CardTitle>
              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {filteredPatients.length} résultat
                {filteredPatients.length !== 1 ? "s" : ""}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-spin" />
                <p className="text-gray-600">Chargement des dossiers...</p>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">
                  Aucun patient trouvé
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Essayez de modifier votre recherche
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPatients.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {p.first_name[0]}
                          {p.last_name[0]}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {p.first_name} {p.last_name}
                        </h4>
                        <p className="text-sm text-gray-600 truncate">
                          {p.email}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <Phone className="h-3 w-3" />
                          <span>{p.phone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-right mr-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                            p.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {p.is_active ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <AlertCircle className="h-3 w-3" />
                          )}
                          {p.is_active ? "Actif" : "Inactif"}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() =>
                          router.push(`/espace-medecin/dossiers/${p.id}`)
                        }
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Consulter
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedPatientId(p.id);
                          setIsModalOpen(true);
                        }}
                      >
                        <FileEdit className="h-4 w-4 mr-1" />
                        Éditer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedPatientId && (
        <MedicalDataModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedPatientId(null);
          }}
          patientId={selectedPatientId}
          onSuccess={() => {}}
        />
      )}
    </DoctorLayout>
  );
}
