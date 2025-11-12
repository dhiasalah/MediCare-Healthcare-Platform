from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Consultation, VitalSigns, Prescription, ConsultationNote,
    ConsultationStatus
)
from appointments.serializers import AppointmentSerializer, UserBasicSerializer

User = get_user_model()

class VitalSignsSerializer(serializers.ModelSerializer):
    recorded_by_name = serializers.CharField(source='recorded_by.get_full_name', read_only=True)
    bmi_status = serializers.SerializerMethodField()
    
    class Meta:
        model = VitalSigns
        fields = [
            'id', 'systolic_bp', 'diastolic_bp', 'heart_rate', 'temperature',
            'respiratory_rate', 'oxygen_saturation', 'weight', 'height', 'bmi',
            'recorded_at', 'recorded_by', 'recorded_by_name', 'bmi_status'
        ]
        read_only_fields = ['recorded_at', 'bmi']
    
    def get_bmi_status(self, obj):
        if obj.bmi:
            bmi = float(obj.bmi)
            if bmi < 18.5:
                return 'Underweight'
            elif 18.5 <= bmi < 25:
                return 'Normal'
            elif 25 <= bmi < 30:
                return 'Overweight'
            else:
                return 'Obese'
        return None
    
    def create(self, validated_data):
        validated_data['recorded_by'] = self.context['request'].user
        return super().create(validated_data)

class PrescriptionSerializer(serializers.ModelSerializer):
    medication_type_display = serializers.CharField(source='get_medication_type_display', read_only=True)
    
    class Meta:
        model = Prescription
        fields = [
            'id', 'medication_name', 'dosage', 'frequency', 'duration',
            'instructions', 'medication_type', 'medication_type_display',
            'quantity', 'is_active', 'created_at'
        ]
        read_only_fields = ['created_at']

class ConsultationNoteSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    note_type_display = serializers.CharField(source='get_note_type_display', read_only=True)
    
    class Meta:
        model = ConsultationNote
        fields = [
            'id', 'note_type', 'note_type_display', 'title', 'content',
            'created_at', 'created_by', 'created_by_name'
        ]
        read_only_fields = ['created_at']
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class ConsultationSerializer(serializers.ModelSerializer):
    # Related data
    appointment_info = AppointmentSerializer(source='appointment', read_only=True)
    patient_info = UserBasicSerializer(source='patient', read_only=True)
    doctor_info = UserBasicSerializer(source='doctor', read_only=True)
    
    # Nested objects
    detailed_vitals = VitalSignsSerializer(many=True, read_only=True)
    detailed_prescriptions = PrescriptionSerializer(many=True, read_only=True)
    notes = ConsultationNoteSerializer(many=True, read_only=True)
    
    # Computed fields
    duration_minutes = serializers.ReadOnlyField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    # Vital signs as JSON (for simple storage)
    vital_signs_summary = serializers.SerializerMethodField()
    
    class Meta:
        model = Consultation
        fields = [
            'id', 'appointment', 'appointment_info', 'patient_info', 'doctor_info',
            'status', 'status_display', 'start_time', 'end_time', 'duration_minutes',
            'chief_complaint', 'history_of_present_illness', 'vital_signs',
            'vital_signs_summary', 'physical_examination', 'assessment', 'diagnosis',
            'treatment_plan', 'prescriptions', 'follow_up_instructions',
            'next_appointment_recommended', 'follow_up_date', 'doctor_notes',
            'detailed_vitals', 'detailed_prescriptions', 'notes',
            'created_at', 'updated_at', 'created_by'
        ]
        read_only_fields = [
            'created_at', 'updated_at', 'duration_minutes', 'patient_info', 
            'doctor_info', 'appointment_info'
        ]
    
    def get_vital_signs_summary(self, obj):
        """Get a formatted summary of vital signs"""
        if not obj.vital_signs:
            return None
        
        summary = []
        vital_mapping = {
            'bp': 'Blood Pressure',
            'hr': 'Heart Rate',
            'temp': 'Temperature',
            'rr': 'Respiratory Rate',
            'spo2': 'SpO2',
            'weight': 'Weight',
            'height': 'Height'
        }
        
        for key, label in vital_mapping.items():
            if key in obj.vital_signs and obj.vital_signs[key]:
                value = obj.vital_signs[key]
                if key == 'bp':
                    summary.append(f"{label}: {value}")
                elif key == 'hr':
                    summary.append(f"{label}: {value} bpm")
                elif key == 'temp':
                    summary.append(f"{label}: {value}°C")
                elif key == 'rr':
                    summary.append(f"{label}: {value}/min")
                elif key == 'spo2':
                    summary.append(f"{label}: {value}%")
                elif key in ['weight', 'height']:
                    unit = 'kg' if key == 'weight' else 'cm'
                    summary.append(f"{label}: {value}{unit}")
        
        return summary
    
    def validate(self, data):
        # Ensure start_time is before end_time
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        
        if start_time and end_time and end_time <= start_time:
            raise serializers.ValidationError("End time must be after start time.")
        
        return data
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class ConsultationCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating consultations"""
    
    class Meta:
        model = Consultation
        fields = [
            'appointment', 'chief_complaint', 'history_of_present_illness',
            'vital_signs'
        ]
    
    def validate_appointment(self, value):
        # Check if consultation already exists for this appointment
        if Consultation.objects.filter(appointment=value).exists():
            raise serializers.ValidationError("A consultation already exists for this appointment.")
        
        # Check if appointment is completed or in progress
        if value.status not in ['confirmed', 'in_progress']:
            raise serializers.ValidationError("Can only create consultation for confirmed or in-progress appointments.")
        
        return value
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        validated_data['status'] = ConsultationStatus.IN_PROGRESS
        return super().create(validated_data)

class ConsultationUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating consultation details"""
    
    class Meta:
        model = Consultation
        fields = [
            'status', 'start_time', 'end_time', 'chief_complaint',
            'history_of_present_illness', 'vital_signs', 'physical_examination',
            'assessment', 'diagnosis', 'treatment_plan', 'prescriptions',
            'follow_up_instructions', 'next_appointment_recommended',
            'follow_up_date', 'doctor_notes'
        ]
    
    def validate_status(self, value):
        # Only doctors can change status to completed
        if (value == ConsultationStatus.COMPLETED and 
            self.context['request'].user.user_type != 'doctor'):
            raise serializers.ValidationError("Only doctors can mark consultations as completed.")
        
        return value

class ConsultationSummarySerializer(serializers.ModelSerializer):
    """Lightweight serializer for consultation lists"""
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)
    doctor_name = serializers.CharField(source='doctor.get_full_name', read_only=True)
    appointment_date = serializers.DateField(source='appointment.time_slot.date', read_only=True)
    appointment_time = serializers.TimeField(source='appointment.time_slot.start_time', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    duration_minutes = serializers.ReadOnlyField()
    
    class Meta:
        model = Consultation
        fields = [
            'id', 'patient_name', 'doctor_name', 'appointment_date',
            'appointment_time', 'status', 'status_display', 'diagnosis',
            'duration_minutes', 'created_at'
        ]