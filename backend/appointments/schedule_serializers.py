from rest_framework import serializers
from .schedule_models import DoctorWeeklySchedule, DoctorDayOff, DoctorExceptionalSchedule
from accounts.models import User


class DoctorWeeklyScheduleSerializer(serializers.ModelSerializer):
    day_of_week_display = serializers.CharField(source='get_day_of_week_display', read_only=True)
    doctor_name = serializers.CharField(source='doctor.get_full_name', read_only=True)
    
    class Meta:
        model = DoctorWeeklySchedule
        fields = [
            'id',
            'doctor',
            'doctor_name',
            'day_of_week',
            'day_of_week_display',
            'is_available',
            'morning_start',
            'morning_end',
            'afternoon_start',
            'afternoon_end',
            'appointment_duration',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'doctor': {'required': False}  # Doctor is set from context in bulk operations
        }
    
    def validate(self, data):
        """Validate that times make sense - only if is_available is True"""
        # Only validate times if the day is available
        if not data.get('is_available'):
            # If not available, clear any times
            data['morning_start'] = None
            data['morning_end'] = None
            data['afternoon_start'] = None
            data['afternoon_end'] = None
            return data
        
        # From here on, only validate for available days
        # Check morning times
        if data.get('morning_start') and data.get('morning_end'):
            if data['morning_start'] >= data['morning_end']:
                raise serializers.ValidationError(
                    "L'heure de début du matin doit être antérieure à l'heure de fin."
                )
        
        # Check afternoon times
        if data.get('afternoon_start') and data.get('afternoon_end'):
            if data['afternoon_start'] >= data['afternoon_end']:
                raise serializers.ValidationError(
                    "L'heure de début de l'après-midi doit être antérieure à l'heure de fin."
                )
        
        # Check that afternoon starts after morning ends
        if (data.get('morning_end') and data.get('afternoon_start') and 
            data['morning_end'] > data['afternoon_start']):
            raise serializers.ValidationError(
                "L'après-midi doit commencer après la fin de la matinée."
            )
        
        # If available, must have at least one session
        has_morning = data.get('morning_start') and data.get('morning_end')
        has_afternoon = data.get('afternoon_start') and data.get('afternoon_end')
        
        if not has_morning and not has_afternoon:
            raise serializers.ValidationError(
                "Si le jour est disponible, vous devez définir au moins une session (matin ou après-midi)."
            )
        
        return data


class DoctorDayOffSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source='doctor.get_full_name', read_only=True)
    
    class Meta:
        model = DoctorDayOff
        fields = [
            'id',
            'doctor',
            'doctor_name',
            'date',
            'reason',
            'is_full_day',
            'unavailable_start',
            'unavailable_end',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'doctor', 'doctor_name', 'created_at', 'updated_at']
    
    def validate(self, data):
        """Validate day off data"""
        # Check for partial day off
        if not data.get('is_full_day'):
            if not data.get('unavailable_start') or not data.get('unavailable_end'):
                raise serializers.ValidationError(
                    "Pour un congé partiel, vous devez spécifier les heures de début et de fin."
                )
            
            if data['unavailable_start'] >= data['unavailable_end']:
                raise serializers.ValidationError(
                    "L'heure de début doit être antérieure à l'heure de fin."
                )
        
        # Check date is not in the past
        from django.utils import timezone
        if data.get('date') and data['date'] < timezone.now().date():
            raise serializers.ValidationError(
                "Vous ne pouvez pas créer un congé pour une date passée."
            )
        
        return data


class DoctorExceptionalScheduleSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source='doctor.get_full_name', read_only=True)
    
    class Meta:
        model = DoctorExceptionalSchedule
        fields = [
            'id',
            'doctor',
            'doctor_name',
            'date',
            'morning_start',
            'morning_end',
            'afternoon_start',
            'afternoon_end',
            'appointment_duration',
            'reason',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, data):
        """Validate exceptional schedule data"""
        # Check morning times
        if data.get('morning_start') and data.get('morning_end'):
            if data['morning_start'] >= data['morning_end']:
                raise serializers.ValidationError(
                    "L'heure de début du matin doit être antérieure à l'heure de fin."
                )
        
        # Check afternoon times
        if data.get('afternoon_start') and data.get('afternoon_end'):
            if data['afternoon_start'] >= data['afternoon_end']:
                raise serializers.ValidationError(
                    "L'heure de début de l'après-midi doit être antérieure à l'heure de fin."
                )
        
        # Must have at least one session
        has_morning = data.get('morning_start') and data.get('morning_end')
        has_afternoon = data.get('afternoon_start') and data.get('afternoon_end')
        
        if not has_morning and not has_afternoon:
            raise serializers.ValidationError(
                "Vous devez définir au moins une session (matin ou après-midi)."
            )
        
        return data


class BulkWeeklyScheduleSerializer(serializers.Serializer):
    """Serializer for bulk creating/updating weekly schedules"""
    schedules = serializers.ListField(child=serializers.DictField(), allow_empty=False)
    
    def validate_schedules(self, value):
        """Validate each schedule in the list"""
        if not value:
            raise serializers.ValidationError("At least one schedule is required.")
        
        # Validate each schedule item
        for idx, schedule_data in enumerate(value):
            self._validate_schedule_data(schedule_data, idx)
        
        return value
    
    def _validate_schedule_data(self, data, idx):
        """Validate individual schedule data"""
        # Check required fields
        if 'day_of_week' not in data:
            raise serializers.ValidationError({
                'schedules': [f"Item {idx}: day_of_week is required"]
            })
        
        if 'is_available' not in data:
            raise serializers.ValidationError({
                'schedules': [f"Item {idx}: is_available is required"]
            })
        
        is_available = data.get('is_available')
        
        # If not available, times are optional
        if not is_available:
            return
        
        # If available, validate times
        morning_start = data.get('morning_start')
        morning_end = data.get('morning_end')
        afternoon_start = data.get('afternoon_start')
        afternoon_end = data.get('afternoon_end')
        
        # Check morning times if provided
        if morning_start and morning_end:
            if morning_start >= morning_end:
                raise serializers.ValidationError({
                    'schedules': [f"Item {idx}: L'heure de début du matin doit être antérieure à l'heure de fin."]
                })
        
        # Check afternoon times if provided
        if afternoon_start and afternoon_end:
            if afternoon_start >= afternoon_end:
                raise serializers.ValidationError({
                    'schedules': [f"Item {idx}: L'heure de début de l'après-midi doit être antérieure à l'heure de fin."]
                })
        
        # Check that afternoon starts after morning if both exist
        if morning_end and afternoon_start:
            if morning_end > afternoon_start:
                raise serializers.ValidationError({
                    'schedules': [f"Item {idx}: L'après-midi doit commencer après la fin de la matinée."]
                })
        
        # If available, must have at least one session
        has_morning = morning_start and morning_end
        has_afternoon = afternoon_start and afternoon_end
        
        if not has_morning and not has_afternoon:
            raise serializers.ValidationError({
                'schedules': [f"Item {idx}: Vous devez définir au moins une session (matin ou après-midi)."]
            })
    
    def create(self, validated_data):
        schedules_data = validated_data.get('schedules', [])
        doctor = self.context.get('doctor')
        
        if not doctor:
            raise serializers.ValidationError("Doctor context is required.")
        
        created_schedules = []
        for schedule_data in schedules_data:
            # Extract only the fields we care about, excluding doctor
            defaults = {
                'is_available': schedule_data.get('is_available'),
                'morning_start': schedule_data.get('morning_start'),
                'morning_end': schedule_data.get('morning_end'),
                'afternoon_start': schedule_data.get('afternoon_start'),
                'afternoon_end': schedule_data.get('afternoon_end'),
                'appointment_duration': schedule_data.get('appointment_duration', 30),
            }
            
            schedule, created = DoctorWeeklySchedule.objects.update_or_create(
                doctor=doctor,
                day_of_week=schedule_data['day_of_week'],
                defaults=defaults
            )
            created_schedules.append(schedule)
        
        return created_schedules
