from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Q, Count
from datetime import datetime, timedelta
import calendar

from .models import Appointment, TimeSlot, AppointmentHistory
from .schedule_models import DoctorDayOff
from .serializers import (
    AppointmentSerializer, AppointmentCreateSerializer, AppointmentUpdateSerializer,
    TimeSlotSerializer, TimeSlotCreateSerializer, AppointmentHistorySerializer,
    DoctorAvailabilitySerializer, AppointmentStatsSerializer
)
from .permissions import IsPatientOrDoctor, IsAppointmentParticipant
from .slot_generator import get_available_slots

User = get_user_model()

class TimeSlotViewSet(ModelViewSet):
    """ViewSet for managing time slots"""
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = TimeSlot.objects.all()
        
        # Filter by doctor
        doctor_id = self.request.query_params.get('doctor', None)
        if doctor_id:
            queryset = queryset.filter(doctor_id=doctor_id)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        # Filter available slots only
        available_only = self.request.query_params.get('available_only', 'false').lower() == 'true'
        if available_only:
            queryset = queryset.filter(is_available=True, date__gte=timezone.now().date())
        
        return queryset.order_by('date', 'start_time')
    
    def perform_create(self, serializer):
        # Only doctors can create their own time slots
        if self.request.user.user_type != 'doctor':
            raise permissions.PermissionDenied("Only doctors can create time slots.")
        
        serializer.save(doctor=self.request.user)
    
    def perform_update(self, serializer):
        # Only the doctor who owns the slot can update it
        if serializer.instance.doctor != self.request.user:
            raise permissions.PermissionDenied("You can only update your own time slots.")
        
        serializer.save()
    
    @action(detail=False, methods=['post'])
    def create_bulk_slots(self, request):
        """Create multiple time slots at once"""
        serializer = TimeSlotCreateSerializer(data=request.data)
        if serializer.is_valid():
            # Ensure only doctors can create slots for themselves
            if request.user.user_type != 'doctor':
                return Response(
                    {"error": "Only doctors can create time slots."}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Override doctor to current user
            serializer.validated_data['doctor'] = request.user
            slots = serializer.create_time_slots()
            
            slot_serializer = TimeSlotSerializer(slots, many=True)
            return Response({
                "message": f"Created {len(slots)} time slots successfully.",
                "slots": slot_serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def available_slots(self, request):
        """
        Generate available time slots for a doctor based on their schedule.
        Query parameters:
            - doctor: Doctor ID (required)
            - start_date: Start date (YYYY-MM-DD, default: today)
            - end_date: End date (YYYY-MM-DD, optional)
            - days_ahead: Number of days to generate (default: 30)
        """
        doctor_id = request.query_params.get('doctor')
        
        if not doctor_id:
            return Response(
                {"error": "Doctor ID is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            doctor = User.objects.get(id=doctor_id, user_type='doctor')
        except User.DoesNotExist:
            return Response(
                {"error": "Doctor not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Parse query parameters
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        days_ahead = request.query_params.get('days_ahead', 30)
        
        start_date = None
        end_date = None
        
        if start_date_str:
            try:
                start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {"error": "Invalid start_date format. Use YYYY-MM-DD"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        if end_date_str:
            try:
                end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {"error": "Invalid end_date format. Use YYYY-MM-DD"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        try:
            days_ahead = int(days_ahead)
        except ValueError:
            days_ahead = 30
        
        # Generate available slots dynamically from doctor's schedule
        available_slots = get_available_slots(
            doctor=doctor,
            start_date=start_date,
            end_date=end_date,
            days_ahead=days_ahead
        )
        
        return Response({
            "doctor_id": doctor.id,
            "doctor_name": doctor.get_full_name(),
            "total_slots": len(available_slots),
            "slots": available_slots
        }, status=status.HTTP_200_OK)

class AppointmentViewSet(ModelViewSet):
    """ViewSet for managing appointments"""
    queryset = Appointment.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsAppointmentParticipant]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return AppointmentCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return AppointmentUpdateSerializer
        return AppointmentSerializer
    
    def get_queryset(self):
        user = self.request.user
        queryset = Appointment.objects.all()
        
        # Filter based on user type
        if user.user_type == 'patient':
            queryset = queryset.filter(patient=user)
        elif user.user_type == 'doctor':
            queryset = queryset.filter(doctor=user)
        # Admins see all appointments
        
        # Additional filters
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        date_filter = self.request.query_params.get('date', None)
        if date_filter:
            queryset = queryset.filter(time_slot__date=date_filter)
        
        upcoming_only = self.request.query_params.get('upcoming', 'false').lower() == 'true'
        if upcoming_only:
            queryset = queryset.filter(time_slot__date__gte=timezone.now().date())
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        # Set created_by to current user
        appointment = serializer.save(created_by=self.request.user)
        
        # Create history entry
        AppointmentHistory.objects.create(
            appointment=appointment,
            changed_by=self.request.user,
            change_type='created',
            new_status=appointment.status,
            notes=f"Appointment created by {self.request.user.get_full_name()}"
        )
    
    @action(detail=False, methods=['post'])
    def book_with_virtual_slot(self, request):
        """
        Book an appointment using virtual slot data (date and time).
        This creates or reuses a TimeSlot record.
        
        Expected payload:
        {
            "patient": <patient_id>,
            "doctor": <doctor_id>,
            "date": "YYYY-MM-DD",
            "start_time": "HH:MM:SS",
            "end_time": "HH:MM:SS",
            "consultation_type": "general",
            "reason_for_visit": "...",
            "symptoms": "...",
            "priority": "medium",
            "contact_phone": "...",
            "patient_notes": "..."
        }
        """
        patient_id = request.data.get('patient')
        doctor_id = request.data.get('doctor')
        date_str = request.data.get('date')
        start_time_str = request.data.get('start_time')
        end_time_str = request.data.get('end_time')
        
        # Validate required fields
        if not all([patient_id, doctor_id, date_str, start_time_str, end_time_str]):
            return Response(
                {"error": "Missing required fields: patient, doctor, date, start_time, end_time"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            patient = User.objects.get(id=patient_id, user_type='patient')
            doctor = User.objects.get(id=doctor_id, user_type='doctor')
        except User.DoesNotExist:
            return Response(
                {"error": "Patient or doctor not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Parse date and times
        try:
            booking_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            start_time = datetime.strptime(start_time_str, '%H:%M:%S').time()
            end_time = datetime.strptime(end_time_str, '%H:%M:%S').time()
        except ValueError as e:
            return Response(
                {"error": f"Invalid date/time format: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if date is in the past
        if booking_date < timezone.now().date():
            return Response(
                {"error": "Cannot book appointments for past dates"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Find or create the TimeSlot
        time_slot, created = TimeSlot.objects.get_or_create(
            doctor=doctor,
            date=booking_date,
            start_time=start_time,
            end_time=end_time,
            defaults={'is_available': True, 'duration_minutes': 30}
        )
        
        # Check if slot is available
        if not time_slot.is_available:
            return Response(
                {"error": "This time slot is already booked"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create appointment with the found/created time slot
        appointment_data = {
            'patient': patient_id,
            'doctor': doctor_id,
            'time_slot': time_slot.id,
            'consultation_type': request.data.get('consultation_type', 'general'),
            'reason_for_visit': request.data.get('reason_for_visit', ''),
            'symptoms': request.data.get('symptoms', ''),
            'priority': request.data.get('priority', 'medium'),
            'contact_phone': request.data.get('contact_phone', ''),
            'patient_notes': request.data.get('patient_notes', ''),
        }
        
        serializer = AppointmentCreateSerializer(data=appointment_data)
        if serializer.is_valid():
            appointment = serializer.save(created_by=request.user)
            
            # Create history entry
            AppointmentHistory.objects.create(
                appointment=appointment,
                changed_by=request.user,
                change_type='created',
                new_status=appointment.status,
                notes=f"Appointment booked via virtual slot by {request.user.get_full_name()}"
            )
            
            # Mark time slot as unavailable
            time_slot.is_available = False
            time_slot.save()
            
            return Response({
                "message": "Appointment booked successfully",
                "appointment": AppointmentSerializer(appointment).data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def perform_update(self, serializer):
        old_status = serializer.instance.status
        appointment = serializer.save()
        
        # Create history entry if status changed
        if old_status != appointment.status:
            AppointmentHistory.objects.create(
                appointment=appointment,
                changed_by=self.request.user,
                change_type='updated',
                old_status=old_status,
                new_status=appointment.status,
                notes=f"Status changed from {old_status} to {appointment.status}"
            )
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel an appointment"""
        appointment = self.get_object()
        
        if not appointment.can_be_cancelled():
            return Response(
                {"error": "This appointment cannot be cancelled."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_status = appointment.status
        appointment.status = 'cancelled'
        appointment.save()
        
        # Create history entry
        AppointmentHistory.objects.create(
            appointment=appointment,
            changed_by=request.user,
            change_type='cancelled',
            old_status=old_status,
            new_status='cancelled',
            notes=request.data.get('reason', 'Appointment cancelled')
        )
        
        serializer = AppointmentSerializer(appointment)
        return Response({
            "message": "Appointment cancelled successfully.",
            "appointment": serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def reschedule(self, request, pk=None):
        """Reschedule an appointment to a new time slot"""
        appointment = self.get_object()
        new_time_slot_id = request.data.get('new_time_slot_id')
        
        if not new_time_slot_id:
            return Response(
                {"error": "new_time_slot_id is required."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            new_time_slot = TimeSlot.objects.get(id=new_time_slot_id)
        except TimeSlot.DoesNotExist:
            return Response(
                {"error": "Time slot not found."}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not new_time_slot.is_available:
            return Response(
                {"error": "Selected time slot is not available."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if new_time_slot.doctor != appointment.doctor:
            return Response(
                {"error": "Time slot must belong to the same doctor."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Free up old time slot
        old_time_slot = appointment.time_slot
        old_time_slot.is_available = True
        old_time_slot.save()
        
        # Assign new time slot
        appointment.time_slot = new_time_slot
        appointment.status = 'scheduled'
        appointment.save()
        
        # Mark new time slot as unavailable
        new_time_slot.is_available = False
        new_time_slot.save()
        
        # Create history entry
        AppointmentHistory.objects.create(
            appointment=appointment,
            changed_by=request.user,
            change_type='rescheduled',
            notes=f"Rescheduled from {old_time_slot.date} {old_time_slot.start_time} to {new_time_slot.date} {new_time_slot.start_time}"
        )
        
        serializer = AppointmentSerializer(appointment)
        return Response({
            "message": "Appointment rescheduled successfully.",
            "appointment": serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark appointment as completed"""
        appointment = self.get_object()
        
        if request.user != appointment.doctor:
            return Response(
                {"error": "Only the assigned doctor can complete appointments."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        old_status = appointment.status
        appointment.status = 'completed'
        appointment.doctor_notes = request.data.get('doctor_notes', appointment.doctor_notes)
        appointment.save()
        
        # Create history entry
        AppointmentHistory.objects.create(
            appointment=appointment,
            changed_by=request.user,
            change_type='completed',
            old_status=old_status,
            new_status='completed',
            notes="Appointment completed by doctor"
        )
        
        serializer = AppointmentSerializer(appointment)
        return Response({
            "message": "Appointment marked as completed.",
            "appointment": serializer.data
        })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def doctor_availability(request):
    """Get available time slots for a specific doctor and date"""
    serializer = DoctorAvailabilitySerializer(data=request.query_params)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    doctor_id = serializer.validated_data['doctor_id']
    date = serializer.validated_data['date']
    
    try:
        doctor = User.objects.get(id=doctor_id, user_type='doctor')
    except User.DoesNotExist:
        return Response(
            {"error": "Doctor not found."}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check if doctor has a day-off on this date
    day_off = DoctorDayOff.objects.filter(doctor=doctor, date=date, is_full_day=True).exists()
    
    if day_off:
        return Response({
            "doctor": {
                "id": doctor.id,
                "name": doctor.get_full_name(),
                "specialization": doctor.specialization
            },
            "date": date,
            "available_slots": [],
            "message": "Doctor is unavailable on this date (day off)"
        })
    
    available_slots = TimeSlot.objects.filter(
        doctor=doctor,
        date=date,
        is_available=True
    ).order_by('start_time')
    
    slot_serializer = TimeSlotSerializer(available_slots, many=True)
    
    return Response({
        "doctor": {
            "id": doctor.id,
            "name": doctor.get_full_name(),
            "specialization": doctor.specialization
        },
        "date": date,
        "available_slots": slot_serializer.data
    })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def appointment_statistics(request):
    """Get appointment statistics for dashboard"""
    user = request.user
    
    # Base queryset based on user type
    if user.user_type == 'patient':
        queryset = Appointment.objects.filter(patient=user)
    elif user.user_type == 'doctor':
        queryset = Appointment.objects.filter(doctor=user)
    else:  # admin
        queryset = Appointment.objects.all()
    
    today = timezone.now().date()
    this_month_start = today.replace(day=1)
    last_month = this_month_start - timedelta(days=1)
    last_month_start = last_month.replace(day=1)
    
    stats = {
        'total_appointments': queryset.count(),
        'scheduled_appointments': queryset.filter(status='scheduled').count(),
        'completed_appointments': queryset.filter(status='completed').count(),
        'cancelled_appointments': queryset.filter(status='cancelled').count(),
        'today_appointments': queryset.filter(time_slot__date=today).count(),
        'upcoming_appointments': queryset.filter(
            time_slot__date__gte=today, 
            status__in=['scheduled', 'confirmed']
        ).count(),
        'this_month_total': queryset.filter(
            time_slot__date__gte=this_month_start,
            time_slot__date__lte=today
        ).count(),
        'last_month_total': queryset.filter(
            time_slot__date__gte=last_month_start,
            time_slot__date__lt=this_month_start
        ).count(),
    }
    
    # Popular time slots (for doctors and admins)
    if user.user_type in ['doctor', 'admin']:
        popular_slots_query = queryset.values(
            'time_slot__start_time'
        ).annotate(
            count=Count('id')
        ).order_by('-count')[:5]
        
        stats['popular_time_slots'] = list(popular_slots_query)
    else:
        stats['popular_time_slots'] = []
    
    serializer = AppointmentStatsSerializer(stats)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def upcoming_appointments(request):
    """Get upcoming appointments for the user"""
    user = request.user
    
    if user.user_type == 'patient':
        appointments = Appointment.objects.filter(
            patient=user,
            time_slot__date__gte=timezone.now().date(),
            status__in=['scheduled', 'confirmed']
        ).order_by('time_slot__date', 'time_slot__start_time')[:5]
    elif user.user_type == 'doctor':
        appointments = Appointment.objects.filter(
            doctor=user,
            time_slot__date__gte=timezone.now().date(),
            status__in=['scheduled', 'confirmed']
        ).order_by('time_slot__date', 'time_slot__start_time')[:10]
    else:  # admin
        appointments = Appointment.objects.filter(
            time_slot__date__gte=timezone.now().date(),
            status__in=['scheduled', 'confirmed']
        ).order_by('time_slot__date', 'time_slot__start_time')[:10]
    
    serializer = AppointmentSerializer(appointments, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def today_appointments(request):
    """Get today's appointments for the user"""
    user = request.user
    today = timezone.now().date()
    
    if user.user_type == 'patient':
        appointments = Appointment.objects.filter(
            patient=user,
            time_slot__date=today
        ).order_by('time_slot__start_time')
    elif user.user_type == 'doctor':
        appointments = Appointment.objects.filter(
            doctor=user,
            time_slot__date=today
        ).order_by('time_slot__start_time')
    else:  # admin
        appointments = Appointment.objects.filter(
            time_slot__date=today
        ).order_by('time_slot__start_time')
    
    serializer = AppointmentSerializer(appointments, many=True)
    return Response(serializer.data)

class AppointmentHistoryListView(generics.ListAPIView):
    """List appointment history for a specific appointment"""
    serializer_class = AppointmentHistorySerializer
    permission_classes = [permissions.IsAuthenticated, IsAppointmentParticipant]
    
    def get_queryset(self):
        appointment_id = self.kwargs['appointment_id']
        appointment = get_object_or_404(Appointment, id=appointment_id)
        
        # Check if user has access to this appointment
        user = self.request.user
        if (user.user_type == 'patient' and appointment.patient != user) or \
           (user.user_type == 'doctor' and appointment.doctor != user):
            return AppointmentHistory.objects.none()
        
        return AppointmentHistory.objects.filter(appointment=appointment)