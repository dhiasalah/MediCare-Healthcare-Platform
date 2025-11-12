from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from appointments.models import Appointment

User = get_user_model()

class ConsultationStatus(models.TextChoices):
    SCHEDULED = 'scheduled', 'Scheduled'
    IN_PROGRESS = 'in_progress', 'In Progress'
    COMPLETED = 'completed', 'Completed'
    CANCELLED = 'cancelled', 'Cancelled'

class Consultation(models.Model):
    """Medical consultation records"""
    appointment = models.OneToOneField(
        Appointment,
        on_delete=models.CASCADE,
        related_name='consultation'
    )
    
    # Basic consultation info
    status = models.CharField(
        max_length=20,
        choices=ConsultationStatus.choices,
        default=ConsultationStatus.SCHEDULED
    )
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    
    # Medical assessment
    chief_complaint = models.TextField(
        help_text="Primary reason for the visit"
    )
    history_of_present_illness = models.TextField(
        blank=True,
        help_text="Detailed description of current condition"
    )
    
    # Physical examination
    vital_signs = models.JSONField(
        default=dict,
        help_text="Blood pressure, heart rate, temperature, etc."
    )
    physical_examination = models.TextField(
        blank=True,
        help_text="Physical examination findings"
    )
    
    # Assessment and plan
    assessment = models.TextField(
        blank=True,
        help_text="Doctor's assessment and diagnosis"
    )
    diagnosis = models.CharField(
        max_length=500,
        blank=True,
        help_text="Primary and secondary diagnoses"
    )
    treatment_plan = models.TextField(
        blank=True,
        help_text="Treatment plan and recommendations"
    )
    
    # Prescriptions and follow-up
    prescriptions = models.TextField(
        blank=True,
        help_text="Prescribed medications and instructions"
    )
    follow_up_instructions = models.TextField(
        blank=True,
        help_text="Follow-up care instructions"
    )
    next_appointment_recommended = models.BooleanField(default=False)
    follow_up_date = models.DateField(null=True, blank=True)
    
    # Additional notes
    doctor_notes = models.TextField(
        blank=True,
        help_text="Private notes for doctor"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_consultations'
    )
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Consultation - {self.appointment.patient.get_full_name()} ({self.appointment.time_slot.date})"
    
    @property
    def duration_minutes(self):
        """Calculate consultation duration in minutes"""
        if self.start_time and self.end_time:
            duration = self.end_time - self.start_time
            return int(duration.total_seconds() / 60)
        return None
    
    @property
    def patient(self):
        """Get the patient from the related appointment"""
        return self.appointment.patient
    
    @property
    def doctor(self):
        """Get the doctor from the related appointment"""
        return self.appointment.doctor

class VitalSigns(models.Model):
    """Separate model for detailed vital signs tracking"""
    consultation = models.ForeignKey(
        Consultation,
        on_delete=models.CASCADE,
        related_name='detailed_vitals'
    )
    
    # Vital measurements
    systolic_bp = models.PositiveIntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(50), MaxValueValidator(300)],
        help_text="Systolic blood pressure (mmHg)"
    )
    diastolic_bp = models.PositiveIntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(30), MaxValueValidator(200)],
        help_text="Diastolic blood pressure (mmHg)"
    )
    heart_rate = models.PositiveIntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(30), MaxValueValidator(250)],
        help_text="Heart rate (beats per minute)"
    )
    temperature = models.DecimalField(
        max_digits=4, decimal_places=1,
        null=True, blank=True,
        help_text="Body temperature (°C)"
    )
    respiratory_rate = models.PositiveIntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(8), MaxValueValidator(60)],
        help_text="Respiratory rate (breaths per minute)"
    )
    oxygen_saturation = models.PositiveIntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(70), MaxValueValidator(100)],
        help_text="Oxygen saturation (%)"
    )
    weight = models.DecimalField(
        max_digits=5, decimal_places=1,
        null=True, blank=True,
        help_text="Weight (kg)"
    )
    height = models.PositiveIntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(50), MaxValueValidator(250)],
        help_text="Height (cm)"
    )
    
    # Calculated fields
    bmi = models.DecimalField(
        max_digits=4, decimal_places=1,
        null=True, blank=True,
        help_text="Body Mass Index"
    )
    
    recorded_at = models.DateTimeField(auto_now_add=True)
    recorded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='recorded_vitals'
    )
    
    class Meta:
        ordering = ['-recorded_at']
    
    def save(self, *args, **kwargs):
        # Calculate BMI if height and weight are provided
        if self.height and self.weight:
            height_m = float(self.height) / 100  # convert cm to m
            self.bmi = round(float(self.weight) / (height_m * height_m), 1)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Vitals for {self.consultation} - {self.recorded_at}"

class Prescription(models.Model):
    """Detailed prescription model"""
    consultation = models.ForeignKey(
        Consultation,
        on_delete=models.CASCADE,
        related_name='detailed_prescriptions'
    )
    
    medication_name = models.CharField(max_length=200)
    dosage = models.CharField(max_length=100, help_text="e.g., 500mg, 10ml")
    frequency = models.CharField(max_length=100, help_text="e.g., twice daily, every 8 hours")
    duration = models.CharField(max_length=100, help_text="e.g., 7 days, 2 weeks")
    instructions = models.TextField(
        blank=True,
        help_text="Special instructions (take with food, etc.)"
    )
    
    # Medication details
    medication_type = models.CharField(
        max_length=50,
        choices=[
            ('tablet', 'Tablet'),
            ('capsule', 'Capsule'),
            ('syrup', 'Syrup'),
            ('injection', 'Injection'),
            ('cream', 'Cream/Ointment'),
            ('drops', 'Drops'),
            ('other', 'Other')
        ],
        default='tablet'
    )
    
    quantity = models.PositiveIntegerField(
        null=True, blank=True,
        help_text="Number of units to dispense"
    )
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.medication_name} - {self.dosage} {self.frequency}"

class ConsultationNote(models.Model):
    """Additional notes that can be added to consultations"""
    consultation = models.ForeignKey(
        Consultation,
        on_delete=models.CASCADE,
        related_name='notes'
    )
    
    note_type = models.CharField(
        max_length=50,
        choices=[
            ('assessment', 'Assessment'),
            ('plan', 'Treatment Plan'),
            ('follow_up', 'Follow-up'),
            ('lab_results', 'Lab Results'),
            ('imaging', 'Imaging Results'),
            ('referral', 'Referral'),
            ('general', 'General Note')
        ],
        default='general'
    )
    
    title = models.CharField(max_length=200, blank=True)
    content = models.TextField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True
    )
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_note_type_display()} - {self.consultation}"