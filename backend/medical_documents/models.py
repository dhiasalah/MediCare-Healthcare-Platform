from django.db import models
from django.conf import settings
from patients.models import Patient, PatientSpecialist
import os


def patient_document_path(instance, filename):
    """Generate file path for patient documents"""
    return f'patient_documents/{instance.patient.id}/{filename}'


def referral_pdf_path(instance, filename):
    """Generate file path for referral PDFs"""
    return f'referral_pdfs/{instance.patient_specialist.patient.id}/{filename}'


class PatientDocument(models.Model):
    """
    Documents uploaded by patients or doctors for medical consultation.
    Can include test results, medical images, prescriptions, etc.
    """
    DOCUMENT_TYPE_CHOICES = [
        ('medical_test', 'Résultat de test médical'),
        ('prescription', 'Ordonnance'),
        ('medical_image', 'Image médicale (radiographie, scanner, etc.)'),
        ('report', 'Rapport médical'),
        ('insurance', 'Document d\'assurance'),
        ('other', 'Autre'),
    ]
    
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='documents',
        verbose_name='Patient'
    )
    
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='uploaded_documents',
        verbose_name='Téléchargé par'
    )
    
    document_type = models.CharField(
        max_length=20,
        choices=DOCUMENT_TYPE_CHOICES,
        verbose_name='Type de document'
    )
    
    title = models.CharField(
        max_length=200,
        verbose_name='Titre'
    )
    
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name='Description'
    )
    
    file = models.FileField(
        upload_to=patient_document_path,
        verbose_name='Fichier'
    )
    
    # Optional: Link to a specific specialist consultation
    related_specialist = models.ForeignKey(
        PatientSpecialist,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='related_documents',
        verbose_name='Spécialiste associé'
    )
    
    is_visible_to_all_doctors = models.BooleanField(
        default=True,
        verbose_name='Visible à tous les médecins',
        help_text='Si coché, tous les médecins du patient peuvent voir ce document'
    )
    
    uploaded_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Date de téléchargement'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Dernière mise à jour'
    )
    
    class Meta:
        db_table = 'patient_documents'
        verbose_name = 'Document Patient'
        verbose_name_plural = 'Documents Patients'
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.title} - {self.patient.full_name}"
    
    @property
    def file_size(self):
        """Return file size in a human-readable format"""
        if self.file:
            size = self.file.size
            for unit in ['B', 'KB', 'MB', 'GB']:
                if size < 1024.0:
                    return f"{size:.1f} {unit}"
                size /= 1024.0
        return "0 B"
    
    @property
    def file_extension(self):
        """Return file extension"""
        if self.file:
            return os.path.splitext(self.file.name)[1].lower()
        return ""


class SpecialistReferralPDF(models.Model):
    """
    PDF documents generated when a primary doctor assigns a specialist to a patient.
    These PDFs contain patient information and referral details.
    """
    patient_specialist = models.OneToOneField(
        PatientSpecialist,
        on_delete=models.CASCADE,
        related_name='referral_pdf',
        verbose_name='Assignation spécialiste'
    )
    
    pdf_file = models.FileField(
        upload_to=referral_pdf_path,
        verbose_name='Fichier PDF'
    )
    
    generated_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Date de génération'
    )
    
    # Store the content that was used to generate the PDF
    patient_summary = models.TextField(
        verbose_name='Résumé patient',
        help_text='Informations du patient incluses dans le PDF'
    )
    
    referral_reason = models.TextField(
        verbose_name='Motif de référence',
        help_text='Raison de la référence au spécialiste'
    )
    
    additional_notes = models.TextField(
        blank=True,
        null=True,
        verbose_name='Notes additionnelles'
    )
    
    class Meta:
        db_table = 'specialist_referral_pdfs'
        verbose_name = 'PDF de Référence Spécialiste'
        verbose_name_plural = 'PDFs de Référence Spécialiste'
        ordering = ['-generated_at']
    
    def __str__(self):
        return f"Référence PDF - {self.patient_specialist}"
