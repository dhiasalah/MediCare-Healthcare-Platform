"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pill, Clock, Check, AlertTriangle, Plus } from "lucide-react";
import PatientLayout from "@/components/PatientLayout";

export default function MedicamentsPage() {
  return (
    <PatientLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Mes Médicaments
            </h2>
            <p className="text-gray-600">
              Gérez vos traitements et rappels de prise
            </p>
          </div>
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Ajouter un médicament</span>
          </Button>
        </div>

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Planning d&apos;aujourd&apos;hui
            </CardTitle>
            <CardDescription>Vos prises de médicaments prévues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <Check className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Paracétamol 1000mg</p>
                    <p className="text-sm text-gray-600">1 comprimé - 08:00</p>
                    <p className="text-sm text-green-600 font-medium">✓ Pris</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" disabled>
                  Confirmé
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <Check className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Paracétamol 1000mg</p>
                    <p className="text-sm text-gray-600">1 comprimé - 12:00</p>
                    <p className="text-sm text-green-600 font-medium">✓ Pris</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" disabled>
                  Confirmé
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Aspirine 100mg</p>
                    <p className="text-sm text-gray-600">1 comprimé - 20:00</p>
                    <p className="text-sm text-orange-600 font-medium">
                      ⏰ Rappel dans 2h
                    </p>
                  </div>
                </div>
                <Button size="sm">Marquer comme pris</Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <Pill className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Vitamine D</p>
                    <p className="text-sm text-gray-600">
                      1 gélule - Hebdomadaire
                    </p>
                    <p className="text-sm text-blue-600 font-medium">
                      Dimanche prochain
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Programmer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Medications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Pill className="h-5 w-5 mr-2" />
              Médicaments actuels
            </CardTitle>
            <CardDescription>Votre traitement en cours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-lg">Paracétamol 1000mg</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Antalgique - Anti-inflammatoire
                    </p>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Posologie:</strong> 1 comprimé, 3 fois par jour
                      </p>
                      <p>
                        <strong>Durée:</strong> 7 jours (jusqu&apos;au 12
                        octobre)
                      </p>
                      <p>
                        <strong>Prescrit par:</strong> Dr. Martin Dupont
                      </p>
                      <p>
                        <strong>Instructions:</strong> À prendre au cours des
                        repas
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      Modifier
                    </Button>
                    <Button size="sm" variant="outline">
                      Arrêter
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-lg">Aspirine 100mg</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Antiagrégant plaquettaire
                    </p>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Posologie:</strong> 1 comprimé, 1 fois par jour
                      </p>
                      <p>
                        <strong>Durée:</strong> Traitement de fond
                      </p>
                      <p>
                        <strong>Prescrit par:</strong> Dr. Sophie Leroux
                      </p>
                      <p>
                        <strong>Instructions:</strong> Le soir, après le dîner
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      Modifier
                    </Button>
                    <Button size="sm" variant="outline">
                      Arrêter
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-lg">Vitamine D 1000 UI</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Complément alimentaire
                    </p>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Posologie:</strong> 1 gélule, 1 fois par semaine
                      </p>
                      <p>
                        <strong>Durée:</strong> 3 mois
                      </p>
                      <p>
                        <strong>Prescrit par:</strong> Dr. Martin Dupont
                      </p>
                      <p>
                        <strong>Instructions:</strong> Le dimanche matin
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      Modifier
                    </Button>
                    <Button size="sm" variant="outline">
                      Arrêter
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medication History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Historique et interactions
            </CardTitle>
            <CardDescription>Traitements passés et alertes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <p className="font-medium text-yellow-800">Allergie connue</p>
                </div>
                <p className="text-sm text-yellow-700">
                  Pénicilline - Réaction cutanée (urticaire)
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Traitements récents terminés</h4>
                <div className="border rounded-lg p-3">
                  <p className="font-medium">Amoxicilline 1g</p>
                  <p className="text-sm text-gray-600">
                    Terminé le 25 septembre - Prescrit par Dr. Bernard
                  </p>
                </div>
                <div className="border rounded-lg p-3">
                  <p className="font-medium">Ibuprofène 400mg</p>
                  <p className="text-sm text-gray-600">
                    Terminé le 20 septembre - Prescrit par Dr. Martin
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>Gérez facilement vos médicaments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button className="h-16 flex flex-col items-center justify-center space-y-2">
                <Plus className="h-5 w-5" />
                <span className="text-sm">Ajouter</span>
              </Button>

              <Button
                variant="outline"
                className="h-16 flex flex-col items-center justify-center space-y-2"
              >
                <Clock className="h-5 w-5" />
                <span className="text-sm">Rappels</span>
              </Button>

              <Button
                variant="outline"
                className="h-16 flex flex-col items-center justify-center space-y-2"
              >
                <Pill className="h-5 w-5" />
                <span className="text-sm">Ordonnances</span>
              </Button>

              <Button
                variant="outline"
                className="h-16 flex flex-col items-center justify-center space-y-2"
              >
                <AlertTriangle className="h-5 w-5" />
                <span className="text-sm">Allergies</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PatientLayout>
  );
}
