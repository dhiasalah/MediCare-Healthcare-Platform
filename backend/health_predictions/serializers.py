from rest_framework import serializers
from .models import HeartDiseasePrediction
from accounts.models import User


class HeartDiseasePredictionSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)
    prediction_display = serializers.CharField(source='get_prediction_display', read_only=True)
    cp_display = serializers.CharField(source='get_cp_display', read_only=True)
    restecg_display = serializers.CharField(source='get_restecg_display', read_only=True)
    slope_display = serializers.CharField(source='get_slope_display', read_only=True)
    thal_display = serializers.CharField(source='get_thal_display', read_only=True)
    
    class Meta:
        model = HeartDiseasePrediction
        fields = [
            'id', 'patient', 'patient_name', 'age', 'sex', 'cp', 'cp_display',
            'trestbps', 'chol', 'fbs', 'restecg', 'restecg_display', 'thalach',
            'exang', 'oldpeak', 'slope', 'slope_display', 'ca', 'thal', 'thal_display',
            'prediction', 'prediction_display', 'confidence', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'prediction', 'confidence', 'patient', 'created_at', 'updated_at']


class HeartDiseasePredictionInputSerializer(serializers.Serializer):
    """Serializer for receiving prediction input data"""
    age = serializers.IntegerField(min_value=0, max_value=150)
    sex = serializers.IntegerField(min_value=0, max_value=1)
    cp = serializers.IntegerField(min_value=0, max_value=3)
    trestbps = serializers.IntegerField(min_value=0)
    chol = serializers.IntegerField(min_value=0)
    fbs = serializers.IntegerField(min_value=0, max_value=1)
    restecg = serializers.IntegerField(min_value=0, max_value=2)
    thalach = serializers.IntegerField(min_value=0)
    exang = serializers.IntegerField(min_value=0, max_value=1)
    oldpeak = serializers.FloatField(min_value=0)
    slope = serializers.IntegerField(min_value=0, max_value=2)
    ca = serializers.IntegerField(min_value=0, max_value=3)
    thal = serializers.IntegerField(min_value=1, max_value=7)
    
    def validate_thal(self, value):
        """Validate that thal is one of the allowed values"""
        if value not in [1, 3, 6, 7]:
            raise serializers.ValidationError(
                "Thalassemia must be one of: 1 (Normal), 3 (Normal), 6 (Fixed defect), 7 (Reversible defect)"
            )
        return value

