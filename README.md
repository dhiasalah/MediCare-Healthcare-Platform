# MediCare - Plateforme de Santé Numérique

Une plateforme de santé moderne développée avec Next.js, TypeScript, Shadcn UI, Axios et Zustand pour connecter patients et professionnels de santé.

## 🩺 Fonctionnalités

### Pour les Patients

- **Espace personnel sécurisé** : Accès à votre dossier médical
- **Gestion des rendez-vous** : Prise et suivi de vos consultations
- **Suivi médical** : Monitoring des indicateurs de santé
- **Médicaments** : Gestion et rappels de prise
- **Téléconsultation** : Consultations à distance

### Pour les Médecins

- **Tableau de bord** : Vue d'ensemble de l'activité
- **Gestion des patients** : Accès aux dossiers médicaux
- **Planning** : Organisation des consultations
- **Prescriptions** : Gestion des ordonnances
- **Statistiques** : Suivi de l'activité médicale

## 🚀 Technologies utilisées

- **Next.js 15** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utilitaire
- **Shadcn UI** - Composants UI modernes
- **Zustand** - Gestion d'état légère
- **Axios** - Client HTTP
- **Lucide React** - Icônes modernes

## 🛠️ Installation et démarrage

1. **Installer les dépendances** :

```bash
npm install
```

2. **Lancer le serveur de développement** :

```bash
npm run dev
```

3. **Ouvrir l'application** :
   Visitez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 👥 Comptes de démonstration

### Patient

- **Email** : `patient@demo.com`
- **Mot de passe** : `demo123`

### Médecin

- **Email** : `medecin@demo.com`
- **Mot de passe** : `demo123`

## 📱 Pages disponibles

- **/** - Page d'accueil avec présentation des services
- **/login** - Connexion pour patients et médecins
- **/espace-patient** - Dashboard patient (authentification requise)
- **/espace-medecin** - Dashboard médecin (authentification requise)

## 🔧 Scripts disponibles

```bash
npm run dev          # Démarrage en développement
npm run build        # Build de production
npm run start        # Démarrage en production
npm run lint         # Vérification du code
```

## 🏗️ Structure du projet

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── login/             # Page de connexion
│   ├── espace-patient/    # Dashboard patient
│   ├── espace-medecin/    # Dashboard médecin
│   └── page.tsx           # Page d'accueil
├── components/            # Composants React
│   ├── ui/               # Composants Shadcn UI
│   ├── Navbar.tsx        # Navigation principale
│   └── Footer.tsx        # Pied de page
├── store/                # Stores Zustand
│   └── auth.ts           # Gestion authentification
└── lib/                  # Utilitaires
    ├── api.ts            # Configuration Axios
    └── utils.ts          # Fonctions utilitaires
```

## 🔒 Authentification

L'authentification est gérée par Zustand avec des comptes de démonstration. En production, cela sera remplacé par une véritable API backend.

## 🎨 Interface utilisateur

L'interface utilise Shadcn UI avec Tailwind CSS pour une expérience moderne et responsive. Les composants sont optimisés pour une utilisation sur desktop et mobile.

## 📋 Prochaines étapes

- [ ] Intégration API backend
- [ ] Authentification JWT réelle
- [ ] Base de données patients/médecins
- [ ] Système de notifications
- [ ] Paiements en ligne
- [ ] Téléconsultation vidéo

## 🤝 Contribution

Ce projet est en développement actif. Les contributions sont les bienvenues !

## 📄 Licence

Ce projet est sous licence MIT.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
