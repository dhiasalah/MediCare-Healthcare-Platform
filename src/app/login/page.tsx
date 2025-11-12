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
import { Stethoscope, Mail, Lock, ArrowRight, CheckCircle } from "lucide-react";
import { useAuthInitialization } from "@/hooks/useAuthInitialization";
import { loginSchema, type LoginFormData } from "@/lib/validations";

export default function LoginPage() {
  const { login, user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const isAuthInitialized = useAuthInitialization();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Redirect authenticated users to their dashboard
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

  // Show loading while checking authentication
  if (!isAuthInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">
            Vérification de l&apos;authentification...
          </p>
        </div>
      </div>
    );
  }

  // Don't render login form if user is authenticated
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white font-medium">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: LoginFormData) => {
    try {
      const user = await login(data.email, data.password);

      if (user) {
        if (user.user_type === "doctor") {
          router.push("/espace-medecin");
        } else if (user.user_type === "patient") {
          router.push("/espace-patient");
        } else {
          router.push("/");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Benefits and Info */}
          <div className="space-y-8 text-white lg:pl-8">
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur rounded-2xl border border-white/30 mb-6">
                <Stethoscope className="w-8 h-8" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
                Bienvenue sur
                <br />
                MediCare
              </h1>
              <p className="text-xl text-blue-100">
                Accédez à votre espace de santé sécurisé
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-400/30 flex items-center justify-center mt-1 flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-green-300"></div>
                </div>
                <div>
                  <p className="font-semibold">Gestion simplifiée de santé</p>
                  <p className="text-sm text-blue-100">
                    Suivez votre dossier médical en ligne
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-400/30 flex items-center justify-center mt-1 flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-green-300"></div>
                </div>
                <div>
                  <p className="font-semibold">Consultations sécurisées</p>
                  <p className="text-sm text-blue-100">
                    Communiquez avec vos médecins en ligne
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-400/30 flex items-center justify-center mt-1 flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-green-300"></div>
                </div>
                <div>
                  <p className="font-semibold">Disponible 24/7</p>
                  <p className="text-sm text-blue-100">
                    Accédez à vos informations à tout moment
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Login Form */}
          <div>
            <div className="shadow-2xl border-0 overflow-hidden rounded-2xl bg-white">
              {/* Form Header */}
              <div className="relative h-40 bg-gradient-to-br from-blue-600 to-indigo-600 overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-4 -left-4 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>

                {/* Content */}
                <div className="relative h-full flex flex-col justify-center px-8">
                  <h2 className="text-4xl font-bold text-white mb-2">
                    Connexion
                  </h2>
                  <p className="text-blue-100">
                    Accédez à votre compte MediCare
                  </p>
                </div>

                {/* Bottom accent */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400"></div>
              </div>

              {/* Form Info */}
              <div className="px-8 py-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full mt-0.5"></div>
                  <div>
                    <h3 className="font-bold text-gray-900">Connectez-vous</h3>
                    <p className="text-sm text-gray-600">
                      Entrez vos identifiants
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-semibold text-gray-900"
                    >
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="votre.email@exemple.com"
                        {...register("email")}
                        className={`pl-10 border-2 ${
                          errors.email
                            ? "border-red-500 bg-red-50 focus:ring-red-200"
                            : "border-gray-200 hover:border-gray-300"
                        } rounded-xl transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm h-11 font-medium`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <span className="text-red-500 font-bold">⚠</span>
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-sm font-semibold text-gray-900"
                    >
                      Mot de passe <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        {...register("password")}
                        className={`pl-10 border-2 ${
                          errors.password
                            ? "border-red-500 bg-red-50 focus:ring-red-200"
                            : "border-gray-200 hover:border-gray-300"
                        } rounded-xl transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm h-11 font-medium`}
                      />
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <span className="text-red-500 font-bold">⚠</span>
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] mt-6"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-3"></div>
                        Connexion en cours...
                      </>
                    ) : (
                      <>
                        Se connecter <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="my-6 border-t border-gray-200"></div>

                {/* Links */}
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      Vous n&apos;avez pas de compte?
                    </p>
                    <Link href="/signup">
                      <Button
                        variant="outline"
                        className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-5 rounded-xl"
                      >
                        Créer un compte
                      </Button>
                    </Link>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      Nouveau compte créé par votre médecin?
                    </p>
                    <Link href="/first-login">
                      <Button
                        variant="ghost"
                        className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold py-5"
                      >
                        Activez-le ici
                      </Button>
                    </Link>
                  </div>

                  <div className="text-center pt-2">
                    <Link
                      href="/"
                      className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
                    >
                      ← Retour à l&apos;accueil
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
