"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  Mail,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

const emailCheckSchema = z.object({
  email: z.string().email("Email invalide"),
});

const passwordSetupSchema = z
  .object({
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre"
      ),
    password_confirm: z.string(),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "Les mots de passe ne correspondent pas",
    path: ["password_confirm"],
  });

type EmailCheckData = z.infer<typeof emailCheckSchema>;
type PasswordSetupData = z.infer<typeof passwordSetupSchema>;

export default function FirstLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "password" | "success">("email");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const emailForm = useForm<EmailCheckData>({
    resolver: zodResolver(emailCheckSchema),
  });

  const passwordForm = useForm<PasswordSetupData>({
    resolver: zodResolver(passwordSetupSchema),
  });

  const handleEmailCheck = async (data: EmailCheckData) => {
    try {
      setError(null);
      const response = await api.post("/api/accounts/check-email/", {
        email: data.email,
      });

      if (!response.data.exists) {
        setError(
          "Aucun compte trouvé avec cet email. Veuillez contacter votre médecin."
        );
        return;
      }

      if (!response.data.password_needs_reset) {
        setError(
          "Votre mot de passe a déjà été défini. Veuillez vous connecter normalement."
        );
        return;
      }

      setEmail(data.email);
      setStep("password");
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(
        error.response?.data?.error ||
          "Une erreur est survenue lors de la vérification de l'email"
      );
    }
  };

  const handlePasswordSetup = async (data: PasswordSetupData) => {
    try {
      setError(null);

      // First, we need to get a token by logging in with the temporary password
      // Since we don't have the temp password, we'll use a special endpoint
      await api.post("/api/accounts/set-password-first-time/", {
        email: email,
        password: data.password,
        password_confirm: data.password_confirm,
      });

      setStep("success");

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(
        error.response?.data?.error ||
          "Une erreur est survenue lors de la définition du mot de passe"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Lock className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              {step === "email" && "Première connexion"}
              {step === "password" && "Définir votre mot de passe"}
              {step === "success" && "Compte activé !"}
            </CardTitle>
            <CardDescription>
              {step === "email" && "Votre médecin a créé un compte pour vous"}
              {step === "password" && "Créez un mot de passe sécurisé"}
              {step === "success" &&
                "Votre compte est maintenant prêt à l'emploi"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Email Step */}
            {step === "email" && (
              <>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Nouveau patient ?</p>
                    <p>
                      Si votre médecin a créé votre compte, entrez l&apos;email
                      qu&apos;il a enregistré pour vous.
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <form
                  onSubmit={emailForm.handleSubmit(handleEmailCheck)}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="votre.email@exemple.com"
                        {...emailForm.register("email")}
                        className={`pl-10 ${
                          emailForm.formState.errors.email
                            ? "border-red-500"
                            : ""
                        }`}
                      />
                    </div>
                    {emailForm.formState.errors.email && (
                      <p className="text-sm text-red-500 mt-1">
                        {emailForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={emailForm.formState.isSubmitting}
                  >
                    {emailForm.formState.isSubmitting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Vérification...</span>
                      </div>
                    ) : (
                      "Continuer"
                    )}
                  </Button>
                </form>
              </>
            )}

            {/* Password Setup Step */}
            {step === "password" && (
              <>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-green-800">
                    Email vérifié : <span className="font-medium">{email}</span>
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <form
                  onSubmit={passwordForm.handleSubmit(handlePasswordSetup)}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="password">
                      Nouveau mot de passe{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        {...passwordForm.register("password")}
                        placeholder="Entrez votre mot de passe"
                        className={
                          passwordForm.formState.errors.password
                            ? "border-red-500"
                            : ""
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {passwordForm.formState.errors.password && (
                      <p className="text-sm text-red-500 mt-1">
                        {passwordForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="password_confirm">
                      Confirmer le mot de passe{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password_confirm"
                        type={showConfirmPassword ? "text" : "password"}
                        {...passwordForm.register("password_confirm")}
                        placeholder="Confirmez votre mot de passe"
                        className={
                          passwordForm.formState.errors.password_confirm
                            ? "border-red-500"
                            : ""
                        }
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {passwordForm.formState.errors.password_confirm && (
                      <p className="text-sm text-red-500 mt-1">
                        {passwordForm.formState.errors.password_confirm.message}
                      </p>
                    )}
                  </div>

                  {/* Password Requirements */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Exigences du mot de passe :
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Au moins 8 caractères</li>
                      <li>• Au moins une lettre majuscule</li>
                      <li>• Au moins une lettre minuscule</li>
                      <li>• Au moins un chiffre</li>
                    </ul>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep("email")}
                      className="flex-1"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Retour
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={passwordForm.formState.isSubmitting}
                    >
                      {passwordForm.formState.isSubmitting ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Activation...</span>
                        </div>
                      ) : (
                        "Activer mon compte"
                      )}
                    </Button>
                  </div>
                </form>
              </>
            )}

            {/* Success Step */}
            {step === "success" && (
              <div className="text-center py-8 space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 bg-green-100 rounded-full">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Compte activé avec succès !
                  </h3>
                  <p className="text-gray-600">
                    Vous pouvez maintenant vous connecter avec votre email et
                    votre nouveau mot de passe.
                  </p>
                </div>
                <div className="pt-4">
                  <p className="text-sm text-gray-500">
                    Redirection automatique vers la page de connexion...
                  </p>
                </div>
              </div>
            )}

            {/* Links */}
            {step !== "success" && (
              <div className="pt-4 border-t text-center space-y-2">
                <Link
                  href="/login"
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center space-x-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  <span>Retour à la connexion</span>
                </Link>
                <p className="text-xs text-gray-500">
                  Vous avez déjà un mot de passe ?{" "}
                  <Link
                    href="/login"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Connectez-vous ici
                  </Link>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
