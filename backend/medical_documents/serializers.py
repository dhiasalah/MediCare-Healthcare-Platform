from rest_framework import serializers
from .models import PatientDocument, SpecialistReferralPDF
from patients.models import Patient, PatientSpecialist


class PatientDocumentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.SerializerMethodField()
    file_size = serializers.ReadOnlyField()
    file_extension = serializers.ReadOnlyField()
    file_url = serializers.SerializerMethodField()
    patient_name = serializers.SerializerMethodField()
    specialist_name = serializers.SerializerMethodField()
    
    class Meta:
        model = PatientDocument
        fields = [
            'id',
            'patient',
            'patient_name',
            'uploaded_by',
            'uploaded_by_name',
            'document_type',
            'title',
            'description',
            'file',
            'file_url',
            'file_size',
            'file_extension',
            'related_specialist',
            'specialist_name',
            'is_visible_to_all_doctors',
            'uploaded_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'uploaded_at', 'updated_at', 'file_size', 'file_extension']
    
    def get_uploaded_by_name(self, obj):
        if obj.uploaded_by:
            return f"Dr. {obj.uploaded_by.first_name} {obj.uploaded_by.last_name}"
        return "Patient"
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None
    
    def get_patient_name(self, obj):
        return obj.patient.full_name
    
    def get_specialist_name(self, obj):
        if obj.related_specialist:
            specialist = obj.related_specialist.specialist
            return f"Dr. {specialist.first_name} {specialist.last_name}"
        return None


class PatientDocumentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating documents"""
    
    class Meta:
        model = PatientDocument
        fields = [
            'patient',
            'document_type',
            'title',
            'description',
            'file',
            'related_specialist',
            'is_visible_to_all_doctors',
        ]
    
    def validate_file(self, value):
        """Validate file size and type"""
        # Max file size: 10MB
        max_size = 10 * 1024 * 1024
        if value.size > max_size:
            raise serializers.ValidationError("La taille du fichier ne doit pas dépasser 10 MB.")
        
        # Allowed file types
        allowed_extensions = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.txt']
        file_ext = value.name.split('.')[-1].lower()
        if f'.{file_ext}' not in allowed_extensions:
            raise serializers.ValidationError(
                f"Type de fichier non autorisé. Extensions autorisées: {', '.join(allowed_extensions)}"
            )
        
        return value


class SpecialistReferralPDFSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    specialist_name = serializers.SerializerMethodField()
    assigned_by_name = serializers.SerializerMethodField()
    pdf_url = serializers.SerializerMethodField()
    
    class Meta:
        model = SpecialistReferralPDF
        fields = [
            'id',
            'patient_specialist',
            'patient_name',
            'specialist_name',
            'assigned_by_name',
            'pdf_file',
            'pdf_url',
            'generated_at',
            'patient_summary',
            'referral_reason',
            'additional_notes',
        ]
        read_only_fields = ['id', 'generated_at']
    
    def get_patient_name(self, obj):
        return obj.patient_specialist.patient.full_name
    
    def get_specialist_name(self, obj):
        specialist = obj.patient_specialist.specialist
        return f"Dr. {specialist.first_name} {specialist.last_name}"
    
    def get_assigned_by_name(self, obj):
        if obj.patient_specialist.assigned_by:
            assigned_by = obj.patient_specialist.assigned_by
            return f"Dr. {assigned_by.first_name} {assigned_by.last_name}"
        return None
    
    def get_pdf_url(self, obj):
        if obj.pdf_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.pdf_file.url)
            return obj.pdf_file.url
        return None
