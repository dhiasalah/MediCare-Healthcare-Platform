import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Stethoscope,
  Users,
  Clock,
  Shield,
  Heart,
  ArrowRight,
  Check,
  Zap,
  TrendingUp,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Enhanced */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-600 via-blue-500 to-indigo-600 text-white py-32">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div
          className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-blue-400/30 backdrop-blur text-blue-100 rounded-full text-sm font-medium mb-8 border border-blue-300/50">
                ✨ La nouvelle génération de santé numérique
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                Votre Santé,
                <br /> Notre Priorité
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl leading-relaxed">
                MediCare connecte patients et médecins sur une plateforme
                sécurisée et intuitive. Consultez, planifiez et suivez votre
                santé en toute simplicité.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link href="/login">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto px-8 py-6 text-lg bg-white text-blue-600 hover:bg-gray-100 font-semibold shadow-lg"
                  >
                    Commencer <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto px-8 py-6 text-lg text-white bg-blue-500/30 border-white hover:bg-blue-500/50 font-semibold transition-all"
                  >
                    En savoir plus
                  </Button>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-blue-100">
                  <Check className="h-5 w-5 text-green-300" />
                  <span>Données sécurisées et conformes RGPD</span>
                </div>
                <div className="flex items-center gap-3 text-blue-100">
                  <Check className="h-5 w-5 text-green-300" />
                  <span>Plus de 15,000 patients actifs</span>
                </div>
                <div className="flex items-center gap-3 text-blue-100">
                  <Check className="h-5 w-5 text-green-300" />
                  <span>500+ médecins partenaires</span>
                </div>
              </div>
            </div>

            {/* Stats cards - Right side */}
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Users className="h-8 w-8 text-blue-200" />
                  <span className="text-4xl font-bold">15K+</span>
                </div>
                <p className="text-blue-100">Patients actifs</p>
              </div>
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Stethoscope className="h-8 w-8 text-green-300" />
                  <span className="text-4xl font-bold">500+</span>
                </div>
                <p className="text-blue-100">Médecins experts</p>
              </div>
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="h-8 w-8 text-amber-300" />
                  <span className="text-4xl font-bold">4.8★</span>
                </div>
                <p className="text-blue-100">Note moyenne</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section - Enhanced */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Nos Services Principaux
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Une plateforme complète conçue pour transformer votre expérience
              de santé
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service Card 1 */}
            <div className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Stethoscope className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Consultation en ligne
                </h3>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  Consultez vos médecins spécialistes en vidéo, chat ou appel.
                  Secure, rapide et efficace.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-gray-600">
                    <Check className="h-4 w-4 text-green-500" /> Consultations
                    24/7
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <Check className="h-4 w-4 text-green-500" /> Prescriptions
                    numériques
                  </li>
                </ul>
              </div>
            </div>

            {/* Service Card 2 */}
            <div className="group relative bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-100 hover:border-green-300 hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-green-600 text-white rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Prise de Rendez-vous
                </h3>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  Planifiez vos rendez-vous facilement avec notre système
                  intelligent de gestion.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-gray-600">
                    <Check className="h-4 w-4 text-green-500" /> Agenda en temps
                    réel
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <Check className="h-4 w-4 text-green-500" /> Rappels
                    automatiques
                  </li>
                </ul>
              </div>
            </div>

            {/* Service Card 3 */}
            <div className="group relative bg-gradient-to-br from-red-50 to-pink-50 p-8 rounded-2xl border border-red-100 hover:border-red-300 hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-red-600 text-white rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Suivi Médical
                </h3>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  Accédez à votre dossier médical complet et suivez votre santé
                  en temps réel.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-gray-600">
                    <Check className="h-4 w-4 text-green-500" /> Dossier médical
                    numérique
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <Check className="h-4 w-4 text-green-500" /> Historique
                    complet
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
                Pourquoi choisir MediCare ?
              </h2>
              <div className="space-y-6">
                {/* Feature 1 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                      <Shield className="h-6 w-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Sécurité maximale
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Vos données médicales sont protégées par les plus hauts
                      standards de sécurité RGPD et chiffrement de bout en bout.
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-600 text-white">
                      <Users className="h-6 w-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Réseau professionnel
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Accédez à un large réseau de médecins, spécialistes et
                      professionnels de santé qualifiés et vérifiés.
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 text-white">
                      <Heart className="h-6 w-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Suivi personnalisé
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Bénéficiez d&apos;un suivi médical adapté à vos besoins
                      spécifiques avec recommendations personnalisées.
                    </p>
                  </div>
                </div>

                {/* Feature 4 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 text-white">
                      <Zap className="h-6 w-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Disponible 24/7
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Accès instantané à vos données médicales et consultations
                      disponibles à tout moment, où que vous soyez.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Access card */}
            <div>
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 px-8 py-12 text-white">
                  <h3 className="text-3xl font-bold mb-4">Accès Rapide</h3>
                  <p className="text-blue-100 mb-8">
                    Connectez-vous à votre espace personnel ou explorez notre
                    plateforme.
                  </p>
                </div>
                <div className="p-8 space-y-4">
                  <Link href="/login" className="block">
                    <Button className="w-full py-6 text-lg font-semibold bg-blue-600 hover:bg-blue-700">
                      👤 Espace Patient <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/login" className="block">
                    <Button
                      variant="outline"
                      className="w-full py-6 text-lg font-semibold"
                    >
                      👨‍⚕️ Espace Médecin <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 text-center mb-4">
                      Nouveau sur MediCare ?
                    </p>
                    <Link href="/signup">
                      <Button
                        variant="ghost"
                        className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        Créer un compte gratuit
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Ce que nos utilisateurs en pensent
            </h2>
            <p className="text-xl text-gray-600">
              Des milliers de patients et médecins nous font confiance chaque
              jour
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">
                    ★
                  </span>
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                &quot;MediCare a complètement transformé ma façon de gérer ma
                santé. Les consultations en ligne sont pratiques et le personnel
                est très professionnel.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-full"></div>
                <div>
                  <p className="font-semibold text-gray-900">Marie Dupont</p>
                  <p className="text-sm text-gray-600">Patient</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">
                    ★
                  </span>
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                &quot;Excellente plateforme pour gérer mes patients.
                L&apos;interface est intuitive et les outils de suivi sont très
                efficaces.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-600 rounded-full"></div>
                <div>
                  <p className="font-semibold text-gray-900">
                    Dr. Ahmed Benali
                  </p>
                  <p className="text-sm text-gray-600">Médecin</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-8 border border-red-100">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">
                    ★
                  </span>
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                &quot;Plateforme fiable et sécurisée. J&apos;aime pouvoir
                accéder à mes dossiers médicaux en un clic.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-600 rounded-full"></div>
                <div>
                  <p className="font-semibold text-gray-900">Sophie Martin</p>
                  <p className="text-sm text-gray-600">Patient</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action - Enhanced */}
      <section className="relative overflow-hidden py-32 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Prêt à transformer votre santé ?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Rejoignez des milliers de patients et médecins qui font confiance à
            MediCare pour une meilleure gestion de leur santé.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-6 text-lg font-semibold shadow-lg"
              >
                Commencer gratuitement <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/about">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white bg-blue-500/30 hover:bg-blue-500/50 px-10 py-6 text-lg font-semibold transition-all"
              >
                En savoir plus
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
