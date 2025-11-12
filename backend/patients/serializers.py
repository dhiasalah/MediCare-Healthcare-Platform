from rest_framework import serializers
from .models import Patient, PatientSpecialist, PatientMedicalRecord

class PatientSerializer(serializers.ModelSerializer):
    age = serializers.ReadOnlyField()
    full_name = serializers.ReadOnlyField()
    doctor_name = serializers.CharField(source='doctor.full_name', read_only=True)
    
    class Meta:
        model = Patient
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'email', 'phone',
            'date_of_birth', 'age', 'gender', 'address', 'medical_history',
            'allergies', 'current_medications', 'blood_type',
            'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relation',
            'insurance_provider', 'insurance_number', 'doctor', 'doctor_name',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'age', 'full_name']

class PatientCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = [
            'first_name', 'last_name', 'email', 'phone', 'date_of_birth',
            'gender', 'address', 'medical_history', 'allergies', 'current_medications',
            'blood_type', 'emergency_contact_name', 'emergency_contact_phone',
            'emergency_contact_relation', 'insurance_provider', 'insurance_number'
        ]
    
    def validate_email(self, value):
        """Ensure email is unique"""
        from accounts.models import User
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Un compte avec cet email existe déjà")
        if Patient.objects.filter(email=value).exists():
            raise serializers.ValidationError("Un patient avec cet email existe déjà")
        return value
    
    def create(self, validated_data):
        from accounts.models import User
        import secrets
        
        # Automatically assign the current doctor
        request = self.context.get('request')
        validated_data['doctor'] = request.user
        
        # Create a User account for the patient with a temporary password
        user = User.objects.create(
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            phone=validated_data.get('phone', ''),
            date_of_birth=validated_data.get('date_of_birth'),
            address=validated_data.get('address', ''),
            user_type='patient',
            is_active=True,
            # Mark that password needs to be set
            password_needs_reset=True
        )
        # Set a random temporary password (user must change it on first login)
        temp_password = secrets.token_urlsafe(32)
        user.set_password(temp_password)
        user.save()
        
        # Create the patient record
        return super().create(validated_data)

class PatientListSerializer(serializers.ModelSerializer):
    age = serializers.ReadOnlyField()
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = Patient
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'email', 'phone',
            'date_of_birth', 'age', 'gender', 'address', 'medical_history',
            'allergies', 'emergency_contact_name', 'emergency_contact_phone', 
            'emergency_contact_relation', 'is_active', 'created_at'
        ]


class PatientSpecialistSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    specialist_name = serializers.CharField(source='specialist.full_name', read_only=True)
    specialist_specialization = serializers.CharField(source='specialist.get_specialization_display', read_only=True)
    specialist_email = serializers.EmailField(source='specialist.email', read_only=True)
    specialist_phone = serializers.CharField(source='specialist.phone', read_only=True)
    assigned_by_name = serializers.CharField(source='assigned_by.full_name', read_only=True)
    
    class Meta:
        model = PatientSpecialist
        fields = [
            'id', 'patient', 'patient_name', 'specialist', 'specialist_name',
            'specialist_specialization', 'specialist_email', 'specialist_phone',
            'assigned_by', 'assigned_by_name', 'reason', 'status', 'notes',
            'assigned_at', 'updated_at'
        ]
        read_only_fields = ['id', 'assigned_by', 'assigned_at', 'updated_at']


class AssignSpecialistSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientSpecialist
        fields = ['patient', 'specialist', 'reason', 'notes']
    
    def validate(self, data):
        request = self.context.get('request')
        patient = data.get('patient')
        specialist = data.get('specialist')
        
        # Check if the current user is the primary doctor of the patient
        if patient.primary_doctor != request.user and patient.doctor != request.user:
            raise serializers.ValidationError(
                "Seul le médecin traitant peut assigner des spécialistes à ce patient."
            )
        
        # Check if specialist is actually a doctor
        if specialist.user_type != 'doctor':
            raise serializers.ValidationError("Le spécialiste doit être un médecin.")
        
        # Check if specialist has a specialization
        if not specialist.specialization:
            raise serializers.ValidationError("Le médecin doit avoir une spécialisation.")
        
        # Check if this assignment already exists
        if PatientSpecialist.objects.filter(
            patient=patient, 
            specialist=specialist,
            status='active'
        ).exists():
            raise serializers.ValidationError(
                "Ce patient est déjà assigné à ce spécialiste."
            )
        
        return data
    
    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['assigned_by'] = request.user
        patient_specialist = super().create(validated_data)
        
        # Automatically generate referral PDF
        try:
            from medical_documents.pdf_generator import generate_referral_pdf
            from medical_documents.models import SpecialistReferralPDF
            
            # Generate PDF
            pdf_file = generate_referral_pdf(patient_specialist)
            
            # Create patient summary
            patient = patient_specialist.patient
            patient_summary = f"""
            Patient: {patient.full_name}
            Date de naissance: {patient.date_of_birth}
            Âge: {patient.age} ans
            Sexe: {patient.get_gender_display()}
            """
            
            # Create SpecialistReferralPDF record
            SpecialistReferralPDF.objects.create(
                patient_specialist=patient_specialist,
                pdf_file=pdf_file,
                patient_summary=patient_summary.strip(),
                referral_reason=patient_specialist.reason or "",
                additional_notes=patient_specialist.notes or ""
            )
        except Exception as e:
            # Log the error but don't fail the assignment
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to generate referral PDF: {str(e)}")
        
        return patient_specialist


class PatientMedicalRecordSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    doctor_name = serializers.CharField(source='doctor.full_name', read_only=True)
    
    class Meta:
        model = PatientMedicalRecord
        fields = [
            'id', 'patient', 'patient_name', 'doctor', 'doctor_name',
            'systolic_bp', 'diastolic_bp', 'heart_rate', 'temperature',
            'respiratory_rate', 'oxygen_saturation', 'weight', 'height',
            'waist_circumference', 'bmi', 'health_status', 'recorded_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'doctor', 'doctor_name', 'bmi', 'created_at', 'updated_at']
    
    def validate(self, data):
        """Validate that the doctor is authorized to edit this patient's records"""
        request = self.context.get('request')
        patient = data.get('patient')
        
        if not patient:
            raise serializers.ValidationError("Patient ID is required")
        
        # Check if the current user is authorized to edit this patient's records
        is_primary_doctor = patient.primary_doctor and patient.primary_doctor == request.user
        is_assigned_doctor = patient.doctor and patient.doctor == request.user
        
        if not (is_primary_doctor or is_assigned_doctor):
            raise serializers.ValidationError(
                "Vous n'êtes pas autorisé à mettre à jour les dossiers de ce patient."
            )
        
        return data
    
    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['doctor'] = request.user
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        request = self.context.get('request')
        # Ensure the doctor can only update their own entries
        if instance.doctor != request.user:
            raise serializers.ValidationError(
                "Vous ne pouvez modifier que vos propres entrées."
            )
        return super().update(instance, validated_data)


class PatientMedicalRecordListSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    doctor_name = serializers.CharField(source='doctor.full_name', read_only=True)
    
    class Meta:
        model = PatientMedicalRecord
        fields = [
            'id', 'patient', 'patient_name', 'doctor', 'doctor_name',
            'systolic_bp', 'diastolic_bp', 'heart_rate', 'temperature',
            'respiratory_rate', 'oxygen_saturation', 'weight', 'height',
            'waist_circumference', 'bmi', 'health_status', 'recorded_at'
        ]
        read_only_fields = ['id', 'bmi']
