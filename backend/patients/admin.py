from django.contrib import admin
from .models import Patient, PatientMedicalRecord

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'phone', 'age', 'gender', 'doctor', 'is_active', 'created_at']
    list_filter = ['gender', 'is_active', 'doctor', 'created_at']
    search_fields = ['first_name', 'last_name', 'phone', 'email']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Informations personnelles', {
            'fields': ('first_name', 'last_name', 'email', 'phone', 'date_of_birth', 'gender', 'address')
        }),
        ('Informations médicales', {
            'fields': ('medical_history', 'allergies', 'current_medications', 'blood_type')
        }),
        ('Contact d\'urgence', {
            'fields': ('emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relation')
        }),
        ('Assurance', {
            'fields': ('insurance_provider', 'insurance_number')
        }),
        ('Système', {
            'fields': ('doctor', 'is_active')
        }),
    )


@admin.register(PatientMedicalRecord)
class PatientMedicalRecordAdmin(admin.ModelAdmin):
    list_display = ['patient', 'doctor', 'recorded_at', 'temperature', 'heart_rate', 'weight']
    list_filter = ['doctor', 'recorded_at', 'health_status']
    search_fields = ['patient__first_name', 'patient__last_name', 'doctor__first_name']
    date_hierarchy = 'recorded_at'
    readonly_fields = ['bmi', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('patient', 'doctor', 'recorded_at', 'health_status')
        }),
        ('Signes vitaux', {
            'fields': ('systolic_bp', 'diastolic_bp', 'heart_rate', 'temperature', 'respiratory_rate', 'oxygen_saturation')
        }),
        ('Mesures corporelles', {
            'fields': ('weight', 'height', 'waist_circumference', 'bmi')
        }),
        ('Système', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
