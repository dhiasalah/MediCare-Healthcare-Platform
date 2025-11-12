from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Q, Avg, Count
from datetime import datetime, timedelta

from .models import Consultation, VitalSigns, Prescription, ConsultationNote
from .serializers import (
    ConsultationSerializer, ConsultationCreateSerializer, ConsultationUpdateSerializer,
    ConsultationSummarySerializer, VitalSignsSerializer, PrescriptionSerializer,
    ConsultationNoteSerializer
)
from appointments.models import Appointment
from appointments.permissions import IsPatientOrDoctor

User = get_user_model()

class ConsultationViewSet(ModelViewSet):
    """ViewSet for managing consultations"""
    queryset = Consultation.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsPatientOrDoctor]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ConsultationCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ConsultationUpdateSerializer
        elif self.action == 'list':
            return ConsultationSummarySerializer
        return ConsultationSerializer
    
    def get_queryset(self):
        user = self.request.user
        queryset = Consultation.objects.select_related(
            'appointment__patient', 'appointment__doctor', 'appointment__time_slot'
        ).prefetch_related('detailed_vitals', 'detailed_prescriptions', 'notes')
        
        # Filter based on user type
        if user.user_type == 'patient':
            queryset = queryset.filter(appointment__patient=user)
        elif user.user_type == 'doctor':
            queryset = queryset.filter(appointment__doctor=user)
        # Admins see all consultations
        
        # Additional filters
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        date_filter = self.request.query_params.get('date', None)
        if date_filter:
            queryset = queryset.filter(appointment__time_slot__date=date_filter)
        
        patient_id = self.request.query_params.get('patient_id', None)
        if patient_id and user.user_type in ['doctor', 'admin']:
            queryset = queryset.filter(appointment__patient_id=patient_id)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        consultation = serializer.save()
        
        # Update appointment status to in_progress
        appointment = consultation.appointment
        appointment.status = 'in_progress'
        appointment.save()
    
    @action(detail=True, methods=['post'])
    def start_consultation(self, request, pk=None):
        """Start a consultation (set start time)"""
        consultation = self.get_object()
        
        if request.user != consultation.doctor:
            return Response(
                {"error": "Only the assigned doctor can start consultations."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if consultation.status != 'scheduled':
            return Response(
                {"error": "Consultation is not in scheduled status."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        consultation.status = 'in_progress'
        consultation.start_time = timezone.now()
        consultation.save()
        
        # Update appointment status
        consultation.appointment.status = 'in_progress'
        consultation.appointment.save()
        
        serializer = ConsultationSerializer(consultation)
        return Response({
            "message": "Consultation started successfully.",
            "consultation": serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def complete_consultation(self, request, pk=None):
        """Complete a consultation"""
        consultation = self.get_object()
        
        if request.user != consultation.doctor:
            return Response(
                {"error": "Only the assigned doctor can complete consultations."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if consultation.status != 'in_progress':
            return Response(
                {"error": "Consultation is not in progress."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update consultation
        consultation.status = 'completed'
        consultation.end_time = timezone.now()
        
        # Get additional data from request
        consultation.assessment = request.data.get('assessment', consultation.assessment)
        consultation.diagnosis = request.data.get('diagnosis', consultation.diagnosis)
        consultation.treatment_plan = request.data.get('treatment_plan', consultation.treatment_plan)
        consultation.follow_up_instructions = request.data.get('follow_up_instructions', consultation.follow_up_instructions)
        consultation.next_appointment_recommended = request.data.get('next_appointment_recommended', False)
        consultation.follow_up_date = request.data.get('follow_up_date', consultation.follow_up_date)
        consultation.doctor_notes = request.data.get('doctor_notes', consultation.doctor_notes)
        
        consultation.save()
        
        # Update appointment status
        consultation.appointment.status = 'completed'
        consultation.appointment.save()
        
        serializer = ConsultationSerializer(consultation)
        return Response({
            "message": "Consultation completed successfully.",
            "consultation": serializer.data
        })
    
    @action(detail=True, methods=['get'])
    def patient_history(self, request, pk=None):
        """Get consultation history for the patient in this consultation"""
        consultation = self.get_object()
        patient = consultation.patient
        
        # Get all consultations for this patient
        history = Consultation.objects.filter(
            appointment__patient=patient
        ).exclude(id=consultation.id).order_by('-created_at')
        
        serializer = ConsultationSummarySerializer(history, many=True)
        return Response({
            "patient": {
                "id": patient.id,
                "name": patient.get_full_name(),
                "date_of_birth": patient.date_of_birth,
                "medical_history": patient.medical_history,
                "allergies": patient.allergies
            },
            "consultation_history": serializer.data
        })

class VitalSignsViewSet(ModelViewSet):
    """ViewSet for managing vital signs"""
    serializer_class = VitalSignsSerializer
    permission_classes = [permissions.IsAuthenticated, IsPatientOrDoctor]
    
    def get_queryset(self):
        consultation_id = self.kwargs.get('consultation_pk')
        if consultation_id:
            consultation = get_object_or_404(Consultation, id=consultation_id)
            
            # Check permissions
            user = self.request.user
            if (user.user_type == 'patient' and consultation.patient != user) or \
               (user.user_type == 'doctor' and consultation.doctor != user):
                return VitalSigns.objects.none()
            
            return VitalSigns.objects.filter(consultation=consultation)
        
        return VitalSigns.objects.none()
    
    def perform_create(self, serializer):
        consultation_id = self.kwargs.get('consultation_pk')
        consultation = get_object_or_404(Consultation, id=consultation_id)
        serializer.save(consultation=consultation, recorded_by=self.request.user)

class PrescriptionViewSet(ModelViewSet):
    """ViewSet for managing prescriptions"""
    serializer_class = PrescriptionSerializer
    permission_classes = [permissions.IsAuthenticated, IsPatientOrDoctor]
    
    def get_queryset(self):
        consultation_id = self.kwargs.get('consultation_pk')
        if consultation_id:
            consultation = get_object_or_404(Consultation, id=consultation_id)
            
            # Check permissions
            user = self.request.user
            if (user.user_type == 'patient' and consultation.patient != user) or \
               (user.user_type == 'doctor' and consultation.doctor != user):
                return Prescription.objects.none()
            
            return Prescription.objects.filter(consultation=consultation)
        
        return Prescription.objects.none()
    
    def perform_create(self, serializer):
        consultation_id = self.kwargs.get('consultation_pk')
        consultation = get_object_or_404(Consultation, id=consultation_id)
        
        # Only doctors can create prescriptions
        if self.request.user.user_type != 'doctor':
            raise permissions.PermissionDenied("Only doctors can create prescriptions.")
        
        serializer.save(consultation=consultation)

class ConsultationNoteViewSet(ModelViewSet):
    """ViewSet for managing consultation notes"""
    serializer_class = ConsultationNoteSerializer
    permission_classes = [permissions.IsAuthenticated, IsPatientOrDoctor]
    
    def get_queryset(self):
        consultation_id = self.kwargs.get('consultation_pk')
        if consultation_id:
            consultation = get_object_or_404(Consultation, id=consultation_id)
            
            # Check permissions
            user = self.request.user
            if (user.user_type == 'patient' and consultation.patient != user) or \
               (user.user_type == 'doctor' and consultation.doctor != user):
                return ConsultationNote.objects.none()
            
            return ConsultationNote.objects.filter(consultation=consultation)
        
        return ConsultationNote.objects.none()
    
    def perform_create(self, serializer):
        consultation_id = self.kwargs.get('consultation_pk')
        consultation = get_object_or_404(Consultation, id=consultation_id)
        serializer.save(consultation=consultation, created_by=self.request.user)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def consultation_statistics(request):
    """Get consultation statistics for dashboard"""
    user = request.user
    
    # Base queryset based on user type
    if user.user_type == 'patient':
        queryset = Consultation.objects.filter(appointment__patient=user)
    elif user.user_type == 'doctor':
        queryset = Consultation.objects.filter(appointment__doctor=user)
    else:  # admin
        queryset = Consultation.objects.all()
    
    today = timezone.now().date()
    this_month_start = today.replace(day=1)
    
    stats = {
        'total_consultations': queryset.count(),
        'completed_consultations': queryset.filter(status='completed').count(),
        'in_progress_consultations': queryset.filter(status='in_progress').count(),
        'scheduled_consultations': queryset.filter(status='scheduled').count(),
        'today_consultations': queryset.filter(
            appointment__time_slot__date=today
        ).count(),
        'this_month_consultations': queryset.filter(
            appointment__time_slot__date__gte=this_month_start
        ).count(),
    }
    
    # Average consultation duration (for completed consultations)
    completed_consultations = queryset.filter(
        status='completed',
        start_time__isnull=False,
        end_time__isnull=False
    )
    
    if completed_consultations.exists():
        avg_duration = completed_consultations.aggregate(
            avg_duration=Avg('end_time') - Avg('start_time')
        )['avg_duration']
        if avg_duration:
            stats['average_duration_minutes'] = int(avg_duration.total_seconds() / 60)
        else:
            stats['average_duration_minutes'] = 0
    else:
        stats['average_duration_minutes'] = 0
    
    # Common diagnoses (for doctors and admins)
    if user.user_type in ['doctor', 'admin']:
        common_diagnoses = queryset.filter(
            diagnosis__isnull=False
        ).exclude(diagnosis='').values('diagnosis').annotate(
            count=Count('diagnosis')
        ).order_by('-count')[:5]
        
        stats['common_diagnoses'] = list(common_diagnoses)
    else:
        stats['common_diagnoses'] = []
    
    return Response(stats)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def patient_consultations(request, patient_id):
    """Get all consultations for a specific patient"""
    user = request.user
    
    # Check permissions
    if user.user_type == 'patient' and user.id != int(patient_id):
        return Response(
            {"error": "You can only view your own consultations."},
            status=status.HTTP_403_FORBIDDEN
        )
    elif user.user_type not in ['patient', 'doctor', 'admin']:
        return Response(
            {"error": "Insufficient permissions."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        patient = User.objects.get(id=patient_id, user_type='patient')
    except User.DoesNotExist:
        return Response(
            {"error": "Patient not found."},
            status=status.HTTP_404_NOT_FOUND
        )
    
    consultations = Consultation.objects.filter(
        appointment__patient=patient
    ).select_related('appointment__time_slot').order_by('-created_at')
    
    serializer = ConsultationSummarySerializer(consultations, many=True)
    
    return Response({
        "patient": {
            "id": patient.id,
            "name": patient.get_full_name(),
            "date_of_birth": patient.date_of_birth,
            "medical_history": patient.medical_history,
            "allergies": patient.allergies
        },
        "consultations": serializer.data
    })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def today_consultations(request):
    """Get today's consultations for the user"""
    user = request.user
    today = timezone.now().date()
    
    if user.user_type == 'patient':
        consultations = Consultation.objects.filter(
            appointment__patient=user,
            appointment__time_slot__date=today
        ).order_by('appointment__time_slot__start_time')
    elif user.user_type == 'doctor':
        consultations = Consultation.objects.filter(
            appointment__doctor=user,
            appointment__time_slot__date=today
        ).order_by('appointment__time_slot__start_time')
    else:  # admin
        consultations = Consultation.objects.filter(
            appointment__time_slot__date=today
        ).order_by('appointment__time_slot__start_time')
    
    serializer = ConsultationSummarySerializer(consultations, many=True)
    return Response(serializer.data)