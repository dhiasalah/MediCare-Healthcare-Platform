from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import datetime, timedelta
from .schedule_models import DoctorWeeklySchedule, DoctorDayOff, DoctorExceptionalSchedule
from .schedule_serializers import (
    DoctorWeeklyScheduleSerializer,
    DoctorDayOffSerializer,
    DoctorExceptionalScheduleSerializer,
    BulkWeeklyScheduleSerializer
)
from .permissions import IsDoctorOrReadOnly


class DoctorWeeklyScheduleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing doctor weekly schedules.
    Doctors can create, view, update, and delete their weekly availability.
    """
    serializer_class = DoctorWeeklyScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.user_type == 'doctor':
            # Doctors can only see and manage their own schedules
            return DoctorWeeklySchedule.objects.filter(doctor=user)
        elif user.user_type == 'patient':
            # Patients can view all doctors' schedules
            return DoctorWeeklySchedule.objects.filter(is_available=True)
        elif user.user_type == 'admin':
            # Admins can see all schedules
            return DoctorWeeklySchedule.objects.all()
        
        return DoctorWeeklySchedule.objects.none()
    
    def perform_create(self, serializer):
        # Automatically set the doctor to the current user
        serializer.save(doctor=self.request.user)
    
    @action(detail=False, methods=['put', 'post'])
    def bulk_update(self, request):
        """
        Bulk create/update weekly schedules for all days of the week.
        Expected payload: { "schedules": [...] }
        """
        serializer = BulkWeeklyScheduleSerializer(
            data=request.data,
            context={'doctor': request.user}
        )
        
        if serializer.is_valid():
            schedules = serializer.save()
            return Response(
                DoctorWeeklyScheduleSerializer(schedules, many=True).data,
                status=status.HTTP_200_OK
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def my_schedule(self, request):
        """Get the current doctor's complete weekly schedule"""
        if request.user.user_type != 'doctor':
            return Response(
                {"error": "Cette action est réservée aux médecins."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        schedules = DoctorWeeklySchedule.objects.filter(doctor=request.user)
        serializer = self.get_serializer(schedules, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='doctor/(?P<doctor_id>[^/.]+)')
    def doctor_schedule(self, request, doctor_id=None):
        """Get a specific doctor's weekly schedule"""
        from accounts.models import User
        
        doctor = get_object_or_404(User, id=doctor_id, user_type='doctor')
        schedules = DoctorWeeklySchedule.objects.filter(
            doctor=doctor,
            is_available=True
        )
        serializer = self.get_serializer(schedules, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def initialize_schedule(self, request):
        """
        Initialize a default weekly schedule for the doctor.
        Creates entries for all days of the week with default settings.
        """
        if request.user.user_type != 'doctor':
            return Response(
                {"error": "Cette action est réservée aux médecins."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if schedule already exists
        existing_count = DoctorWeeklySchedule.objects.filter(doctor=request.user).count()
        if existing_count > 0:
            return Response(
                {"error": "Un horaire existe déjà. Utilisez la mise à jour."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Default schedule: Monday to Friday, 9:00-12:00 and 13:00-17:00
        default_schedules = []
        weekdays = [0, 1, 2, 3, 4]  # Monday to Friday
        
        for day in weekdays:
            schedule = DoctorWeeklySchedule.objects.create(
                doctor=request.user,
                day_of_week=day,
                is_available=True,
                morning_start='09:00',
                morning_end='12:00',
                afternoon_start='13:00',
                afternoon_end='17:00',
                appointment_duration=30
            )
            default_schedules.append(schedule)
        
        # Weekend days as unavailable
        for day in [5, 6]:  # Saturday, Sunday
            schedule = DoctorWeeklySchedule.objects.create(
                doctor=request.user,
                day_of_week=day,
                is_available=False,
                appointment_duration=30
            )
            default_schedules.append(schedule)
        
        serializer = self.get_serializer(default_schedules, many=True)
        return Response(
            {
                "message": "Horaire par défaut initialisé avec succès.",
                "schedules": serializer.data
            },
            status=status.HTTP_201_CREATED
        )


class DoctorDayOffViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing doctor days off (congés).
    Doctors can mark specific dates as unavailable.
    """
    serializer_class = DoctorDayOffSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.user_type == 'doctor':
            return DoctorDayOff.objects.filter(doctor=user)
        elif user.user_type == 'patient':
            # Patients can see days off to know when doctors are unavailable
            return DoctorDayOff.objects.filter(date__gte=timezone.now().date())
        elif user.user_type == 'admin':
            return DoctorDayOff.objects.all()
        
        return DoctorDayOff.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(doctor=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_days_off(self, request):
        """Get the current doctor's days off"""
        if request.user.user_type != 'doctor':
            return Response(
                {"error": "Cette action est réservée aux médecins."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        days_off = DoctorDayOff.objects.filter(
            doctor=request.user,
            date__gte=timezone.now().date()
        ).order_by('date')
        
        serializer = self.get_serializer(days_off, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='doctor/(?P<doctor_id>[^/.]+)')
    def doctor_days_off(self, request, doctor_id=None):
        """Get a specific doctor's days off"""
        from accounts.models import User
        
        doctor = get_object_or_404(User, id=doctor_id, user_type='doctor')
        days_off = DoctorDayOff.objects.filter(
            doctor=doctor,
            date__gte=timezone.now().date()
        ).order_by('date')
        
        serializer = self.get_serializer(days_off, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='check/(?P<date>[^/.]+)')
    def check_availability(self, request, date=None):
        """Check if the current doctor is available on a specific date"""
        if request.user.user_type != 'doctor':
            return Response(
                {"error": "Cette action est réservée aux médecins."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            check_date = datetime.strptime(date, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {"error": "Format de date invalide. Utilisez YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        day_off = DoctorDayOff.objects.filter(
            doctor=request.user,
            date=check_date
        ).first()
        
        if day_off:
            return Response({
                "available": False,
                "reason": day_off.reason,
                "is_full_day": day_off.is_full_day,
                "unavailable_start": day_off.unavailable_start,
                "unavailable_end": day_off.unavailable_end
            })
        
        return Response({"available": True})


class DoctorExceptionalScheduleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing exceptional schedules.
    For dates that differ from the regular weekly schedule.
    """
    serializer_class = DoctorExceptionalScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.user_type == 'doctor':
            return DoctorExceptionalSchedule.objects.filter(doctor=user)
        elif user.user_type == 'patient':
            return DoctorExceptionalSchedule.objects.filter(date__gte=timezone.now().date())
        elif user.user_type == 'admin':
            return DoctorExceptionalSchedule.objects.all()
        
        return DoctorExceptionalSchedule.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(doctor=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_exceptional_schedules(self, request):
        """Get the current doctor's exceptional schedules"""
        if request.user.user_type != 'doctor':
            return Response(
                {"error": "Cette action est réservée aux médecins."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        schedules = DoctorExceptionalSchedule.objects.filter(
            doctor=request.user,
            date__gte=timezone.now().date()
        ).order_by('date')
        
        serializer = self.get_serializer(schedules, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='doctor/(?P<doctor_id>[^/.]+)')
    def doctor_exceptional_schedules(self, request, doctor_id=None):
        """Get a specific doctor's exceptional schedules"""
        from accounts.models import User
        
        doctor = get_object_or_404(User, id=doctor_id, user_type='doctor')
        schedules = DoctorExceptionalSchedule.objects.filter(
            doctor=doctor,
            date__gte=timezone.now().date()
        ).order_by('date')
        
        serializer = self.get_serializer(schedules, many=True)
        return Response(serializer.data)
