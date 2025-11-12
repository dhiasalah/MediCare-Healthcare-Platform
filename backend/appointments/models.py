from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import RegexValidator
from django.utils import timezone

User = get_user_model()

class AppointmentStatus(models.TextChoices):
    SCHEDULED = 'scheduled', 'Scheduled'
    CONFIRMED = 'confirmed', 'Confirmed'
    IN_PROGRESS = 'in_progress', 'In Progress'
    COMPLETED = 'completed', 'Completed'
    CANCELLED = 'cancelled', 'Cancelled'
    NO_SHOW = 'no_show', 'No Show'

class ConsultationType(models.TextChoices):
    GENERAL = 'general', 'General Consultation'
    FOLLOW_UP = 'follow_up', 'Follow-up'
    EMERGENCY = 'emergency', 'Emergency'
    ROUTINE_CHECKUP = 'routine_checkup', 'Routine Checkup'
    SPECIALIST = 'specialist', 'Specialist Consultation'

class TimeSlot(models.Model):
    """Available time slots for appointments"""
    doctor = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='available_slots',
        limit_choices_to={'user_type': 'doctor'}
    )
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)
    duration_minutes = models.PositiveIntegerField(default=30)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['doctor', 'date', 'start_time']
        ordering = ['date', 'start_time']
        
    def __str__(self):
        return f"Dr. {self.doctor.get_full_name()} - {self.date} {self.start_time}-{self.end_time}"
    
    def is_past_slot(self):
        """Check if this time slot is in the past"""
        slot_datetime = timezone.make_aware(
            timezone.datetime.combine(self.date, self.start_time)
        )
        return slot_datetime < timezone.now()

class Appointment(models.Model):
    """Patient appointments with doctors"""
    patient = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='appointments',
        limit_choices_to={'user_type': 'patient'}
    )
    doctor = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='doctor_appointments',
        limit_choices_to={'user_type': 'doctor'}
    )
    time_slot = models.OneToOneField(
        TimeSlot, 
        on_delete=models.CASCADE, 
        related_name='appointment'
    )
    
    # Appointment details
    consultation_type = models.CharField(
        max_length=20, 
        choices=ConsultationType.choices,
        default=ConsultationType.GENERAL
    )
    status = models.CharField(
        max_length=20, 
        choices=AppointmentStatus.choices,
        default=AppointmentStatus.SCHEDULED
    )
    
    # Patient information
    reason_for_visit = models.TextField(help_text="Brief description of the reason for the appointment")
    symptoms = models.TextField(blank=True, help_text="Current symptoms or concerns")
    priority = models.CharField(
        max_length=10,
        choices=[
            ('low', 'Low'),
            ('medium', 'Medium'),
            ('high', 'High'),
            ('urgent', 'Urgent')
        ],
        default='medium'
    )
    
    # Contact information
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
    )
    contact_phone = models.CharField(
        validators=[phone_regex], 
        max_length=17, 
        help_text="Contact phone for this appointment"
    )
    
    # Notes and additional info
    patient_notes = models.TextField(blank=True, help_text="Additional notes from patient")
    doctor_notes = models.TextField(blank=True, help_text="Doctor's notes (private)")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='created_appointments'
    )
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.patient.get_full_name()} - Dr. {self.doctor.get_full_name()} ({self.time_slot.date})"
    
    @property
    def appointment_datetime(self):
        """Get the full datetime of the appointment"""
        return timezone.make_aware(
            timezone.datetime.combine(
                self.time_slot.date, 
                self.time_slot.start_time
            )
        )
    
    @property
    def is_upcoming(self):
        """Check if appointment is in the future"""
        return self.appointment_datetime > timezone.now()
    
    @property
    def is_today(self):
        """Check if appointment is today"""
        return self.time_slot.date == timezone.now().date()
    
    def can_be_cancelled(self):
        """Check if appointment can still be cancelled (24 hours before)"""
        if self.status in [AppointmentStatus.CANCELLED, AppointmentStatus.COMPLETED]:
            return False
        
        cancel_deadline = self.appointment_datetime - timezone.timedelta(hours=24)
        return timezone.now() < cancel_deadline
    
    def save(self, *args, **kwargs):
        # Mark time slot as unavailable when appointment is created
        if self.pk is None and self.time_slot:
            self.time_slot.is_available = False
            self.time_slot.save()
        super().save(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        # Mark time slot as available when appointment is deleted
        if self.time_slot:
            self.time_slot.is_available = True
            self.time_slot.save()
        super().delete(*args, **kwargs)

class AppointmentHistory(models.Model):
    """Track changes to appointments for audit purposes"""
    appointment = models.ForeignKey(
        Appointment, 
        on_delete=models.CASCADE, 
        related_name='history'
    )
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    change_type = models.CharField(
        max_length=20,
        choices=[
            ('created', 'Created'),
            ('updated', 'Updated'),
            ('cancelled', 'Cancelled'),
            ('rescheduled', 'Rescheduled'),
            ('completed', 'Completed')
        ]
    )
    old_status = models.CharField(max_length=20, blank=True)
    new_status = models.CharField(max_length=20, blank=True)
    notes = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name_plural = "Appointment histories"
    
    def __str__(self):
        return f"{self.appointment} - {self.change_type} at {self.timestamp}"


# Import schedule models to make them available through appointments app
from .schedule_models import DoctorWeeklySchedule, DoctorDayOff, DoctorExceptionalSchedule

__all__ = [
    'TimeSlot',
    'Appointment',
    'AppointmentHistory',
    'AppointmentStatus',
    'ConsultationType',
    'DoctorWeeklySchedule',
    'DoctorDayOff',
    'DoctorExceptionalSchedule'
]