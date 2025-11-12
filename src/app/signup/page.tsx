"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth";
import {
  Stethoscope,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Calendar,
} from "lucide-react";
import { useAuthInitialization } from "@/hooks/useAuthInitialization";
import { showToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/lib/errorHandler";
import { signupSchema, type SignupFormData } from "@/lib/validations";
import { SPECIALIZATIONS } from "@/types";

export default function SignupPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const isAuthInitialized = useAuthInitialization();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
    defaultValues: {
      username: "",
      email: "",
      password: "",
      password_confirm: "",
      first_name: "",
      last_name: "",
      user_type: "patient",
      phone: "",
      date_of_birth: "",
      address: "",
      medical_license_number: "",
      specialization: "",
      medical_history: "",
      allergies: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      doctor_id: undefined,
    },
  });

  const userType = watch("user_type");

  useEffect(() => {
    if (isAuthInitialized && user && isAuthenticated) {
      if (user.user_type === "doctor") {
        router.replace("/espace-medecin");
      } else if (user.user_type === "patient") {
        router.replace("/espace-patient");
      } else {
        router.replace("/");
      }
    }
  }, [isAuthInitialized, user, isAuthenticated, router]);

  const onSubmit = async (data: SignupFormData) => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/accounts/register/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const responseData = await response.json();

      if (response.ok) {
        showToast.success("Inscription réussie! Redirection...");

        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        console.error("Registration failed:", responseData);

        const errorMessages = Object.entries(responseData)
          .filter(([key]) => key !== "message")
          .map(([key, value]) => {
            const val = Array.isArray(value) ? value[0] : value;
            return `${key}: ${val}`;
          })
          .join(", ");

        showToast.error(
          errorMessages ||
            responseData.message ||
            "Erreur lors de l'inscription"
        );
      }
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = getErrorMessage(error);
      showToast.error("Erreur", errorMessage);
    }
  };

  if (!isAuthInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Chargement...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-blue-600 font-medium">
              Redirection en cours...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-6">
            <Stethoscope className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Créer un compte
          </h1>
          <p className="text-blue-100 text-lg">
            Rejoignez MediCare et accédez à une meilleure gestion de santé
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left sidebar - Benefits */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 text-white">
              <h3 className="font-bold text-lg mb-4">Avantages</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-400/30 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-green-300"></div>
                  </div>
                  <span className="text-sm">Accès 24/7 à vos dossiers</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-400/30 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-green-300"></div>
                  </div>
                  <span className="text-sm">Consultations sécurisées</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-400/30 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-green-300"></div>
                  </div>
                  <span className="text-sm">Gestion de rendez-vous</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-400/30 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-green-300"></div>
                  </div>
                  <span className="text-sm">Support professionnel</span>
                </li>
              </ul>
            </div>

            {/* Already have account */}
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 text-center text-white">
              <p className="text-sm mb-4">Vous avez déjà un compte?</p>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="w-full border-white text-white bg-blue-500/30 hover:bg-blue-500/50 font-semibold transition-all"
                >
                  Se connecter
                </Button>
              </Link>
            </div>
          </div>

          {/* Right content - Form */}
          <div className="lg:col-span-2">
            <div className="shadow-2xl border-0 overflow-hidden rounded-2xl bg-white">
              {/* Decorative header background */}
              <div className="relative h-64 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-4 -left-4 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>

                {/* Content */}
                <div className="relative h-full flex flex-col justify-center px-8 py-12">
                  <div className="mb-6 inline-flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur rounded-2xl border border-white/30">
                    <Stethoscope className="w-7 h-7 text-white" />
                  </div>
                  <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
                    Créer un compte
                  </h1>
                  <p className="text-xl text-blue-100 max-w-2xl">
                    Rejoignez MediCare et accédez à une meilleure gestion de
                    santé
                  </p>
                </div>

                {/* Bottom accent */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400"></div>
              </div>

              {/* Form intro section - separate from hero */}
              <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full mt-0.5"></div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Informations d&apos;inscription
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Tous les champs marqués d&apos;un * sont requis
                    </p>
                  </div>
                </div>
              </div>

              {/* Form content */}
              <div className="p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  {/* User Type Selection */}
                  <div className="space-y-4">
                    <Label className="text-base font-bold text-gray-900 block">
                      Type de compte <span className="text-red-500">*</span>
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Patient Button */}
                      <button
                        type="button"
                        onClick={() => setValue("user_type", "patient")}
                        className={`group p-6 border-2 rounded-2xl flex flex-col items-center space-y-3 transition-all duration-300 cursor-pointer ${
                          userType === "patient"
                            ? "border-blue-600 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg"
                            : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:shadow-md"
                        }`}
                      >
                        <div
                          className={`p-3 rounded-full transition-all duration-300 ${
                            userType === "patient"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 text-gray-400 group-hover:bg-gray-300"
                          }`}
                        >
                          <User className="h-6 w-6" />
                        </div>
                        <span
                          className={`font-bold text-sm ${
                            userType === "patient"
                              ? "text-blue-600"
                              : "text-gray-600"
                          }`}
                        >
                          Patient
                        </span>
                      </button>

                      {/* Doctor Button */}
                      <button
                        type="button"
                        onClick={() => setValue("user_type", "doctor")}
                        className={`group p-6 border-2 rounded-2xl flex flex-col items-center space-y-3 transition-all duration-300 cursor-pointer ${
                          userType === "doctor"
                            ? "border-blue-600 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg"
                            : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:shadow-md"
                        }`}
                      >
                        <div
                          className={`p-3 rounded-full transition-all duration-300 ${
                            userType === "doctor"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 text-gray-400 group-hover:bg-gray-300"
                          }`}
                        >
                          <Stethoscope className="h-6 w-6" />
                        </div>
                        <span
                          className={`font-bold text-sm ${
                            userType === "doctor"
                              ? "text-blue-600"
                              : "text-gray-600"
                          }`}
                        >
                          Médecin
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Account Credentials Section */}
                  <div className="space-y-4 pt-6 border-t-2 border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Identifiants du compte
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Username */}
                      <FormField
                        label="Nom d'utilisateur"
                        register={register("username")}
                        error={errors.username}
                        placeholder="nom_utilisateur"
                        icon={User}
                      />

                      {/* Email */}
                      <FormField
                        label="Email"
                        register={register("email")}
                        error={errors.email}
                        placeholder="email@exemple.com"
                        type="email"
                        icon={Mail}
                      />

                      {/* Password */}
                      <FormField
                        label="Mot de passe"
                        register={register("password")}
                        error={errors.password}
                        placeholder="••••••••"
                        type="password"
                        icon={Lock}
                      />

                      {/* Confirm Password */}
                      <FormField
                        label="Confirmer le mot de passe"
                        register={register("password_confirm")}
                        error={errors.password_confirm}
                        placeholder="••••••••"
                        type="password"
                        icon={Lock}
                      />
                    </div>
                  </div>

                  {/* Personal Information Section */}
                  <div className="space-y-4 pt-6 border-t-2 border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-6 bg-gradient-to-b from-green-600 to-emerald-600 rounded-full"></div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Informations personnelles
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* First Name */}
                      <FormField
                        label="Prénom"
                        register={register("first_name")}
                        error={errors.first_name}
                        placeholder="Prénom"
                      />

                      {/* Last Name */}
                      <FormField
                        label="Nom"
                        register={register("last_name")}
                        error={errors.last_name}
                        placeholder="Nom"
                      />

                      {/* Phone */}
                      <FormField
                        label="Téléphone"
                        register={register("phone")}
                        error={errors.phone}
                        placeholder="+33 6 12 34 56 78"
                        icon={Phone}
                      />

                      {/* Date of Birth */}
                      <FormField
                        label="Date de naissance"
                        register={register("date_of_birth")}
                        error={errors.date_of_birth}
                        type="date"
                        icon={Calendar}
                      />

                      {/* Address - Full Width */}
                      <div className="md:col-span-2">
                        <FormField
                          label="Adresse"
                          register={register("address")}
                          error={errors.address}
                          placeholder="Adresse complète"
                          icon={MapPin}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Doctor-specific fields */}
                  {userType === "doctor" && (
                    <div className="space-y-4 pt-6 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-200 shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                        <h3 className="text-lg font-bold text-gray-900">
                          Informations professionnelles
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Medical License */}
                        <FormField
                          label="Numéro de licence médicale"
                          register={register("medical_license_number")}
                          error={errors.medical_license_number}
                          placeholder="N° de licence"
                        />

                        {/* Specialization */}
                        <div>
                          <Label
                            htmlFor="specialization"
                            className="text-sm font-medium"
                          >
                            Spécialisation{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          <select
                            id="specialization"
                            {...register("specialization")}
                            className={`mt-2 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                              errors.specialization
                                ? "border-red-500 bg-red-50"
                                : "border-gray-300 bg-white"
                            }`}
                          >
                            <option value="">
                              Sélectionnez une spécialisation
                            </option>
                            {SPECIALIZATIONS.map((spec) => (
                              <option key={spec.value} value={spec.value}>
                                {spec.label}
                              </option>
                            ))}
                          </select>
                          {errors.specialization && (
                            <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                              <span className="text-red-500">⚠</span>
                              {errors.specialization.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Patient-specific fields */}
                  {userType === "patient" && (
                    <>
                      {/* Emergency Contact */}
                      <div className="space-y-4 pt-6 bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-200 shadow-md">
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-6 bg-gradient-to-b from-green-600 to-emerald-600 rounded-full"></div>
                          <h3 className="text-lg font-bold text-gray-900">
                            Contact d&apos;urgence
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* Emergency Contact Name */}
                          <FormField
                            label="Nom du contact d'urgence"
                            register={register("emergency_contact_name")}
                            error={errors.emergency_contact_name}
                            placeholder="Nom complet"
                          />

                          {/* Emergency Contact Phone */}
                          <FormField
                            label="Téléphone du contact d'urgence"
                            register={register("emergency_contact_phone")}
                            error={errors.emergency_contact_phone}
                            placeholder="+33 6 12 34 56 78"
                            icon={Phone}
                          />
                        </div>
                      </div>

                      {/* Medical Information */}
                      <div className="space-y-4 pt-6 bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200 shadow-md">
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-6 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></div>
                          <h3 className="text-lg font-bold text-gray-900">
                            Informations médicales{" "}
                            <span className="text-gray-500 text-sm font-normal">
                              (optionnel)
                            </span>
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 gap-5">
                          {/* Medical History */}
                          <div>
                            <Label
                              htmlFor="medical_history"
                              className="text-sm font-semibold text-gray-900"
                            >
                              Antécédents médicaux
                            </Label>
                            <textarea
                              id="medical_history"
                              {...register("medical_history")}
                              placeholder="Décrivez vos antécédents médicaux..."
                              className="mt-2 w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all shadow-sm hover:border-gray-300"
                              rows={3}
                            />
                          </div>

                          {/* Allergies */}
                          <div>
                            <Label
                              htmlFor="allergies"
                              className="text-sm font-semibold text-gray-900"
                            >
                              Allergies
                            </Label>
                            <textarea
                              id="allergies"
                              {...register("allergies")}
                              placeholder="Listez vos allergies connues..."
                              className="mt-2 w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all shadow-sm hover:border-gray-300"
                              rows={2}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Submit Button */}
                  <div className="pt-8 border-t-2 border-gray-200">
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-7 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-3"></div>
                          Création en cours...
                        </>
                      ) : (
                        <>Créer mon compte</>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Form Field Component
interface FormFieldProps {
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  error?: { message?: string };
  placeholder?: string;
  type?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

function FormField({
  label,
  register,
  error,
  placeholder,
  type = "text",
  icon: Icon,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={register.name}
        className="text-sm font-semibold text-gray-900"
      >
        {label}{" "}
        {label.includes("optionnel") ? (
          ""
        ) : (
          <span className="text-red-500">*</span>
        )}
      </Label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        )}
        <Input
          id={register.name}
          type={type}
          placeholder={placeholder}
          {...register}
          className={`${Icon ? "pl-10" : ""} border-2 ${
            error
              ? "border-red-500 bg-red-50 focus:ring-red-200"
              : "border-gray-200 hover:border-gray-300"
          } rounded-xl transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm h-11 font-medium`}
        />
      </div>
      {error && (
        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
          <span className="text-red-500 font-bold">⚠</span>
          {error.message}
        </p>
      )}
    </div>
  );
}
