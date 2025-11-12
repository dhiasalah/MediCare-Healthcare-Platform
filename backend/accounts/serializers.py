from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'user_type', 'phone', 'date_of_birth', 'address',
            'profile_picture', 'medical_license_number', 'specialization',
            'medical_history', 'allergies', 'emergency_contact_name',
            'emergency_contact_phone', 'emergency_contact_relation', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'full_name']
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        if email and password:
            # Try to find user by email first
            try:
                user = User.objects.get(email=email)
                # Authenticate using the username
                user = authenticate(username=user.username, password=password)
            except User.DoesNotExist:
                user = None
            
            if user:
                if user.is_active:
                    data['user'] = user
                else:
                    raise serializers.ValidationError('Compte utilisateur désactivé.')
            else:
                raise serializers.ValidationError('Email ou mot de passe incorrect.')
        else:
            raise serializers.ValidationError('L\'email et le mot de passe sont requis.')

        return data

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    doctor_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'user_type', 'phone',
            'date_of_birth', 'address', 'medical_license_number',
            'specialization', 'emergency_contact_name', 
            'emergency_contact_phone', 'emergency_contact_relation', 
            'medical_history', 'allergies',
            'doctor_id'
        ]

    def validate(self, data):
        # Check password match
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Les mots de passe ne correspondent pas.'
            })
        
        # Check for unique email
        email = data.get('email')
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({
                'email': 'Un compte avec cet email existe déjà.'
            })
        
        # Check for unique phone number
        phone = data.get('phone')
        if phone and User.objects.filter(phone=phone).exists():
            raise serializers.ValidationError({
                'phone': 'Un compte avec ce numéro de téléphone existe déjà.'
            })
        
        # If user is a patient and doctor_id is provided, validate doctor selection
        if data.get('user_type') == 'patient' and data.get('doctor_id'):
            doctor_id = data.get('doctor_id')
            
            # Check if doctor exists and is active
            try:
                doctor = User.objects.get(id=doctor_id, user_type='doctor', is_active=True)
            except User.DoesNotExist:
                raise serializers.ValidationError({
                    'doctor_id': 'Médecin non trouvé ou inactif.'
                })
            
            # Check if doctor has space (max 4 patients)
            from patients.models import Patient
            patient_count = Patient.objects.filter(doctor=doctor, is_active=True).count()
            if patient_count >= 4:
                raise serializers.ValidationError({
                    'doctor_id': 'Ce médecin a atteint sa capacité maximale de patients.'
                })
            
            data['selected_doctor'] = doctor
        
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        selected_doctor = validated_data.pop('selected_doctor', None)
        doctor_id = validated_data.pop('doctor_id', None)
        
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        
        # If user is a patient, create Patient record
        if user.user_type == 'patient' and selected_doctor:
            from patients.models import Patient
            Patient.objects.create(
                first_name=user.first_name,
                last_name=user.last_name,
                email=user.email,
                phone=user.phone or '',
                date_of_birth=user.date_of_birth or '2000-01-01',
                gender='O',  # Default, can be updated later
                address=user.address or '',
                doctor=selected_doctor,
                medical_history=user.medical_history or '',
                allergies=user.allergies or '',
                emergency_contact_name=user.emergency_contact_name or '',
                emergency_contact_phone=user.emergency_contact_phone or '',
                emergency_contact_relation=user.emergency_contact_relation or 'Non spécifié'
            )
        
        return user

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'user_type', 'phone', 'date_of_birth', 'address',
            'profile_picture', 'medical_license_number', 'specialization',
            'medical_history', 'allergies', 'emergency_contact_name',
            'emergency_contact_phone', 'emergency_contact_relation'
        ]
        read_only_fields = ['id', 'username', 'user_type']