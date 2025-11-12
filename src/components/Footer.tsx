export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">MediCare</h3>
            <p className="text-gray-300 mb-4">
              Votre plateforme de santé numérique pour une meilleure
              communication entre patients et professionnels de santé.
            </p>
          </div>

          <div>
            <h4 className="text-md font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-300">
              <li>Consultation en ligne</li>
              <li>Gestion des rendez-vous</li>
              <li>Suivi médical</li>
              <li>Télémédecine</li>
            </ul>
          </div>

          <div>
            <h4 className="text-md font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-300">
              <li>Téléphone: +33 1 23 45 67 89</li>
              <li>Email: contact@medicare.fr</li>
              <li>Urgences: 15</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700">
          <p className="text-center text-gray-300">
            © 2024 MediCare. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
