from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import Consultation, VitalSigns, Prescription, ConsultationNote

class VitalSignsInline(admin.TabularInline):
    model = VitalSigns
    extra = 0
    readonly_fields = ['recorded_at', 'bmi']
    fields = [
        'systolic_bp', 'diastolic_bp', 'heart_rate', 'temperature',
        'respiratory_rate', 'oxygen_saturation', 'weight', 'height', 
        'bmi', 'recorded_by', 'recorded_at'
    ]

class PrescriptionInline(admin.TabularInline):
    model = Prescription
    extra = 0
    readonly_fields = ['created_at']
    fields = [
        'medication_name', 'dosage', 'frequency', 'duration',
        'medication_type', 'quantity', 'is_active', 'created_at'
    ]

class ConsultationNoteInline(admin.TabularInline):
    model = ConsultationNote
    extra = 0
    readonly_fields = ['created_at']
    fields = ['note_type', 'title', 'content', 'created_by', 'created_at']

@admin.register(Consultation)
class ConsultationAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'patient_name', 'doctor_name', 'appointment_date',
        'status_badge', 'diagnosis_short', 'duration_display', 'created_at'
    ]
    list_filter = [
        'status', 'appointment__time_slot__date', 'created_at',
        'next_appointment_recommended'
    ]
    search_fields = [
        'appointment__patient__first_name', 'appointment__patient__last_name',
        'appointment__doctor__first_name', 'appointment__doctor__last_name',
        'chief_complaint', 'diagnosis'
    ]
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    readonly_fields = [
        'created_at', 'updated_at', 'duration_minutes', 'patient', 'doctor'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'appointment', 'status', 'start_time', 'end_time',
                'patient', 'doctor', 'duration_minutes'
            )
        }),
        ('Medical Assessment', {
            'fields': (
                'chief_complaint', 'history_of_present_illness',
                'vital_signs', 'physical_examination'
            )
        }),
        ('Diagnosis & Treatment', {
            'fields': (
                'assessment', 'diagnosis', 'treatment_plan', 'prescriptions'
            )
        }),
        ('Follow-up', {
            'fields': (
                'follow_up_instructions', 'next_appointment_recommended',
                'follow_up_date'
            )
        }),
        ('Notes', {
            'fields': ('doctor_notes',),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [VitalSignsInline, PrescriptionInline, ConsultationNoteInline]
    
    def patient_name(self, obj):
        return obj.patient.get_full_name()
    patient_name.short_description = 'Patient'
    patient_name.admin_order_field = 'appointment__patient__last_name'
    
    def doctor_name(self, obj):
        return obj.doctor.get_full_name()
    doctor_name.short_description = 'Doctor'
    doctor_name.admin_order_field = 'appointment__doctor__last_name'
    
    def appointment_date(self, obj):
        return obj.appointment.time_slot.date
    appointment_date.short_description = 'Date'
    appointment_date.admin_order_field = 'appointment__time_slot__date'
    
    def status_badge(self, obj):
        colors = {
            'scheduled': '#007bff',
            'in_progress': '#ffc107',
            'completed': '#28a745',
            'cancelled': '#dc3545'
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 8px; '
            'border-radius: 4px; font-size: 12px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    
    def diagnosis_short(self, obj):
        if obj.diagnosis:
            return obj.diagnosis[:50] + '...' if len(obj.diagnosis) > 50 else obj.diagnosis
        return '-'
    diagnosis_short.short_description = 'Diagnosis'
    
    def duration_display(self, obj):
        duration = obj.duration_minutes
        if duration:
            return f"{duration} min"
        return '-'
    duration_display.short_description = 'Duration'
    
    def patient(self, obj):
        return obj.appointment.patient
    patient.short_description = 'Patient'
    
    def doctor(self, obj):
        return obj.appointment.doctor
    doctor.short_description = 'Doctor'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'appointment__patient', 'appointment__doctor', 
            'appointment__time_slot', 'created_by'
        )

@admin.register(VitalSigns)
class VitalSignsAdmin(admin.ModelAdmin):
    list_display = [
        'consultation_info', 'patient_name', 'blood_pressure', 
        'heart_rate', 'temperature', 'weight', 'bmi', 'recorded_at'
    ]
    list_filter = ['recorded_at', 'consultation__status']
    search_fields = [
        'consultation__appointment__patient__first_name',
        'consultation__appointment__patient__last_name'
    ]
    date_hierarchy = 'recorded_at'
    ordering = ['-recorded_at']
    
    readonly_fields = ['recorded_at', 'bmi']
    
    fieldsets = (
        ('Consultation', {
            'fields': ('consultation', 'recorded_by', 'recorded_at')
        }),
        ('Vital Signs', {
            'fields': (
                ('systolic_bp', 'diastolic_bp'),
                'heart_rate', 'temperature', 'respiratory_rate',
                'oxygen_saturation'
            )
        }),
        ('Physical Measurements', {
            'fields': (('weight', 'height'), 'bmi')
        }),
    )
    
    def consultation_info(self, obj):
        url = reverse('admin:consultations_consultation_change', args=[obj.consultation.id])
        return format_html('<a href="{}">{}</a>', url, obj.consultation.id)
    consultation_info.short_description = 'Consultation'
    
    def patient_name(self, obj):
        return obj.consultation.patient.get_full_name()
    patient_name.short_description = 'Patient'
    
    def blood_pressure(self, obj):
        if obj.systolic_bp and obj.diastolic_bp:
            return f"{obj.systolic_bp}/{obj.diastolic_bp}"
        return '-'
    blood_pressure.short_description = 'Blood Pressure'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'consultation__appointment__patient', 'recorded_by'
        )

@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    list_display = [
        'medication_name', 'consultation_info', 'patient_name',
        'dosage', 'frequency', 'duration', 'medication_type',
        'is_active', 'created_at'
    ]
    list_filter = [
        'medication_type', 'is_active', 'created_at',
        'consultation__status'
    ]
    search_fields = [
        'medication_name', 'consultation__appointment__patient__first_name',
        'consultation__appointment__patient__last_name'
    ]
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Consultation', {
            'fields': ('consultation', 'created_at')
        }),
        ('Medication', {
            'fields': (
                'medication_name', 'medication_type', 'dosage',
                'frequency', 'duration', 'quantity'
            )
        }),
        ('Instructions', {
            'fields': ('instructions', 'is_active')
        }),
    )
    
    def consultation_info(self, obj):
        url = reverse('admin:consultations_consultation_change', args=[obj.consultation.id])
        return format_html('<a href="{}">{}</a>', url, obj.consultation.id)
    consultation_info.short_description = 'Consultation'
    
    def patient_name(self, obj):
        return obj.consultation.patient.get_full_name()
    patient_name.short_description = 'Patient'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'consultation__appointment__patient'
        )

@admin.register(ConsultationNote)
class ConsultationNoteAdmin(admin.ModelAdmin):
    list_display = [
        'title_display', 'consultation_info', 'patient_name',
        'note_type', 'created_by_name', 'created_at'
    ]
    list_filter = ['note_type', 'created_at', 'consultation__status']
    search_fields = [
        'title', 'content', 'consultation__appointment__patient__first_name',
        'consultation__appointment__patient__last_name'
    ]
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Consultation', {
            'fields': ('consultation', 'created_by', 'created_at')
        }),
        ('Note', {
            'fields': ('note_type', 'title', 'content')
        }),
    )
    
    def title_display(self, obj):
        return obj.title or f"{obj.get_note_type_display()} Note"
    title_display.short_description = 'Title'
    
    def consultation_info(self, obj):
        url = reverse('admin:consultations_consultation_change', args=[obj.consultation.id])
        return format_html('<a href="{}">{}</a>', url, obj.consultation.id)
    consultation_info.short_description = 'Consultation'
    
    def patient_name(self, obj):
        return obj.consultation.patient.get_full_name()
    patient_name.short_description = 'Patient'
    
    def created_by_name(self, obj):
        return obj.created_by.get_full_name() if obj.created_by else 'System'
    created_by_name.short_description = 'Created By'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'consultation__appointment__patient', 'created_by'
        )

# Customize admin site headers
admin.site.site_header = "Medical Platform Administration"
admin.site.site_title = "Medical Platform Admin"
admin.site.index_title = "Welcome to Medical Platform Administration"