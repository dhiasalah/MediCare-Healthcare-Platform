"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Users,
  Clock,
  Euro,
  FileText,
  Activity,
  Download,
  Filter,
} from "lucide-react";
import DoctorLayout from "@/components/DoctorLayout";

export default function StatistiquesPage() {
  return (
    <DoctorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Statistiques</h2>
            <p className="text-gray-600">
              Analysez votre activité médicale et vos performances
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Période</span>
            </Button>
            <Button className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Exporter rapport</span>
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Patients vus
                  </p>
                  <p className="text-2xl font-bold text-gray-900">187</p>
                  <p className="text-xs text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12% ce mois
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg mr-4">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Consultations
                  </p>
                  <p className="text-2xl font-bold text-gray-900">234</p>
                  <p className="text-xs text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8% ce mois
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg mr-4">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Temps moyen
                  </p>
                  <p className="text-2xl font-bold text-gray-900">28min</p>
                  <p className="text-xs text-orange-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +2min ce mois
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg mr-4">
                  <Euro className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenus</p>
                  <p className="text-2xl font-bold text-gray-900">12.4k€</p>
                  <p className="text-xs text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +15% ce mois
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Consultations Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Consultations mensuelles
              </CardTitle>
              <CardDescription>
                Évolution du nombre de consultations sur l&apos;année
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-end justify-between space-x-2 p-4">
                {/* Simple bar chart representation */}
                <div className="flex flex-col items-center space-y-2">
                  <div
                    className="w-8 bg-blue-200 rounded-t"
                    style={{ height: "120px" }}
                  ></div>
                  <span className="text-xs text-gray-600">Jan</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div
                    className="w-8 bg-blue-300 rounded-t"
                    style={{ height: "140px" }}
                  ></div>
                  <span className="text-xs text-gray-600">Fév</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div
                    className="w-8 bg-blue-400 rounded-t"
                    style={{ height: "160px" }}
                  ></div>
                  <span className="text-xs text-gray-600">Mar</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div
                    className="w-8 bg-blue-300 rounded-t"
                    style={{ height: "130px" }}
                  ></div>
                  <span className="text-xs text-gray-600">Avr</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div
                    className="w-8 bg-blue-400 rounded-t"
                    style={{ height: "180px" }}
                  ></div>
                  <span className="text-xs text-gray-600">Mai</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div
                    className="w-8 bg-blue-500 rounded-t"
                    style={{ height: "200px" }}
                  ></div>
                  <span className="text-xs text-gray-600">Jun</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div
                    className="w-8 bg-blue-400 rounded-t"
                    style={{ height: "170px" }}
                  ></div>
                  <span className="text-xs text-gray-600">Jul</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div
                    className="w-8 bg-blue-300 rounded-t"
                    style={{ height: "150px" }}
                  ></div>
                  <span className="text-xs text-gray-600">Aoû</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div
                    className="w-8 bg-blue-500 rounded-t"
                    style={{ height: "190px" }}
                  ></div>
                  <span className="text-xs text-gray-600">Sep</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div
                    className="w-8 bg-blue-600 rounded-t"
                    style={{ height: "220px" }}
                  ></div>
                  <span className="text-xs text-gray-600">Oct</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div
                    className="w-8 bg-blue-400 rounded-t"
                    style={{ height: "160px" }}
                  ></div>
                  <span className="text-xs text-gray-600">Nov</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div
                    className="w-8 bg-blue-300 rounded-t"
                    style={{ height: "140px" }}
                  ></div>
                  <span className="text-xs text-gray-600">Déc</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Patient Types Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Répartition des patients
              </CardTitle>
              <CardDescription>Types de consultations ce mois</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-sm">Consultation générale</span>
                  </div>
                  <span className="text-sm font-medium">45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: "45%" }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-sm">Suivi chronique</span>
                  </div>
                  <span className="text-sm font-medium">30%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: "30%" }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-purple-500 rounded"></div>
                    <span className="text-sm">Téléconsultation</span>
                  </div>
                  <span className="text-sm font-medium">15%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: "15%" }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                    <span className="text-sm">Urgence</span>
                  </div>
                  <span className="text-sm font-medium">10%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: "10%" }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Indicateurs de performance
            </CardTitle>
            <CardDescription>
              Métriques clés de votre activité médicale
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="text-3xl font-bold text-blue-600 mb-2">96%</div>
                <p className="text-sm text-gray-600">Taux de ponctualité</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: "96%" }}
                  ></div>
                </div>
              </div>

              <div className="text-center p-4">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  4.8
                </div>
                <p className="text-sm text-gray-600">Note de satisfaction</p>
                <div className="flex justify-center space-x-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-yellow-400">
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-center p-4">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  2.1%
                </div>
                <p className="text-sm text-gray-600">Taux d&apos;annulation</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: "2.1%" }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Schedule Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Analyse de planning
            </CardTitle>
            <CardDescription>
              Répartition de votre temps de travail cette semaine
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Consultations</span>
                  <span className="text-sm font-medium">32h 15min</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: "85%" }}
                  ></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Administration</span>
                  <span className="text-sm font-medium">4h 30min</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: "12%" }}
                  ></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Formation</span>
                  <span className="text-sm font-medium">1h 15min</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: "3%" }}
                  ></div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">38h</div>
                  <p className="text-sm text-blue-700">Temps total travaillé</p>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">47</div>
                  <p className="text-sm text-green-700">Patients vus</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export and Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Rapports disponibles</CardTitle>
            <CardDescription>
              Générez des rapports détaillés pour votre activité
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-16 flex flex-col items-center justify-center space-y-2"
              >
                <FileText className="h-5 w-5" />
                <span className="text-sm">Rapport mensuel</span>
              </Button>

              <Button
                variant="outline"
                className="h-16 flex flex-col items-center justify-center space-y-2"
              >
                <BarChart3 className="h-5 w-5" />
                <span className="text-sm">Analyse financière</span>
              </Button>

              <Button
                variant="outline"
                className="h-16 flex flex-col items-center justify-center space-y-2"
              >
                <Users className="h-5 w-5" />
                <span className="text-sm">Bilan patients</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DoctorLayout>
  );
}
