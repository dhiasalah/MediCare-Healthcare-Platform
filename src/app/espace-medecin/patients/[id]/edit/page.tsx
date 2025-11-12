"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import DoctorLayout from "@/components/DoctorLayout";
import { patientsAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

export default function EditPatientPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = parseInt(params.id as string);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    date_of_birth: "",
    medical_history: "",
    allergies: "",
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await patientsAPI.getById(patientId);
        setFormData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          date_of_birth: data.date_of_birth || "",
          medical_history: data.medical_history || "",
          allergies: data.allergies || "",
        });
      } catch (e) {
        console.error(e);
        router.push("/espace-medecin/patients");
      } finally {
        setLoading(false);
      }
    };
    fetch();
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
    setSaving(true);
    try {
      await patientsAPI.update(patientId, formData);
      alert("Patient modifié avec succès!");
      router.push(`/espace-medecin/patients/${patientId}`);
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la modification");
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
          <h1 className="text-3xl font-bold">Modifier le patient</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informations du patient</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Row 1: First Name and Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Prénom</label>
                <Input
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Prénom"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nom</label>
                <Input
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Nom"
                />
              </div>
            </div>

            {/* Row 2: Email and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Téléphone
                </label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Téléphone"
                />
              </div>
            </div>

            {/* Row 3: Address and DOB */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Adresse
                </label>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Adresse"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Date de naissance
                </label>
                <Input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Row 4: Medical History */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Antécédents médicaux
              </label>
              <textarea
                name="medical_history"
                value={formData.medical_history}
                onChange={handleChange}
                placeholder="Antécédents médicaux..."
                className="w-full p-2 border rounded-md"
                rows={4}
              />
            </div>

            {/* Row 5: Allergies */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Allergies
              </label>
              <textarea
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                placeholder="Allergies..."
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
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleSave}
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DoctorLayout>
  );
}
