"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  User,
  Plus,
  X,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PatientLayout from "@/components/PatientLayout";
import { AppointmentBookingModal } from "@/components/patient/AppointmentBookingModal";
import { useAppointments } from "@/hooks/useAppointments";
import { useAuthStore } from "@/store/auth";
import { Appointment } from "@/types";
import { useToast } from "@/hooks/useToast";

export default function RendezVousPage() {
  const { user } = useAuthStore();
  const {
    appointments,
    isLoading,
    error,
    fetchAppointments,
    deleteAppointment,
  } = useAppointments();
  const { success } = useToast();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Appointment[]
  >([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
  const [cancelingId, setCancelingId] = useState<number | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchAppointments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Separate appointments into upcoming and past
  useEffect(() => {
    const now = new Date();
    const upcoming = appointments.filter((apt) => {
      const aptDate = new Date(apt.appointment_datetime);
      return aptDate > now && apt.status !== "cancelled";
    });
    const past = appointments.filter((apt) => {
      const aptDate = new Date(apt.appointment_datetime);
      return aptDate <= now || apt.status === "cancelled";
    });

    setUpcomingAppointments(
      upcoming.sort((a, b) => {
        const dateA = new Date(a.appointment_datetime);
        const dateB = new Date(b.appointment_datetime);
        return dateA.getTime() - dateB.getTime();
      })
    );

    setPastAppointments(
      past.sort((a, b) => {
        const dateA = new Date(a.appointment_datetime);
        const dateB = new Date(b.appointment_datetime);
        return dateB.getTime() - dateA.getTime();
      })
    );
  }, [appointments]);

  const handleCancelAppointment = async (id: number) => {
    try {
      setCancelingId(id);
      await deleteAppointment(id, "Annulation par le patient");
      success(
        "Rendez-vous annulé",
        "Votre rendez-vous a été annulé avec succès"
      );
    } finally {
      setCancelingId(null);
    }
  };

  const formatAppointmentDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatAppointmentTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: "bg-blue-100 text-blue-800",
      confirmed: "bg-green-100 text-green-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      completed: "bg-purple-100 text-purple-800",
      cancelled: "bg-red-100 text-red-800",
      no_show: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      scheduled: "Planifié",
      confirmed: "Confirmé",
      in_progress: "En cours",
      completed: "Terminé",
      cancelled: "Annulé",
      no_show: "Pas présenté",
    };
    return labels[status] || status;
  };

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
    const isUpcoming = appointment.is_upcoming;
    const bgColor = isUpcoming
      ? "bg-blue-50 hover:bg-blue-100"
      : "bg-gray-50 hover:bg-gray-100";

    return (
      <Card className={`${bgColor} transition-all duration-200`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  Dr. {appointment.doctor_info?.first_name}{" "}
                  {appointment.doctor_info?.last_name}
                </p>
                <p className="text-sm text-gray-600">
                  {appointment.consultation_type_display}
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formatAppointmentDate(appointment.appointment_datetime)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>
                      {formatAppointmentTime(appointment.appointment_datetime)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 ml-4">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                  appointment.status
                )}`}
              >
                {getStatusLabel(appointment.status)}
              </span>

              {isUpcoming && appointment.can_cancel && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleCancelAppointment(appointment.id)}
                  disabled={cancelingId === appointment.id}
                >
                  {cancelingId === appointment.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Annulation...
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Annuler
                    </>
                  )}
                </Button>
              )}

              {!isUpcoming && appointment.status === "completed" && (
                <Button size="sm" variant="outline">
                  Voir le compte-rendu
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <PatientLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Mes Rendez-vous
            </h2>
            <p className="text-gray-600 mt-1">
              Gérez vos consultations et prises de rendez-vous
            </p>
          </div>
          <Button
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
            onClick={() => setIsBookingModalOpen(true)}
          >
            <Plus className="h-5 w-5" />
            <span>Prendre RDV</span>
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">Erreur: {error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-gray-600">Chargement de vos rendez-vous...</p>
            </div>
          </div>
        )}

        {/* Appointments Tabs */}
        {!isLoading && (
          <Tabs defaultValue="upcoming" className="space-y-4">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger
                value="upcoming"
                className="flex items-center space-x-2"
              >
                <Calendar className="h-4 w-4" />
                <span>À venir</span>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                  {upcomingAppointments.length}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="flex items-center space-x-2"
              >
                <Clock className="h-4 w-4" />
                <span>Historique</span>
                <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">
                  {pastAppointments.length}
                </span>
              </TabsTrigger>
            </TabsList>

            {/* Upcoming Appointments */}
            <TabsContent value="upcoming" className="space-y-4">
              {upcomingAppointments.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      Vous n'avez pas de rendez-vous à venir
                    </p>
                    <Button onClick={() => setIsBookingModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Prendre rendez-vous maintenant
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Past Appointments */}
            <TabsContent value="history" className="space-y-4">
              {pastAppointments.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      Vous n'avez pas d'historique de rendez-vous
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pastAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Statistics Cards */}
        {!isLoading &&
          (appointments.length > 0 || upcomingAppointments.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        Rendez-vous à venir
                      </p>
                      <p className="text-3xl font-bold text-blue-600 mt-2">
                        {upcomingAppointments.length}
                      </p>
                    </div>
                    <Calendar className="h-10 w-10 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        Consultations terminées
                      </p>
                      <p className="text-3xl font-bold text-green-600 mt-2">
                        {
                          pastAppointments.filter(
                            (a) => a.status === "completed"
                          ).length
                        }
                      </p>
                    </div>
                    <CheckCircle className="h-10 w-10 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        Total des consultations
                      </p>
                      <p className="text-3xl font-bold text-purple-600 mt-2">
                        {appointments.length}
                      </p>
                    </div>
                    <Clock className="h-10 w-10 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
      </div>

      {/* Booking Modal */}
      {user && (
        <AppointmentBookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          onSuccess={() => fetchAppointments()}
          patientId={user.id}
        />
      )}
    </PatientLayout>
  );
}
