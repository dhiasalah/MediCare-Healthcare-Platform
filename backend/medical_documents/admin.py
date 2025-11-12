from django.contrib import admin
from .models import PatientDocument, SpecialistReferralPDF


@admin.register(PatientDocument)
class PatientDocumentAdmin(admin.ModelAdmin):
    list_display = ['title', 'patient', 'document_type', 'uploaded_by', 'uploaded_at']
    list_filter = ['document_type', 'uploaded_at', 'is_visible_to_all_doctors']
    search_fields = ['title', 'patient__first_name', 'patient__last_name', 'description']
    readonly_fields = ['uploaded_at', 'updated_at', 'file_size', 'file_extension']
    
    fieldsets = (
        ('Informations du Document', {
            'fields': ('patient', 'uploaded_by', 'document_type', 'title', 'description')
        }),
        ('Fichier', {
            'fields': ('file', 'file_size', 'file_extension')
        }),
        ('Paramètres', {
            'fields': ('related_specialist', 'is_visible_to_all_doctors')
        }),
        ('Dates', {
            'fields': ('uploaded_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(SpecialistReferralPDF)
class SpecialistReferralPDFAdmin(admin.ModelAdmin):
    list_display = ['patient_specialist', 'generated_at']
    list_filter = ['generated_at']
    search_fields = ['patient_specialist__patient__first_name', 'patient_specialist__patient__last_name']
    readonly_fields = ['generated_at']
    
    fieldsets = (
        ('Référence', {
            'fields': ('patient_specialist', 'pdf_file')
        }),
        ('Contenu', {
            'fields': ('patient_summary', 'referral_reason', 'additional_notes')
        }),
        ('Dates', {
            'fields': ('generated_at',),
            'classes': ('collapse',)
        }),
    )
