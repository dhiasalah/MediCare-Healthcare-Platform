"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Video, MessageCircle, Clock } from "lucide-react";
import PatientLayout from "@/components/PatientLayout";

export default function TeleconsultationPage() {
  return (
    <PatientLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Téléconsultation</h2>
          <p className="text-gray-600">
            Consultez vos médecins à distance en toute sécurité
          </p>
        </div>

        {/* Quick Start */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="h-5 w-5 mr-2" />
              Démarrer une consultation
            </CardTitle>
            <CardDescription>Service disponible 24h/24 et 7j/7</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="h-20 flex flex-col items-center justify-center space-y-2">
                <Video className="h-6 w-6" />
                <span>Consultation vidéo</span>
                <span className="text-xs opacity-75">
                  Disponible maintenant
                </span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
              >
                <Phone className="h-6 w-6" />
                <span>Consultation audio</span>
                <span className="text-xs opacity-75">Appel sécurisé</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
              >
                <MessageCircle className="h-6 w-6" />
                <span>Messagerie</span>
                <span className="text-xs opacity-75">Chat en temps réel</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Available Doctors */}
        <Card>
          <CardHeader>
            <CardTitle>Médecins disponibles</CardTitle>
            <CardDescription>
              Professionnels de santé en ligne actuellement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center relative">
                    <span className="text-white font-medium">DM</span>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <p className="font-medium">Dr. Marie Durand</p>
                    <p className="text-sm text-gray-600">Médecine générale</p>
                    <p className="text-sm text-green-600">
                      ● Disponible maintenant
                    </p>
                  </div>
                </div>
                <Button>Consulter</Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center relative">
                    <span className="text-white font-medium">PL</span>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <p className="font-medium">Dr. Pierre Leblanc</p>
                    <p className="text-sm text-gray-600">Cardiologie</p>
                    <p className="text-sm text-green-600">
                      ● Disponible maintenant
                    </p>
                  </div>
                </div>
                <Button>Consulter</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Previous Consultations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Consultations récentes
            </CardTitle>
            <CardDescription>
              Historique de vos téléconsultations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Dr. Sophie Martin</p>
                  <p className="text-sm text-gray-600">
                    Consultation générale • 30 septembre 2024
                  </p>
                  <p className="text-sm text-gray-500">Durée: 25 minutes</p>
                </div>
                <Button variant="outline" size="sm">
                  Voir le compte-rendu
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Dr. Jean Rousseau</p>
                  <p className="text-sm text-gray-600">
                    Dermatologie • 22 septembre 2024
                  </p>
                  <p className="text-sm text-gray-500">Durée: 15 minutes</p>
                </div>
                <Button variant="outline" size="sm">
                  Voir le compte-rendu
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PatientLayout>
  );
}
