from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import Appointment, TimeSlot, AppointmentHistory

User = get_user_model()

class TimeSlotSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source='doctor.get_full_name', read_only=True)
    doctor_specialization = serializers.CharField(source='doctor.specialization', read_only=True)
    is_past = serializers.SerializerMethodField()
    
    class Meta:
        model = TimeSlot
        fields = [
            'id', 'doctor', 'doctor_name', 'doctor_specialization',
            'date', 'start_time', 'end_time', 'is_available', 
            'duration_minutes', 'is_past', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_is_past(self, obj):
        return obj.is_past_slot()
    
    def validate(self, data):
        # Ensure end_time is after start_time
        if data['end_time'] <= data['start_time']:
            raise serializers.ValidationError("End time must be after start time.")
        
        # Ensure the time slot is in the future
        slot_date = data['date']
        if slot_date < timezone.now().date():
            raise serializers.ValidationError("Cannot create time slots for past dates.")
        
        # Check for overlapping time slots for the same doctor
        doctor = data['doctor']
        start_time = data['start_time']
        end_time = data['end_time']
        date = data['date']
        
        overlapping_slots = TimeSlot.objects.filter(
            doctor=doctor,
            date=date,
            start_time__lt=end_time,
            end_time__gt=start_time
        )
        
        # Exclude current instance if updating
        if self.instance:
            overlapping_slots = overlapping_slots.exclude(pk=self.instance.pk)
        
        if overlapping_slots.exists():
            raise serializers.ValidationError("This time slot overlaps with existing slots.")
        
        return data

class TimeSlotCreateSerializer(serializers.Serializer):
    """Serializer for creating multiple time slots at once"""
    doctor = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(user_type='doctor')
    )
    date = serializers.DateField()
    start_time = serializers.TimeField()
    end_time = serializers.TimeField()
    slot_duration = serializers.IntegerField(default=30, min_value=15, max_value=120)
    
    def validate(self, data):
        if data['end_time'] <= data['start_time']:
            raise serializers.ValidationError("End time must be after start time.")
        
        if data['date'] < timezone.now().date():
            raise serializers.ValidationError("Cannot create time slots for past dates.")
        
        return data
    
    def create_time_slots(self):
        """Create multiple time slots based on duration"""
        validated_data = self.validated_data
        doctor = validated_data['doctor']
        date = validated_data['date']
        start_time = validated_data['start_time']
        end_time = validated_data['end_time']
        duration = validated_data['slot_duration']
        
        slots_created = []
        current_time = timezone.datetime.combine(date, start_time)
        end_datetime = timezone.datetime.combine(date, end_time)
        
        while current_time < end_datetime:
            slot_end_time = current_time + timezone.timedelta(minutes=duration)
            if slot_end_time <= end_datetime:
                time_slot = TimeSlot.objects.create(
                    doctor=doctor,
                    date=date,
                    start_time=current_time.time(),
                    end_time=slot_end_time.time(),
                    duration_minutes=duration
                )
                slots_created.append(time_slot)
            current_time = slot_end_time
        
        return slots_created

class UserBasicSerializer(serializers.ModelSerializer):
    """Basic user info for appointments"""
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'full_name', 'email']

class AppointmentSerializer(serializers.ModelSerializer):
    patient_info = UserBasicSerializer(source='patient', read_only=True)
    doctor_info = UserBasicSerializer(source='doctor', read_only=True)
    time_slot_info = TimeSlotSerializer(source='time_slot', read_only=True)
    appointment_datetime = serializers.ReadOnlyField()
    is_upcoming = serializers.ReadOnlyField()
    is_today = serializers.ReadOnlyField()
    can_cancel = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    consultation_type_display = serializers.CharField(source='get_consultation_type_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'patient_info', 'doctor', 'doctor_info',
            'time_slot', 'time_slot_info', 'consultation_type', 
            'consultation_type_display', 'status', 'status_display',
            'reason_for_visit', 'symptoms', 'priority', 'priority_display',
            'contact_phone', 'patient_notes', 'doctor_notes',
            'appointment_datetime', 'is_upcoming', 'is_today', 'can_cancel',
            'created_at', 'updated_at', 'created_by'
        ]
        read_only_fields = [
            'created_at', 'updated_at', 'created_by', 'doctor_notes',
            'appointment_datetime', 'is_upcoming', 'is_today'
        ]
    
    def get_can_cancel(self, obj):
        return obj.can_be_cancelled()
    
    def validate_time_slot(self, value):
        """Ensure the time slot is available"""
        if not value.is_available:
            raise serializers.ValidationError("This time slot is not available.")
        
        if value.is_past_slot():
            raise serializers.ValidationError("Cannot book appointments for past time slots.")
        
        return value
    
    def validate(self, data):
        # Ensure patient and doctor are different users
        if data.get('patient') == data.get('doctor'):
            raise serializers.ValidationError("Patient and doctor cannot be the same person.")
        
        # Validate time slot belongs to the selected doctor
        time_slot = data.get('time_slot')
        doctor = data.get('doctor')
        
        if time_slot and doctor and time_slot.doctor != doctor:
            raise serializers.ValidationError("Selected time slot does not belong to the specified doctor.")
        
        return data
    
    def create(self, validated_data):
        # Set the user who created the appointment
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class AppointmentCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating appointments"""
    class Meta:
        model = Appointment
        fields = [
            'patient', 'doctor', 'time_slot', 'consultation_type',
            'reason_for_visit', 'symptoms', 'priority', 'contact_phone',
            'patient_notes'
        ]
    
    def validate_time_slot(self, value):
        if not value.is_available:
            raise serializers.ValidationError("This time slot is not available.")
        
        if value.is_past_slot():
            raise serializers.ValidationError("Cannot book appointments for past time slots.")
        
        return value
    
    def validate(self, data):
        if data.get('patient') == data.get('doctor'):
            raise serializers.ValidationError("Patient and doctor cannot be the same person.")
        
        time_slot = data.get('time_slot')
        doctor = data.get('doctor')
        
        if time_slot and doctor and time_slot.doctor != doctor:
            raise serializers.ValidationError("Selected time slot does not belong to the specified doctor.")
        
        return data

class AppointmentUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating appointment details"""
    class Meta:
        model = Appointment
        fields = [
            'consultation_type', 'status', 'reason_for_visit', 'symptoms',
            'priority', 'contact_phone', 'patient_notes', 'doctor_notes'
        ]
    
    def validate_status(self, value):
        # Prevent changing status to scheduled if appointment is in the past
        if (value == 'scheduled' and 
            self.instance and 
            not self.instance.is_upcoming):
            raise serializers.ValidationError("Cannot reschedule past appointments.")
        
        return value

class AppointmentHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source='changed_by.get_full_name', read_only=True)
    
    class Meta:
        model = AppointmentHistory
        fields = [
            'id', 'appointment', 'changed_by', 'changed_by_name',
            'change_type', 'old_status', 'new_status', 'notes', 'timestamp'
        ]
        read_only_fields = ['timestamp']

class DoctorAvailabilitySerializer(serializers.Serializer):
    """Serializer for checking doctor availability"""
    doctor_id = serializers.IntegerField()
    date = serializers.DateField()
    
    def validate_date(self, value):
        if value < timezone.now().date():
            raise serializers.ValidationError("Cannot check availability for past dates.")
        return value

class AppointmentStatsSerializer(serializers.Serializer):
    """Serializer for appointment statistics"""
    total_appointments = serializers.IntegerField()
    scheduled_appointments = serializers.IntegerField()
    completed_appointments = serializers.IntegerField()
    cancelled_appointments = serializers.IntegerField()
    today_appointments = serializers.IntegerField()
    upcoming_appointments = serializers.IntegerField()
    
    # Monthly statistics
    this_month_total = serializers.IntegerField()
    last_month_total = serializers.IntegerField()
    
    # Popular time slots
    popular_time_slots = serializers.ListField(
        child=serializers.DictField(),
        read_only=True
    )