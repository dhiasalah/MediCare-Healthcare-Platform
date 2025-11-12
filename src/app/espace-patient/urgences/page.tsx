"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Phone, MapPin, Heart } from "lucide-react";
import PatientLayout from "@/components/PatientLayout";

export default function UrgencesPage() {
  return (
    <PatientLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h2 className="text-2xl font-bold text-red-900">
              Numéros d&apos;Urgence
            </h2>
          </div>
          <p className="text-red-700">
            En cas d&apos;urgence vitale, appelez immédiatement le 15 (SAMU) ou
            le 18 (Pompiers)
          </p>
        </div>

        {/* Emergency Numbers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-red-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 text-center">
              <Phone className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <h3 className="font-bold text-2xl text-red-600">15</h3>
              <p className="font-medium">SAMU</p>
              <p className="text-sm text-gray-600">Urgences médicales</p>
              <Button className="w-full mt-3 bg-red-600 hover:bg-red-700">
                <Phone className="h-4 w-4 mr-2" />
                Appeler
              </Button>
            </CardContent>
          </Card>

          <Card className="border-red-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 text-center">
              <Phone className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <h3 className="font-bold text-2xl text-red-600">18</h3>
              <p className="font-medium">Pompiers</p>
              <p className="text-sm text-gray-600">Secours d&apos;urgence</p>
              <Button className="w-full mt-3 bg-red-600 hover:bg-red-700">
                <Phone className="h-4 w-4 mr-2" />
                Appeler
              </Button>
            </CardContent>
          </Card>

          <Card className="border-blue-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 text-center">
              <Phone className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-bold text-2xl text-blue-600">17</h3>
              <p className="font-medium">Police</p>
              <p className="text-sm text-gray-600">Sécurité publique</p>
              <Button className="w-full mt-3 bg-blue-600 hover:bg-blue-700">
                <Phone className="h-4 w-4 mr-2" />
                Appeler
              </Button>
            </CardContent>
          </Card>

          <Card className="border-green-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 text-center">
              <Phone className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-bold text-2xl text-green-600">112</h3>
              <p className="font-medium">Urgences UE</p>
              <p className="text-sm text-gray-600">Numéro européen</p>
              <Button className="w-full mt-3 bg-green-600 hover:bg-green-700">
                <Phone className="h-4 w-4 mr-2" />
                Appeler
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Personal Emergency Contacts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 mr-2" />
              Mes contacts d&apos;urgence
            </CardTitle>
            <CardDescription>
              Personnes à prévenir en cas d&apos;urgence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-medium">Marie Durand</p>
                  <p className="text-sm text-gray-600">
                    Épouse • Contact prioritaire
                  </p>
                  <p className="text-sm text-gray-500">+33 6 12 34 56 78</p>
                </div>
                <Button variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Appeler
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-medium">Dr. Martin Dupont</p>
                  <p className="text-sm text-gray-600">Médecin traitant</p>
                  <p className="text-sm text-gray-500">+33 1 23 45 67 89</p>
                </div>
                <Button variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Appeler
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-medium">Paul Durand</p>
                  <p className="text-sm text-gray-600">Frère</p>
                  <p className="text-sm text-gray-500">+33 6 98 76 54 32</p>
                </div>
                <Button variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Appeler
                </Button>
              </div>
            </div>

            <Button className="w-full mt-4" variant="outline">
              Modifier mes contacts
            </Button>
          </CardContent>
        </Card>

        {/* Nearest Emergency Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Services d&apos;urgence les plus proches
            </CardTitle>
            <CardDescription>
              Hôpitaux et centres de soins près de vous
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-medium">Hôpital Saint-Antoine</p>
                  <p className="text-sm text-gray-600">
                    184 rue du Faubourg Saint-Antoine, 75012 Paris
                  </p>
                  <p className="text-sm text-green-600">
                    ● Ouvert 24h/24 • 1.2 km
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    Itinéraire
                  </Button>
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-medium">SOS Médecins</p>
                  <p className="text-sm text-gray-600">
                    Service de garde médicale à domicile
                  </p>
                  <p className="text-sm text-blue-600">● Service 24h/24</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-1" />
                    01 47 07 77 77
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-medium">Pharmacie de garde</p>
                  <p className="text-sm text-gray-600">
                    Pharmacie Monge • 128 rue Monge, 75005 Paris
                  </p>
                  <p className="text-sm text-orange-600">
                    ● Ouverte jusqu&apos;à 00h • 2.8 km
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    Itinéraire
                  </Button>
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Information */}
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Informations importantes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="p-3 bg-orange-50 rounded-lg">
              <p className="font-medium mb-1">Allergies connues :</p>
              <p className="text-orange-700">Pénicilline (réaction cutanée)</p>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="font-medium mb-1">Groupe sanguin :</p>
              <p className="text-blue-700">O+ (Rhésus positif)</p>
            </div>

            <div className="p-3 bg-red-50 rounded-lg">
              <p className="font-medium mb-1">Traitements en cours :</p>
              <p className="text-red-700">
                Aspirine 100mg (1x/jour), Paracétamol 1000mg (3x/jour)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PatientLayout>
  );
}
