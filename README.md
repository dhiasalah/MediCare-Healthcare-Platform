# MediCare - Plateforme de Santé Numérique Intelligente 🏥✨

Une plateforme de santé complète et moderne qui révolutionne la relation patient-médecin grâce à l'Intelligence Artificielle. Développée avec Next.js 15, Django REST Framework, et des modèles de Machine Learning avancés.

## 🚀 Fonctionnalités Principales

### 🧠 Intelligence Artificielle & Aide au Diagnostic
- **Prédiction des Maladies Cardiaques** : Analyse des constantes vitales (âge, tension, cholestérol, etc.) via un modèle **Scikit-learn** pour évaluer les risques cardiaques avec un score de confiance.
- **Segmentation de Tumeurs Cérébrales** : Analyse d'images IRM par Deep Learning (**TensorFlow/Keras**) pour identifier et segmenter automatiquement les zones tumorales.

### 👤 Pour les Patients
- **Dossier Médical Sécurisé** : Accès centralisé à l'historique médical.
- **Prise de Rendez-vous Intelligente** : Système de réservation avec gestion des créneaux.
- **Suivi de Santé** : Monitoring des indicateurs vitaux et historique des prédictions IA.
- **Gestion des Médicaments** : Ordonnances numériques et rappels.

### 👨‍⚕️ Pour les Médecins
- **Tableau de Bord Pro** : Vue d'ensemble de l'activité et des patients.
- **Gestion des Consultations** : Outils de suivi, notes de consultation et prescriptions.
- **Aide à la Décision** : Accès instantané aux résultats des analyses IA (risques cardiaques, segmentation IRM).
- **Statistiques** : Suivi de l'activité du cabinet.

## 🛠️ Stack Technique

### Frontend
- **Framework** : Next.js 15 (App Router)
- **Langage** : TypeScript
- **Style** : Tailwind CSS & Shadcn UI (Design Premium)
- **État** : Zustand
- **HTTP** : Axios

### Backend
- **Framework** : Django & Django REST Framework
- **Authentification** : JWT (JSON Web Tokens)
- **Base de Données** : SQLite (Dev) / PostgreSQL (Prod)
- **API** : RESTful Architecture

### IA & Data Science
- **Machine Learning** : Scikit-learn (Classification)
- **Deep Learning** : TensorFlow / Keras (Segmentation d'images)
- **Traitement de Données** : Pandas, NumPy
- **Traitement d'Images** : Pillow, OpenCV

## 📦 Installation et Démarrage

### Prérequis
- Node.js (v18+)
- Python (v3.9+)

### 1. Installation du Backend (Django)

```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt

# Migrations et création du superuser
python manage.py migrate
python manage.py createsuperuser

# Lancer le serveur
python manage.py runserver
```

Le backend sera accessible sur `http://localhost:8000`.

### 2. Installation du Frontend (Next.js)

```bash
# Dans un nouveau terminal, à la racine du projet
npm install

# Lancer le serveur de développement
npm run dev
```

L'application sera accessible sur `http://localhost:3000`.

## 🏗️ Structure du Projet

```
.
├── backend/                 # API Django
│   ├── appointments/       # Gestion des rendez-vous
│   ├── health_predictions/ # IA (Modèles & Vues)
│   ├── models/             # Fichiers modèles (.pkl, .keras)
│   ├── patients/           # Gestion des patients
│   └── ...
├── src/                    # Frontend Next.js
│   ├── app/               # Pages (App Router)
│   ├── components/        # Composants Réutilisables
│   ├── lib/               # Configuration API
│   └── store/             # Gestion d'état (Zustand)
└── ...
```

## 🔒 Sécurité
- Authentification robuste via JWT.
- Protection des routes (Route Guards) côté frontend.
- Permissions granulaires (IsAuthenticated, IsDoctor, etc.) côté backend.
- Validation des données avec Zod (Front) et Serializers (Back).

## 🤝 Contribution
Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une Pull Request.

## 📄 Licence
Ce projet est sous licence MIT.
