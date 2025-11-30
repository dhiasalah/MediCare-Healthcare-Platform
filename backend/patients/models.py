from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

class Patient(models.Model):
    GENDER_CHOICES = [
        ('M', 'Masculin'),
        ('F', 'Féminin'),
        ('O', 'Autre'),
    ]
    
    # Personal Information
    first_name = models.CharField(max_length=50, verbose_name='Prénom')
    last_name = models.CharField(max_length=50, verbose_name='Nom')
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, verbose_name='Téléphone')
    date_of_birth = models.DateField(verbose_name='Date de naissance')
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, verbose_name='Genre')
    address = models.TextField(verbose_name='Adresse')
    
    # Medical Information
    medical_history = models.TextField(blank=True, null=True, verbose_name='Antécédents médicaux')
    allergies = models.TextField(blank=True, null=True, verbose_name='Allergies')
    current_medications = models.TextField(blank=True, null=True, verbose_name='Médicaments actuels')
    blood_type = models.CharField(max_length=5, blank=True, null=True, verbose_name='Groupe sanguin')
    
    # Emergency Contact
    emergency_contact_name = models.CharField(max_length=100, verbose_name='Contact d\'urgence')
    emergency_contact_phone = models.CharField(max_length=20, verbose_name='Téléphone d\'urgence')
    emergency_contact_relation = models.CharField(max_length=50, verbose_name='Lien de parenté')
    
    # Insurance Information
    insurance_provider = models.CharField(max_length=100, blank=True, null=True, verbose_name='Assureur')
    insurance_number = models.CharField(max_length=50, blank=True, null=True, verbose_name='Numéro d\'assurance')
    
    # Primary Doctor (Médecin Traitant)
    primary_doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        limit_choices_to={'user_type': 'doctor'},
        related_name='primary_patients',
        verbose_name='Médecin traitant',
        null=True,
        blank=True
    )
    
    # Legacy field for backwards compatibility
    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        limit_choices_to={'user_type': 'doctor'},
        related_name='patients',
        verbose_name='Médecin',
        null=True,
        blank=True
    )
    
    is_active = models.BooleanField(default=True, verbose_name='Actif')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'patients'
        verbose_name = 'Patient'
        verbose_name_plural = 'Patients'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def save(self, *args, **kwargs):
        # Sync primary_doctor with doctor for backwards compatibility
        if not self.primary_doctor and self.doctor:
            self.primary_doctor = self.doctor
        elif self.primary_doctor and not self.doctor:
            self.doctor = self.primary_doctor
        super().save(*args, **kwargs)
    
    @property
    def age(self):
        from datetime import date
        today = date.today()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )


class PatientSpecialist(models.Model):
    """
    Represents the relationship between a patient and their specialist doctors.
    The primary doctor (médecin traitant) can assign specialists to their patients.
    """
    STATUS_CHOICES = [
        ('active', 'Actif'),
        ('completed', 'Terminé'),
        ('cancelled', 'Annulé'),
    ]
    
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='specialists',
        verbose_name='Patient'
    )
    
    specialist = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        limit_choices_to={'user_type': 'doctor'},
        related_name='specialist_patients',
        verbose_name='Médecin spécialiste'
    )
    
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='assigned_specialists',
        verbose_name='Assigné par'
    )
    
    reason = models.TextField(
        blank=True,
        null=True,
        verbose_name='Motif de consultation',
        help_text='Raison pour laquelle le patient est référé à ce spécialiste'
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active',
        verbose_name='Statut'
    )
    
    notes = models.TextField(
        blank=True,
        null=True,
        verbose_name='Notes',
        help_text='Notes additionnelles sur le suivi avec le spécialiste'
    )
    
    assigned_at = models.DateTimeField(auto_now_add=True, verbose_name='Date d\'assignation')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Dernière mise à jour')
    
    class Meta:
        db_table = 'patient_specialists'
        verbose_name = 'Spécialiste Patient'
        verbose_name_plural = 'Spécialistes Patients'
        ordering = ['-assigned_at']
        unique_together = ['patient', 'specialist']
    
    def __str__(self):
        return f"{self.patient.full_name} - {self.specialist.full_name} ({self.specialist.get_specialization_display()})"


class PatientMedicalRecord(models.Model):
    """
    Medical records for patients including vital signs and body measurements.
    Doctors fill this information from the doctor space.
    """
    
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='medical_records',
        verbose_name='Patient'
    )
    
    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        limit_choices_to={'user_type': 'doctor'},
        related_name='patient_medical_records',
        verbose_name='Médecin'
    )
    
    # Vital Signs
    systolic_bp = models.PositiveIntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(50), MaxValueValidator(300)],
        verbose_name='Tension systolique (mmHg)'
    )
    diastolic_bp = models.PositiveIntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(30), MaxValueValidator(200)],
        verbose_name='Tension diastolique (mmHg)'
    )
    heart_rate = models.PositiveIntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(30), MaxValueValidator(250)],
        verbose_name='Fréquence cardiaque (bpm)'
    )
    temperature = models.DecimalField(
        max_digits=4, decimal_places=1,
        null=True, blank=True,
        verbose_name='Température (°C)'
    )
    respiratory_rate = models.PositiveIntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(8), MaxValueValidator(60)],
        verbose_name='Fréquence respiratoire (bpm)'
    )
    oxygen_saturation = models.PositiveIntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(70), MaxValueValidator(100)],
        verbose_name='Saturation en oxygène (%)'
    )
    
    # Body Measurements
    weight = models.DecimalField(
        max_digits=5, decimal_places=1,
        null=True, blank=True,
        verbose_name='Poids (kg)'
    )
    height = models.PositiveIntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(50), MaxValueValidator(250)],
        verbose_name='Taille (cm)'
    )
    waist_circumference = models.DecimalField(
        max_digits=5, decimal_places=1,
        null=True, blank=True,
        verbose_name='Tour de taille (cm)'
    )
    
    # Calculated fields
    bmi = models.DecimalField(
        max_digits=4, decimal_places=1,
        null=True, blank=True,
        verbose_name='IMC'
    )
    
    # Status
    health_status = models.CharField(
        max_length=50,
        choices=[
            ('good', 'Bon'),
            ('fair', 'Moyen'),
            ('poor', 'Mauvais'),
        ],
        default='good',
        verbose_name='État général'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    recorded_at = models.DateTimeField(
        auto_now=False,
        null=True,
        blank=True,
        verbose_name='Date de mesure'
    )
    
    class Meta:
        db_table = 'patient_medical_records'
        verbose_name = 'Dossier médical du patient'
        verbose_name_plural = 'Dossiers médicaux des patients'
        ordering = ['-recorded_at', '-created_at']
        indexes = [
            models.Index(fields=['patient', '-recorded_at']),
        ]
    
    def save(self, *args, **kwargs):
        # Calculate BMI if height and weight are provided
        if self.height and self.weight:
            height_m = float(self.height) / 100  # convert cm to m
            self.bmi = round(float(self.weight) / (height_m * height_m), 1)
        else:
            self.bmi = None
        
        # Set recorded_at to now if not provided
        if not self.recorded_at:
            from django.utils import timezone
            self.recorded_at = timezone.now()
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Dossier médical - {self.patient.full_name} ({self.recorded_at.date() if self.recorded_at else 'N/A'})"


class Medicament(models.Model):
    """
    Represents a medication prescribed to a patient.
    Can be added by a doctor or the patient (if self-medication, though usually doctor).
    """
    STATUS_CHOICES = [
        ('active', 'En cours'),
        ('stopped', 'Arrêté'),
        ('completed', 'Terminé'),
    ]

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='medicaments',
        verbose_name='Patient'
    )
    
    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'user_type': 'doctor'},
        related_name='prescribed_medicaments',
        verbose_name='Médecin prescripteur'
    )
    
    name = models.CharField(max_length=200, verbose_name='Nom du médicament')
    dosage = models.CharField(max_length=100, verbose_name='Dosage')
    frequency = models.CharField(max_length=100, verbose_name='Fréquence')
    duration_days = models.PositiveIntegerField(verbose_name='Durée (jours)', blank=True, null=True)
    
    start_date = models.DateField(verbose_name='Date de début')
    end_date = models.DateField(verbose_name='Date de fin', blank=True, null=True)
    
    instructions = models.TextField(verbose_name='Instructions', blank=True, null=True)
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active',
        verbose_name='Statut'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'patient_medicaments'
        verbose_name = 'Médicament'
        verbose_name_plural = 'Médicaments'
        ordering = ['-start_date']
    
    def save(self, *args, **kwargs):
        # Auto-calculate end_date from start_date + duration_days
        if self.duration_days and self.start_date:
            from datetime import timedelta
            self.end_date = self.start_date + timedelta(days=self.duration_days)
        super().save(*args, **kwargs)
    
    @property
    def is_expired(self):
        """Check if the medication has expired based on end_date"""
        from datetime import date
        if self.end_date:
            return date.today() > self.end_date
        return False
    
    def __str__(self):
        return f"{self.name} - {self.patient.full_name}"