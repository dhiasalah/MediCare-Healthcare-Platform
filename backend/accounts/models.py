from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    USER_TYPE_CHOICES = [
        ('doctor', 'Médecin'),
        ('patient', 'Patient'),
        ('admin', 'Administrateur'),
    ]
    
    SPECIALIZATION_CHOICES = [
        ('general', 'Médecin Généraliste'),
        ('cardiology', 'Cardiologie'),
        ('dermatology', 'Dermatologie'),
        ('pediatrics', 'Pédiatrie'),
        ('gynecology', 'Gynécologie'),
        ('ophthalmology', 'Ophtalmologie'),
        ('psychiatry', 'Psychiatrie'),
        ('orthopedics', 'Orthopédie'),
        ('neurology', 'Neurologie'),
        ('oncology', 'Oncologie'),
        ('endocrinology', 'Endocrinologie'),
        ('gastroenterology', 'Gastro-entérologie'),
        ('pulmonology', 'Pneumologie'),
        ('nephrology', 'Néphrologie'),
        ('rheumatology', 'Rhumatologie'),
        ('urology', 'Urologie'),
        ('radiology', 'Radiologie'),
        ('anesthesiology', 'Anesthésie'),
        ('emergency', 'Médecine d\'urgence'),
        ('other', 'Autre'),
    ]
    
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES)
    phone = models.CharField(max_length=20, blank=True, null=True, unique=True)
    date_of_birth = models.DateField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    profile_picture = models.CharField(max_length=200, blank=True, null=True, help_text="Profile picture URL")
    
    # Medical-specific fields
    medical_license_number = models.CharField(max_length=50, blank=True, null=True)
    specialization = models.CharField(max_length=100, choices=SPECIALIZATION_CHOICES, blank=True, null=True)
    
    # Patient-specific fields
    medical_history = models.TextField(blank=True, null=True)
    allergies = models.TextField(blank=True, null=True)
    emergency_contact_name = models.CharField(max_length=100, blank=True, null=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True, null=True)
    emergency_contact_relation = models.CharField(max_length=50, blank=True, null=True)
    
    # Password management
    password_needs_reset = models.BooleanField(default=False, help_text="True if user needs to set their password on first login")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.user_type})"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
    
    class Meta:
        db_table = 'users'
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'