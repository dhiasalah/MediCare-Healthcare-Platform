# Medical Platform Backend

A comprehensive Django REST Framework backend for a medical healthcare platform, featuring advanced AI integration for health predictions.

## Features

### 🧠 AI & Health Predictions
- **Heart Disease Prediction**: ML model integration to assess heart disease risk based on patient vitals.
- **Brain Tumor Segmentation**: Deep Learning model to analyze MRI images and segment tumors.
- **Activity Tracking**: Logs and statistics for doctor's usage of AI tools.

### 🔐 Authentication System
- Custom User model with role-based access (Doctor, Patient, Admin)
- JWT token authentication
- Role-based permissions and access control

### 👥 User Management
- **Doctors**: Medical license, specialization, time slot management
- **Patients**: Medical history, allergies, emergency contacts
- **Admins**: Full system access and management

### 📅 Appointment System
- **Time Slots**: Doctors can create available time slots
- **Appointments**: Patients can book appointments
- **Status Tracking**: Scheduled → Confirmed → In Progress → Completed/Cancelled
- **Rescheduling**: Full rescheduling capabilities

### 🏥 Consultation Management
- **Medical Consultations**: Linked to appointments
- **Vital Signs**: Blood pressure, heart rate, temperature, etc.
- **Prescriptions**: Detailed medication management
- **Consultation Notes**: Multiple note types

## API Endpoints

### Health Predictions (`/api/health-predictions/`)
- `POST /api/health-predictions/predictions/predict/` - Heart disease prediction
- `GET /api/health-predictions/predictions/my_predictions/` - Patient's prediction history
- `POST /api/health-predictions/segmentation/segment/` - Brain tumor MRI segmentation
- `GET /api/health-predictions/activities/stats/` - Doctor's activity statistics

### Authentication (`/api/auth/`)
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login (returns JWT tokens)
- `GET /api/auth/profile/` - Get current user profile

### Patients (`/api/patients/`)
- CRUD operations for patient management

### Appointments (`/api/appointments/`)
- CRUD operations for appointments and time slots

### Consultations (`/api/consultations/`)
- Management of consultations, vitals, prescriptions, and notes

## Setup Instructions

### 1. Environment Setup

```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

### 2. AI Models Setup
Ensure the following models are placed in `backend/models/`:
- `heart_dicease_2.pkl` (Scikit-learn model)
- `model.keras` (TensorFlow model)

### 3. Database Setup

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### 4. Run Server

```bash
python manage.py runserver
```

## Dependencies

- **Core**: Django, Django REST Framework
- **Auth**: SimpleJWT
- **AI/ML**: TensorFlow, Scikit-learn, Pandas, NumPy
- **Image Processing**: Pillow, OpenCV (via dependencies)
- **Utils**: Python-decouple, Django-filter

## Security

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Strict permission classes
- **Input Validation**: Serializers for all data inputs
