"use client";

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
  Stethoscope,
  Calendar,
  Clock,
  User,
  FileText,
  Pill,
  Phone,
  Video,
  Plus,
  Search,
  Filter,
} from "lucide-react";
import DoctorLayout from "@/components/DoctorLayout";

export default function ConsultationsPage() {
  return (
    <DoctorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Consultations</h2>
            <p className="text-gray-600">
              Gérez vos consultations et téléconsultations
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="flex items-center space-x-2">
              <Video className="h-4 w-4" />
              <span>Téléconsultation</span>
            </Button>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Nouvelle consultation</span>
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher une consultation..."
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span>Filtrer par date</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Today's Consultations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Stethoscope className="h-5 w-5 mr-2" />
              Consultations du jour
            </CardTitle>
            <CardDescription>
              6 octobre 2024 - 8 consultations programmées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Active Consultation */}
              <div className="p-4 border-2 border-green-200 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-green-900">
                        Marie Dubois
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-green-700">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          09:00 - 09:30
                        </span>
                        <span>Consultation de routine</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-green-200 text-green-800 text-sm rounded-full">
                      En cours
                    </span>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Continuer
                    </Button>
                  </div>
                </div>
              </div>

              {/* Next Consultations */}
              <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Pierre Martin</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          10:00 - 10:30
                        </span>
                        <span>Suivi diabète</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      Suivant
                    </span>
                    <Button size="sm" variant="outline">
                      Préparer
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Video className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Claire Rousseau</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          11:30 - 12:00
                        </span>
                        <span>Téléconsultation - Résultats examens</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                      Téléconsultation
                    </span>
                    <Button size="sm" variant="outline">
                      <Video className="h-4 w-4 mr-1" />
                      Rejoindre
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Antoine Durand</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          14:00 - 14:30
                        </span>
                        <span>Première consultation</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
                      Nouveau patient
                    </span>
                    <Button size="sm" variant="outline">
                      Voir dossier
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consultation Tools */}
        <Card>
          <CardHeader>
            <CardTitle>Outils de consultation</CardTitle>
            <CardDescription>
              Accès rapide aux outils pendant la consultation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
              >
                <FileText className="h-6 w-6" />
                <span className="text-sm">Compte-rendu</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
              >
                <Pill className="h-6 w-6" />
                <span className="text-sm">Prescription</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
              >
                <Calendar className="h-6 w-6" />
                <span className="text-sm">Planifier suivi</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
              >
                <Phone className="h-6 w-6" />
                <span className="text-sm">Appel patient</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Consultations */}
        <Card>
          <CardHeader>
            <CardTitle>Consultations récentes</CardTitle>
            <CardDescription>
              Dernières consultations effectuées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Sophie Laurent</p>
                    <p className="text-xs text-gray-600">5 oct. 2024 - 16:30</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-600">
                    Consultation générale
                  </span>
                  <Button size="sm" variant="outline">
                    <FileText className="h-3 w-3 mr-1" />
                    CR
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Video className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Michel Bertrand</p>
                    <p className="text-xs text-gray-600">5 oct. 2024 - 15:00</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-600">
                    Téléconsultation
                  </span>
                  <Button size="sm" variant="outline">
                    <FileText className="h-3 w-3 mr-1" />
                    CR
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Isabelle Moreau</p>
                    <p className="text-xs text-gray-600">4 oct. 2024 - 17:15</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-600">Suivi médical</span>
                  <Button size="sm" variant="outline">
                    <FileText className="h-3 w-3 mr-1" />
                    CR
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">8</div>
              <p className="text-sm text-gray-600">
                Consultations aujourd&apos;hui
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">47</div>
              <p className="text-sm text-gray-600">Cette semaine</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">12</div>
              <p className="text-sm text-gray-600">Téléconsultations</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">3.2h</div>
              <p className="text-sm text-gray-600">Temps moyen</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DoctorLayout>
  );
}
