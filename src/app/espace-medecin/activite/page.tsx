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
  Activity,
  Bell,
  Calendar,
  Clock,
  FileText,
  User,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Info,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";
import DoctorLayout from "@/components/DoctorLayout";

export default function ActivitePage() {
  return (
    <DoctorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Activité</h2>
            <p className="text-gray-600">
              Suivez votre activité récente et les notifications
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4" />
              <span>Actualiser</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filtrer</span>
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher dans l'activité..."
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Bell className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">3</div>
              <p className="text-sm text-gray-600">Notifications</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">8</div>
              <p className="text-sm text-gray-600">RDV aujourd&apos;hui</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">5</div>
              <p className="text-sm text-gray-600">Messages</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">12</div>
              <p className="text-sm text-gray-600">Tâches</p>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Activité récente
            </CardTitle>
            <CardDescription>Dernières actions et événements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Activity Item */}
              <div className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    Consultation terminée avec Marie Dubois
                  </p>
                  <p className="text-sm text-gray-600">
                    Compte-rendu rédigé et prescription envoyée
                  </p>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    Il y a 15 minutes
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <FileText className="h-3 w-3 mr-1" />
                  Voir
                </Button>
              </div>

              <div className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    Nouveau rendez-vous planifié
                  </p>
                  <p className="text-sm text-gray-600">
                    Pierre Martin - 10 octobre 2024 à 14:30
                  </p>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    Il y a 45 minutes
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <Calendar className="h-3 w-3 mr-1" />
                  Planning
                </Button>
              </div>

              <div className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    Résultats d&apos;analyse disponibles
                  </p>
                  <p className="text-sm text-gray-600">
                    Claire Rousseau - Analyse sanguine complète
                  </p>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    Il y a 1 heure
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <FileText className="h-3 w-3 mr-1" />
                  Consulter
                </Button>
              </div>

              <div className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    Nouveau message reçu
                  </p>
                  <p className="text-sm text-gray-600">
                    Secrétariat médical - Demande de report de RDV
                  </p>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    Il y a 2 heures
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Répondre
                </Button>
              </div>

              <div className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    Nouveau patient enregistré
                  </p>
                  <p className="text-sm text-gray-600">
                    Antoine Durand - Première consultation le 8 octobre
                  </p>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    Il y a 3 heures
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <User className="h-3 w-3 mr-1" />
                  Dossier
                </Button>
              </div>

              <div className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Info className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    Mise à jour du système
                  </p>
                  <p className="text-sm text-gray-600">
                    Nouvelles fonctionnalités de téléconsultation disponibles
                  </p>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    Il y a 5 heures
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <Info className="h-3 w-3 mr-1" />
                  Détails
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notifications importantes
            </CardTitle>
            <CardDescription>
              Alertes et rappels nécessitant votre attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-orange-900">
                      Rappel: Formation continue obligatoire
                    </p>
                    <p className="text-xs text-orange-700">
                      Échéance dans 15 jours
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Planifier
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Info className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Mise à jour des protocoles COVID-19
                    </p>
                    <p className="text-xs text-blue-700">
                      Nouvelles recommandations disponibles
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Consulter
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      Sauvegarde automatique effectuée
                    </p>
                    <p className="text-xs text-green-700">
                      Tous vos dossiers sont sécurisés
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Vérifier
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>
              Accédez rapidement aux fonctions principales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button className="h-16 flex flex-col items-center justify-center space-y-2">
                <Calendar className="h-5 w-5" />
                <span className="text-sm">Voir planning</span>
              </Button>

              <Button
                variant="outline"
                className="h-16 flex flex-col items-center justify-center space-y-2"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm">Messages</span>
              </Button>

              <Button
                variant="outline"
                className="h-16 flex flex-col items-center justify-center space-y-2"
              >
                <FileText className="h-5 w-5" />
                <span className="text-sm">Dossiers</span>
              </Button>

              <Button
                variant="outline"
                className="h-16 flex flex-col items-center justify-center space-y-2"
              >
                <Bell className="h-5 w-5" />
                <span className="text-sm">Notifications</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DoctorLayout>
  );
}
