"use client";

import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PatientFormData } from "@/lib/validations";
import { User, MapPin, Phone, Mail, Heart, AlertCircle } from "lucide-react";

interface PatientFormProps {
  form: UseFormReturn<PatientFormData>;
  idPrefix: string;
  isEditMode?: boolean; // If true, email field will be read-only
}

export function PatientForm({
  form,
  idPrefix,
  isEditMode = false,
}: PatientFormProps) {
  const errors = form.formState.errors;

  return (
    <div className="space-y-8">
      {/* Personal Information Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b-2 border-blue-200">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Informations personnelles
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label
              htmlFor={`${idPrefix}_firstName`}
              className="font-medium mb-2 block"
            >
              Prénom *
            </Label>
            <Input
              id={`${idPrefix}_firstName`}
              {...form.register("first_name")}
              placeholder="Prénom du patient"
              className={`${
                errors.first_name
                  ? "border-red-500 focus:border-red-500"
                  : "focus:border-blue-500"
              } transition-colors`}
            />
            {errors.first_name && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.first_name.message}
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor={`${idPrefix}_lastName`}
              className="font-medium mb-2 block"
            >
              Nom *
            </Label>
            <Input
              id={`${idPrefix}_lastName`}
              {...form.register("last_name")}
              placeholder="Nom du patient"
              className={`${
                errors.last_name
                  ? "border-red-500 focus:border-red-500"
                  : "focus:border-blue-500"
              } transition-colors`}
            />
            {errors.last_name && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.last_name.message}
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor={`${idPrefix}_dateOfBirth`}
              className="font-medium mb-2 block"
            >
              Date de naissance *
            </Label>
            <Input
              id={`${idPrefix}_dateOfBirth`}
              type="date"
              {...form.register("date_of_birth")}
              className={`${
                errors.date_of_birth
                  ? "border-red-500 focus:border-red-500"
                  : "focus:border-blue-500"
              } transition-colors`}
            />
            {errors.date_of_birth && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.date_of_birth.message}
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor={`${idPrefix}_gender`}
              className="font-medium mb-2 block"
            >
              Genre *
            </Label>
            <select
              id={`${idPrefix}_gender`}
              {...form.register("gender")}
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.gender ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Sélectionner...</option>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
              <option value="O">Autre</option>
            </select>
            {errors.gender && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.gender.message}
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor={`${idPrefix}_bloodType`}
              className="font-medium mb-2 block"
            >
              Groupe sanguin
            </Label>
            <select
              id={`${idPrefix}_bloodType`}
              {...form.register("blood_type")}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Sélectionner...</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b-2 border-green-200">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Phone className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Coordonnées</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label
              htmlFor={`${idPrefix}_email`}
              className="font-medium mb-2 block"
            >
              <Mail className="h-4 w-4 inline mr-1" />
              Email {!isEditMode && "*"}
            </Label>
            <Input
              id={`${idPrefix}_email`}
              type="email"
              {...form.register("email")}
              placeholder="email@exemple.com"
              className={`${
                errors.email
                  ? "border-red-500 focus:border-red-500"
                  : "focus:border-green-500"
              } ${
                isEditMode
                  ? "bg-gray-100 cursor-not-allowed"
                  : "transition-colors"
              }`}
              readOnly={isEditMode}
              disabled={isEditMode}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.email.message}
              </p>
            )}
            {isEditMode && (
              <p className="text-xs text-gray-500 mt-1">
                L&apos;email ne peut pas être modifié
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor={`${idPrefix}_phone`}
              className="font-medium mb-2 block"
            >
              <Phone className="h-4 w-4 inline mr-1" />
              Téléphone *
            </Label>
            <Input
              id={`${idPrefix}_phone`}
              {...form.register("phone")}
              placeholder="+33 6 12 34 56 78"
              className={`${
                errors.phone
                  ? "border-red-500 focus:border-red-500"
                  : "focus:border-green-500"
              } transition-colors`}
            />
            {errors.phone && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.phone.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <Label
              htmlFor={`${idPrefix}_address`}
              className="font-medium mb-2 block"
            >
              <MapPin className="h-4 w-4 inline mr-1" />
              Adresse *
            </Label>
            <Input
              id={`${idPrefix}_address`}
              {...form.register("address")}
              placeholder="Adresse complète"
              className={`${
                errors.address
                  ? "border-red-500 focus:border-red-500"
                  : "focus:border-green-500"
              } transition-colors`}
            />
            {errors.address && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.address.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Contact Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b-2 border-red-200">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Contact d&apos;urgence
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label
              htmlFor={`${idPrefix}_emergencyContactName`}
              className="font-medium mb-2 block"
            >
              Nom du contact *
            </Label>
            <Input
              id={`${idPrefix}_emergencyContactName`}
              {...form.register("emergency_contact_name")}
              placeholder="Nom complet"
              className={`${
                errors.emergency_contact_name
                  ? "border-red-500 focus:border-red-500"
                  : "focus:border-red-500"
              } transition-colors`}
            />
            {errors.emergency_contact_name && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.emergency_contact_name.message}
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor={`${idPrefix}_emergencyContactPhone`}
              className="font-medium mb-2 block"
            >
              Téléphone du contact *
            </Label>
            <Input
              id={`${idPrefix}_emergencyContactPhone`}
              {...form.register("emergency_contact_phone")}
              placeholder="+33 6 12 34 56 78"
              className={`${
                errors.emergency_contact_phone
                  ? "border-red-500 focus:border-red-500"
                  : "focus:border-red-500"
              } transition-colors`}
            />
            {errors.emergency_contact_phone && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.emergency_contact_phone.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <Label
              htmlFor={`${idPrefix}_emergencyContactRelation`}
              className="font-medium mb-2 block"
            >
              Lien de parenté *
            </Label>
            <Input
              id={`${idPrefix}_emergencyContactRelation`}
              {...form.register("emergency_contact_relation")}
              placeholder="Ex: Époux/Épouse, Parent, Ami(e), etc."
              className={`${
                errors.emergency_contact_relation
                  ? "border-red-500 focus:border-red-500"
                  : "focus:border-red-500"
              } transition-colors`}
            />
            {errors.emergency_contact_relation && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.emergency_contact_relation.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Medical Information Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b-2 border-pink-200">
          <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
            <Heart className="h-5 w-5 text-pink-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Informations médicales
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <Label
              htmlFor={`${idPrefix}_allergies`}
              className="font-medium mb-2 block"
            >
              Allergies
            </Label>
            <textarea
              id={`${idPrefix}_allergies`}
              {...form.register("allergies")}
              placeholder="Allergies connues (médicaments, aliments, etc.)..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500 min-h-[80px] transition-colors resize-none"
              rows={2}
            />
          </div>

          <div>
            <Label
              htmlFor={`${idPrefix}_medicalHistory`}
              className="font-medium mb-2 block"
            >
              Antécédents médicaux
            </Label>
            <textarea
              id={`${idPrefix}_medicalHistory`}
              {...form.register("medical_history")}
              placeholder="Antécédents, maladies, traitements en cours..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500 min-h-[100px] transition-colors resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor={`${idPrefix}_insuranceProvider`}
                className="font-medium mb-2 block"
              >
                Assurance
              </Label>
              <Input
                id={`${idPrefix}_insuranceProvider`}
                {...form.register("insurance_provider")}
                placeholder="Nom de l'assurance"
              />
            </div>

            <div>
              <Label
                htmlFor={`${idPrefix}_insuranceNumber`}
                className="font-medium mb-2 block"
              >
                Numéro d&apos;assurance
              </Label>
              <Input
                id={`${idPrefix}_insuranceNumber`}
                {...form.register("insurance_number")}
                placeholder="Numéro de police"
                className="transition-colors focus:border-pink-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
