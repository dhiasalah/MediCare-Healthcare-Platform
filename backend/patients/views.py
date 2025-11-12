from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q, Count
from .models import Patient, PatientSpecialist, PatientMedicalRecord
from .serializers import (
    PatientSerializer, 
    PatientCreateSerializer, 
    PatientListSerializer,
    PatientSpecialistSerializer,
    AssignSpecialistSerializer,
    PatientMedicalRecordSerializer,
    PatientMedicalRecordListSerializer
)
from accounts.models import User
from accounts.serializers import UserSerializer

class PatientListCreateView(generics.ListCreateAPIView):
    """
    List all patients for the authenticated doctor or create a new patient
    """
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['first_name', 'last_name', 'phone', 'email']
    filterset_fields = ['gender', 'is_active']
    ordering_fields = ['created_at', 'last_name', 'date_of_birth']
    ordering = ['-created_at']
    
    def get_queryset(self):
        # Only return patients for the authenticated doctor
        return Patient.objects.filter(doctor=self.request.user, is_active=True)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PatientCreateSerializer
        return PatientListSerializer

class PatientDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a patient
    """
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Only return patients for the authenticated doctor
        return Patient.objects.filter(doctor=self.request.user)
    
    def destroy(self, request, *args, **kwargs):
        # Soft delete - set is_active to False instead of deleting
        patient = self.get_object()
        patient.is_active = False
        patient.save()
        return Response({'message': 'Patient supprimé avec succès'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def patient_search(request):
    """
    Advanced search for patients
    """
    query = request.GET.get('q', '')
    if not query:
        return Response({'error': 'Paramètre de recherche requis'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Search in multiple fields
    patients = Patient.objects.filter(
        Q(doctor=request.user) & Q(is_active=True) & (
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query) |
            Q(phone__icontains=query) |
            Q(email__icontains=query)
        )
    )[:10]  # Limit to 10 results
    
    serializer = PatientListSerializer(patients, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def patient_statistics(request):
    """
    Get statistics about patients
    """
    total_patients = Patient.objects.filter(doctor=request.user, is_active=True).count()
    male_patients = Patient.objects.filter(doctor=request.user, is_active=True, gender='M').count()
    female_patients = Patient.objects.filter(doctor=request.user, is_active=True, gender='F').count()
    
    # Recent patients (last 30 days)
    from datetime import date, timedelta
    thirty_days_ago = date.today() - timedelta(days=30)
    recent_patients = Patient.objects.filter(
        doctor=request.user, 
        is_active=True,
        created_at__gte=thirty_days_ago
    ).count()
    
    return Response({
        'total_patients': total_patients,
        'male_patients': male_patients,
        'female_patients': female_patients,
        'recent_patients': recent_patients,
        'gender_distribution': {
            'male_percentage': (male_patients / total_patients * 100) if total_patients > 0 else 0,
            'female_percentage': (female_patients / total_patients * 100) if total_patients > 0 else 0,
        }
    })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_my_patient_record(request):
    """
    Get the patient record for the authenticated user
    """
    if request.user.user_type != 'patient':
        return Response(
            {'error': 'Seuls les patients peuvent accéder à cette ressource'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        patient = Patient.objects.get(email=request.user.email, is_active=True)
        serializer = PatientSerializer(patient)
        return Response(serializer.data)
    except Patient.DoesNotExist:
        return Response(
            {'error': 'Aucun dossier patient trouvé', 'has_patient_record': False},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def assign_doctor(request):
    """
    Assign or update doctor for the authenticated patient
    """
    if request.user.user_type != 'patient':
        return Response(
            {'error': 'Seuls les patients peuvent assigner un médecin'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    doctor_id = request.data.get('doctor_id')
    if not doctor_id:
        return Response(
            {'error': 'L\'ID du médecin est requis'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if doctor exists and is active
    try:
        doctor = User.objects.get(id=doctor_id, user_type='doctor', is_active=True)
    except User.DoesNotExist:
        return Response(
            {'error': 'Médecin non trouvé ou inactif'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check if doctor has space (max 4 patients)
    patient_count = Patient.objects.filter(doctor=doctor, is_active=True).count()
    if patient_count >= 4:
        return Response(
            {'error': 'Ce médecin a atteint sa capacité maximale de patients'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Get or create patient record
    try:
        patient = Patient.objects.get(email=request.user.email, is_active=True)
        # Update doctor
        old_doctor = patient.doctor
        patient.doctor = doctor
        patient.save()
        message = f'Médecin changé de Dr. {old_doctor.full_name} à Dr. {doctor.full_name}'
    except Patient.DoesNotExist:
        # Create new patient record
        patient = Patient.objects.create(
            first_name=request.user.first_name,
            last_name=request.user.last_name,
            email=request.user.email,
            phone=request.user.phone or '',
            date_of_birth=request.user.date_of_birth or '2000-01-01',
            gender='O',  # Default
            address=request.user.address or '',
            doctor=doctor,
            medical_history=request.user.medical_history or '',
            allergies=request.user.allergies or '',
            emergency_contact_name=request.user.emergency_contact_name or '',
            emergency_contact_phone=request.user.emergency_contact_phone or '',
            emergency_contact_relation=request.user.emergency_contact_relation or 'Non spécifié'
        )
        message = f'Médecin Dr. {doctor.full_name} assigné avec succès'
    
    serializer = PatientSerializer(patient)
    return Response({
        'message': message,
        'patient': serializer.data
    }, status=status.HTTP_200_OK)


# Specialist Management Views

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def assign_specialist(request):
    """
    Assign a specialist to a patient. Only the primary doctor can do this.
    """
    if request.user.user_type != 'doctor':
        return Response(
            {'error': 'Seuls les médecins peuvent assigner des spécialistes'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    serializer = AssignSpecialistSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        specialist_assignment = serializer.save()
        response_serializer = PatientSpecialistSerializer(specialist_assignment)
        return Response({
            'message': 'Spécialiste assigné avec succès',
            'data': response_serializer.data
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def patient_specialists(request, patient_id):
    """
    Get all specialists assigned to a specific patient.
    Only the primary doctor or the patient themselves can access this.
    """
    try:
        patient = Patient.objects.get(id=patient_id, is_active=True)
    except Patient.DoesNotExist:
        return Response(
            {'error': 'Patient non trouvé'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check permissions
    if request.user.user_type == 'doctor':
        if patient.primary_doctor != request.user and patient.doctor != request.user:
            # Check if the current user is one of the specialists
            if not PatientSpecialist.objects.filter(patient=patient, specialist=request.user).exists():
                return Response(
                    {'error': 'Vous n\'avez pas accès aux informations de ce patient'},
                    status=status.HTTP_403_FORBIDDEN
                )
    elif request.user.user_type == 'patient':
        if patient.email != request.user.email:
            return Response(
                {'error': 'Vous ne pouvez voir que vos propres spécialistes'},
                status=status.HTTP_403_FORBIDDEN
            )
    else:
        return Response(
            {'error': 'Accès non autorisé'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    specialists = PatientSpecialist.objects.filter(patient=patient)
    serializer = PatientSpecialistSerializer(specialists, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_specialists(request):
    """
    Get all specialists assigned to the authenticated patient.
    """
    if request.user.user_type != 'patient':
        return Response(
            {'error': 'Seuls les patients peuvent accéder à cette ressource'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        patient = Patient.objects.get(email=request.user.email, is_active=True)
        specialists = PatientSpecialist.objects.filter(patient=patient)
        serializer = PatientSpecialistSerializer(specialists, many=True)
        return Response(serializer.data)
    except Patient.DoesNotExist:
        return Response([], status=status.HTTP_200_OK)


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_specialist_status(request, specialist_id):
    """
    Update the status of a specialist assignment.
    Only the primary doctor can do this.
    """
    if request.user.user_type != 'doctor':
        return Response(
            {'error': 'Seuls les médecins peuvent modifier le statut'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        specialist_assignment = PatientSpecialist.objects.get(id=specialist_id)
    except PatientSpecialist.DoesNotExist:
        return Response(
            {'error': 'Assignation de spécialiste non trouvée'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check if the current user is the primary doctor
    patient = specialist_assignment.patient
    if patient.primary_doctor != request.user and patient.doctor != request.user:
        return Response(
            {'error': 'Seul le médecin traitant peut modifier le statut'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    new_status = request.data.get('status')
    if new_status not in ['active', 'completed', 'cancelled']:
        return Response(
            {'error': 'Statut invalide. Utilisez: active, completed, ou cancelled'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    specialist_assignment.status = new_status
    specialist_assignment.save()
    
    serializer = PatientSpecialistSerializer(specialist_assignment)
    return Response({
        'message': 'Statut mis à jour avec succès',
        'data': serializer.data
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def available_specialists(request):
    """
    Get all doctors with specializations who can be assigned as specialists.
    Excludes the current doctor (primary doctor should not assign themselves).
    """
    if request.user.user_type != 'doctor':
        return Response(
            {'error': 'Seuls les médecins peuvent accéder à cette ressource'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    specialization = request.GET.get('specialization', None)
    
    # Get all doctors with specializations, excluding the current user
    doctors = User.objects.filter(
        user_type='doctor',
        is_active=True,
        specialization__isnull=False
    ).exclude(id=request.user.id).exclude(specialization='')
    
    # Filter by specialization if provided
    if specialization:
        doctors = doctors.filter(specialization=specialization)
    
    serializer = UserSerializer(doctors, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_my_patient_record(request):
    """
    Get patient record for the current authenticated user.
    This is used by patient users to get their own patient record.
    """
    try:
        # Try to find patient by email
        patient = Patient.objects.get(email=request.user.email)
        serializer = PatientSerializer(patient)
        return Response(serializer.data)
    except Patient.DoesNotExist:
        return Response(
            {"error": "Aucun dossier patient trouvé pour cet utilisateur."},
            status=status.HTTP_404_NOT_FOUND
        )
    except Patient.MultipleObjectsReturned:
        # If multiple patients found, get the first one
        patient = Patient.objects.filter(email=request.user.email).first()
        serializer = PatientSerializer(patient)
        return Response(serializer.data)


# Medical Records Views

class PatientMedicalRecordListCreateView(generics.ListCreateAPIView):
    """
    List medical records for a patient or create a new medical record.
    Doctors can create/update records for their patients.
    Patients can view their own records.
    """
    serializer_class = PatientMedicalRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['patient', 'doctor']
    ordering_fields = ['recorded_at', 'created_at']
    ordering = ['-recorded_at']
    
    def get_queryset(self):
        user = self.request.user
        
        if user.user_type == 'doctor':
            # Doctors can only see records for their own patients
            return PatientMedicalRecord.objects.filter(
                patient__in=Patient.objects.filter(
                    Q(doctor=user) | Q(primary_doctor=user)
                )
            )
        elif user.user_type == 'patient':
            # Patients can only see their own records
            try:
                patient = Patient.objects.get(email=user.email)
                return PatientMedicalRecord.objects.filter(patient=patient)
            except Patient.DoesNotExist:
                return PatientMedicalRecord.objects.none()
        else:
            return PatientMedicalRecord.objects.none()
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PatientMedicalRecordSerializer
        return PatientMedicalRecordListSerializer


class PatientMedicalRecordDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a medical record.
    Only the doctor who created it can update it.
    """
    serializer_class = PatientMedicalRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.user_type == 'doctor':
            # Doctors can only see records for their own patients
            return PatientMedicalRecord.objects.filter(
                patient__in=Patient.objects.filter(
                    Q(doctor=user) | Q(primary_doctor=user)
                )
            )
        elif user.user_type == 'patient':
            # Patients can only see their own records
            try:
                patient = Patient.objects.get(email=user.email)
                return PatientMedicalRecord.objects.filter(patient=patient)
            except Patient.DoesNotExist:
                return PatientMedicalRecord.objects.none()
        else:
            return PatientMedicalRecord.objects.none()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def patient_latest_medical_record(request, patient_id):
    """
    Get the latest medical record for a specific patient.
    Used by the patient UI to fetch the most recent medical data.
    """
    try:
        patient = Patient.objects.get(id=patient_id)
    except Patient.DoesNotExist:
        return Response(
            {'error': 'Patient non trouvé'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check permissions
    if request.user.user_type == 'patient':
        if patient.email != request.user.email:
            return Response(
                {'error': 'Vous n\'avez accès qu\'à vos propres dossiers'},
                status=status.HTTP_403_FORBIDDEN
            )
    elif request.user.user_type == 'doctor':
        if patient.doctor != request.user and patient.primary_doctor != request.user:
            return Response(
                {'error': 'Vous n\'êtes pas autorisé à voir ce dossier'},
                status=status.HTTP_403_FORBIDDEN
            )
    else:
        return Response(
            {'error': 'Accès non autorisé'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get latest medical record
    medical_record = PatientMedicalRecord.objects.filter(patient=patient).first()
    
    if not medical_record:
        # Return empty/null response for first-time scenario
        # This allows frontend to proceed with creating new record
        return Response(None, status=status.HTTP_200_OK)
    
    serializer = PatientMedicalRecordSerializer(medical_record)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_medical_records(request):
    """
    Get all medical records for the authenticated patient.
    """
    if request.user.user_type != 'patient':
        return Response(
            {'error': 'Seuls les patients peuvent accéder à cette ressource'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        patient = Patient.objects.get(email=request.user.email)
        records = PatientMedicalRecord.objects.filter(patient=patient).order_by('-recorded_at')
        serializer = PatientMedicalRecordListSerializer(records, many=True)
        return Response(serializer.data)
    except Patient.DoesNotExist:
        return Response([], status=status.HTTP_200_OK)
