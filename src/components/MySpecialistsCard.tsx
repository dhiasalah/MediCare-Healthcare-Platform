"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Stethoscope,
  Phone,
  Mail,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import api from "@/lib/api";
import { PatientSpecialist } from "@/types";
import { showToast } from "@/hooks/useToast";

export default function MySpecialistsCard() {
  const [specialists, setSpecialists] = useState<PatientSpecialist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSpecialists();
  }, []);

  const fetchSpecialists = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/api/patients/my-specialists/");
      setSpecialists(response.data);
    } catch (error) {
      console.error("Error fetching specialists:", error);
      showToast.error("Erreur lors du chargement des spécialistes");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Clock className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "En cours";
      case "completed":
        return "Terminé";
      case "cancelled":
        return "Annulé";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Stethoscope className="h-5 w-5 mr-2" />
            Mes Spécialistes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Stethoscope className="h-5 w-5 mr-2" />
          Mes Spécialistes
        </CardTitle>
        <CardDescription>
          Médecins spécialistes qui suivent votre santé
        </CardDescription>
      </CardHeader>
      <CardContent>
        {specialists.length === 0 ? (
          <div className="text-center py-8">
            <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucun spécialiste assigné</p>
            <p className="text-sm text-gray-400 mt-2">
              Votre médecin traitant pourra vous référer à un spécialiste si
              nécessaire
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {specialists.map((specialist) => (
              <div
                key={specialist.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Stethoscope className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {specialist.specialist_name}
                      </h3>
                      <p className="text-sm text-blue-600 font-medium">
                        {specialist.specialist_specialization}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={`${getStatusColor(
                      specialist.status
                    )} flex items-center space-x-1`}
                  >
                    {getStatusIcon(specialist.status)}
                    <span>{getStatusLabel(specialist.status)}</span>
                  </Badge>
                </div>

                {specialist.reason && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-md">
                    <div className="flex items-start space-x-2">
                      <FileText className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-1">
                          Motif de consultation:
                        </p>
                        <p className="text-sm text-gray-600">
                          {specialist.reason}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <a
                      href={`mailto:${specialist.specialist_email}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {specialist.specialist_email}
                    </a>
                  </div>
                  {specialist.specialist_phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <a
                        href={`tel:${specialist.specialist_phone}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {specialist.specialist_phone}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      Assigné le{" "}
                      {new Date(specialist.assigned_at).toLocaleDateString(
                        "fr-FR",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </span>
                  </div>
                </div>

                {specialist.notes && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Notes: </span>
                      {specialist.notes}
                    </p>
                  </div>
                )}

                <div className="mt-3 text-xs text-gray-500">
                  Référé par {specialist.assigned_by_name}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
