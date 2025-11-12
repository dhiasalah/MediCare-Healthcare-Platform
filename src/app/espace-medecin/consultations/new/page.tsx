"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import DoctorLayout from "@/components/DoctorLayout";
import { patientsAPI, consultationHistoryAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

export default function NewConsultationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const patientId = parseInt(searchParams.get("patientId") || "0");
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    date_consultation: new Date().toISOString().split("T")[0],
    motif: "",
    diagnostic: "",
    traitement: "",
    notes: "",
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const patientData = await patientsAPI.getById(patientId);
        setPatient(patientData);
      } catch (e) {
        console.error(e);
        router.push("/espace-medecin/patients");
      } finally {
        setLoading(false);
      }
    };
    if (patientId) {
      fetch();
    }
  }, [patientId, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!formData.motif || !formData.diagnostic) {
      alert("Veuillez remplir les champs obligatoires");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        patient: patientId,
        date_consultation: formData.date_consultation,
        motif: formData.motif,
        diagnostic: formData.diagnostic,
        traitement: formData.traitement,
        notes: formData.notes,
      };

      await consultationHistoryAPI.createConsultation(payload);
      alert("Consultation créée avec succès!");
      router.push(`/espace-medecin/patients/${patientId}`);
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la création de la consultation");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <DoctorLayout>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DoctorLayout>
    );

  if (!patient)
    return (
      <DoctorLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Patient non trouvé</p>
        </div>
      </DoctorLayout>
    );

  return (
    <DoctorLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push(`/espace-medecin/patients/${patientId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au dossier
          </Button>
          <h1 className="text-3xl font-bold">Nouvelle consultation</h1>
        </div>

        {/* Patient Info Card */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">
              Patient:{" "}
              <strong>
                {patient.first_name} {patient.last_name}
              </strong>
            </p>
            <p className="text-sm text-gray-600">
              Email: <strong>{patient.email}</strong>
            </p>
          </CardContent>
        </Card>

        {/* Consultation Form */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de la consultation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Row 1: Date */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Date de la consultation *
              </label>
              <Input
                type="date"
                name="date_consultation"
                value={formData.date_consultation}
                onChange={handleChange}
              />
            </div>

            {/* Row 2: Motif */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Motif de la consultation *
              </label>
              <Input
                name="motif"
                value={formData.motif}
                onChange={handleChange}
                placeholder="Motif de la consultation"
              />
            </div>

            {/* Row 3: Diagnostic */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Diagnostic *
              </label>
              <textarea
                name="diagnostic"
                value={formData.diagnostic}
                onChange={handleChange}
                placeholder="Diagnostic..."
                className="w-full p-2 border rounded-md"
                rows={4}
              />
            </div>

            {/* Row 4: Treatment */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Traitement prescrit
              </label>
              <textarea
                name="traitement"
                value={formData.traitement}
                onChange={handleChange}
                placeholder="Traitement prescrit..."
                className="w-full p-2 border rounded-md"
                rows={4}
              />
            </div>

            {/* Row 5: Notes */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Notes supplémentaires
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Notes supplémentaires..."
                className="w-full p-2 border rounded-md"
                rows={4}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 justify-end mt-8">
              <Button
                variant="outline"
                onClick={() =>
                  router.push(`/espace-medecin/patients/${patientId}`)
                }
              >
                Annuler
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleSave}
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Enregistrement..." : "Créer la consultation"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DoctorLayout>
  );
}
