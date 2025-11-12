# Medical Platform Backend

A comprehensive Django REST Framework backend for a medical healthcare platform.

## Features

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
- **Appointments**: Patients can book appointments with doctors
- **Status Tracking**: Scheduled → Confirmed → In Progress → Completed/Cancelled
- **Rescheduling**: Patients and doctors can reschedule appointments
- **History Tracking**: Full audit trail of appointment changes

### 🏥 Consultation Management

- **Medical Consultations**: Linked to appointments
- **Vital Signs**: Blood pressure, heart rate, temperature, etc.
- **Prescriptions**: Detailed medication management
- **Consultation Notes**: Multiple note types (assessment, plan, follow-up)
- **Patient History**: Complete consultation history per patient

### 🗄️ Patient Records

- Medical history and allergies tracking
- Emergency contact information
- Consultation history and medical records

## API Endpoints

### Authentication (`/api/auth/`)

- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login (returns JWT tokens)
- `POST /api/auth/logout/` - User logout
- `POST /api/auth/refresh/` - Refresh JWT token
- `GET /api/auth/profile/` - Get current user profile
- `PUT /api/auth/profile/` - Update user profile

### Patients (`/api/patients/`)

- `GET /api/patients/api/patients/` - List patients (doctors/admins only)
- `POST /api/patients/api/patients/` - Create patient
- `GET /api/patients/api/patients/{id}/` - Get patient details
- `PUT /api/patients/api/patients/{id}/` - Update patient
- `DELETE /api/patients/api/patients/{id}/` - Delete patient

### Appointments (`/api/appointments/`)

- `GET /api/appointments/api/appointments/` - List appointments
- `POST /api/appointments/api/appointments/` - Create appointment
- `GET /api/appointments/api/appointments/{id}/` - Get appointment details
- `PUT /api/appointments/api/appointments/{id}/` - Update appointment
- `POST /api/appointments/api/appointments/{id}/cancel/` - Cancel appointment
- `POST /api/appointments/api/appointments/{id}/reschedule/` - Reschedule appointment
- `POST /api/appointments/api/appointments/{id}/complete/` - Mark as completed

#### Time Slots

- `GET /api/appointments/api/time-slots/` - List available time slots
- `POST /api/appointments/api/time-slots/` - Create time slot (doctors only)
- `POST /api/appointments/api/time-slots/create_bulk_slots/` - Create multiple slots

#### Statistics & Utilities

- `GET /api/appointments/api/doctor-availability/` - Check doctor availability
- `GET /api/appointments/api/statistics/` - Appointment statistics
- `GET /api/appointments/api/upcoming/` - Upcoming appointments
- `GET /api/appointments/api/today/` - Today's appointments

### Consultations (`/api/consultations/`)

- `GET /api/consultations/api/consultations/` - List consultations
- `POST /api/consultations/api/consultations/` - Create consultation
- `GET /api/consultations/api/consultations/{id}/` - Get consultation details
- `PUT /api/consultations/api/consultations/{id}/` - Update consultation
- `POST /api/consultations/api/consultations/{id}/start_consultation/` - Start consultation
- `POST /api/consultations/api/consultations/{id}/complete_consultation/` - Complete consultation

#### Nested Resources

- `GET /api/consultations/api/consultations/{id}/vital-signs/` - Vital signs for consultation
- `POST /api/consultations/api/consultations/{id}/vital-signs/` - Add vital signs
- `GET /api/consultations/api/consultations/{id}/prescriptions/` - Prescriptions for consultation
- `POST /api/consultations/api/consultations/{id}/prescriptions/` - Add prescription
- `GET /api/consultations/api/consultations/{id}/notes/` - Notes for consultation
- `POST /api/consultations/api/consultations/{id}/notes/` - Add note

## Database Models

### User (Custom)

- Built on Django's AbstractUser
- Additional fields: user_type, phone, date_of_birth, address
- Medical fields: medical_license_number, specialization
- Patient fields: medical_history, allergies, emergency_contact

### Appointment System

- **TimeSlot**: Doctor availability slots
- **Appointment**: Patient bookings with doctors
- **AppointmentHistory**: Audit trail of changes

### Consultation System

- **Consultation**: Medical consultation records
- **VitalSigns**: Detailed vital measurements
- **Prescription**: Medication prescriptions
- **ConsultationNote**: Various types of medical notes

## Setup Instructions

### 1. Environment Setup

```bash
cd backend
python -m venv .venv
.venv\\Scripts\\activate  # Windows
pip install -r requirements.txt
```

### 2. Database Setup

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### 3. Run Development Server

```bash
python manage.py runserver 8000
```

### 4. Access Points

- **API Root**: http://127.0.0.1:8000/
- **Admin Interface**: http://127.0.0.1:8000/admin/
- **API Documentation**: Available through Django REST Framework browsable API

## Dependencies

```
django==4.2.7
djangorestframework==3.14.0
djangorestframework-simplejwt==5.3.0
django-cors-headers==4.3.1
django-filter==23.4
python-decouple==3.8
psycopg2-binary==2.9.8
pillow==10.1.0
setuptools
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different permissions for doctors, patients, and admins
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Input Validation**: Comprehensive data validation through serializers
- **Audit Trails**: Complete history tracking for appointments and consultations

## Admin Interface

The Django admin interface provides:

- **User Management**: Create and manage doctors, patients, and admins
- **Appointment Management**: View and manage all appointments
- **Consultation Records**: Access to all medical consultations
- **System Statistics**: Overview of platform usage
- **Audit Trails**: View complete history of changes

## Default Admin Credentials

- **Username**: admin
- **Password**: admin123
- **Email**: admin@example.com

## API Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "status": "success",
  "data": {...},
  "message": "Operation completed successfully"
}
```

### Error Response

```json
{
  "status": "error",
  "errors": {...},
  "message": "Error message"
}
```

## Status Codes

- `200 OK` - Successful GET, PUT, PATCH
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Validation errors
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Development Notes

### Current Status: ✅ Complete

- ✅ Authentication system with JWT
- ✅ User management (Doctor/Patient/Admin roles)
- ✅ Appointment booking and management
- ✅ Time slot creation and availability
- ✅ Medical consultation system
- ✅ Vital signs tracking
- ✅ Prescription management
- ✅ Consultation notes
- ✅ Admin interface
- ✅ API documentation
- ✅ Database migrations
- ✅ Permissions and security

### Future Enhancements (TODO)

- [ ] Medical Records file upload system
- [ ] Statistics and reporting dashboard
- [ ] Email notifications for appointments
- [ ] SMS reminders
- [ ] Advanced search and filtering
- [ ] Export functionality (PDF reports)
- [ ] Integration with external medical systems

## Testing the API

1. **Register a Doctor**:

```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "doctor1",
    "email": "doctor@example.com",
    "password": "securepassword",
    "first_name": "Dr. John",
    "last_name": "Smith",
    "user_type": "doctor",
    "medical_license_number": "MD123456",
    "specialization": "Cardiology"
  }'
```

2. **Register a Patient**:

```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "patient1",
    "email": "patient@example.com",
    "password": "securepassword",
    "first_name": "Jane",
    "last_name": "Doe",
    "user_type": "patient"
  }'
```

3. **Login and Get Token**:

```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "doctor1",
    "password": "securepassword"
  }'
```

4. **Create Time Slot** (as doctor):

```bash
curl -X POST http://127.0.0.1:8000/api/appointments/api/time-slots/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "date": "2025-10-07",
    "start_time": "09:00:00",
    "end_time": "09:30:00"
  }'
```

This backend provides a solid foundation for a medical platform with comprehensive features for appointment management, medical consultations, and patient care coordination.
