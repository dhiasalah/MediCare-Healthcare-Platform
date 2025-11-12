import joblib
import numpy as np
import pandas as pd
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from django.core.files.storage import default_storage
import os
import warnings

from .models import HeartDiseasePrediction
from .serializers import HeartDiseasePredictionSerializer, HeartDiseasePredictionInputSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

# Load the pre-trained model
MODEL_PATH = os.path.join(settings.BASE_DIR, 'models', 'heart_dicease_2.pkl')
try:
    model = joblib.load(MODEL_PATH)
except Exception as e:
    print(f"Warning: Could not load model at {MODEL_PATH}: {e}")
    model = None


class HeartDiseasePredictionViewSet(viewsets.ModelViewSet):
    """ViewSet for heart disease predictions"""
    queryset = HeartDiseasePrediction.objects.all()
    serializer_class = HeartDiseasePredictionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Patients only see their own predictions"""
        user = self.request.user
        if user.user_type == 'patient':
            return HeartDiseasePrediction.objects.filter(patient=user)
        elif user.user_type == 'doctor':
            # Doctors can see predictions of their patients
            return HeartDiseasePrediction.objects.filter(patient__in=user.patients.all())
        # Admins see all
        return HeartDiseasePrediction.objects.all()
    
    @action(detail=False, methods=['post'])
    def predict(self, request):
        """
        Make a prediction for heart disease based on patient data
        
        Expected payload:
        {
            "age": <int>,
            "sex": <0 or 1>,
            "cp": <0-3>,
            "trestbps": <int>,
            "chol": <int>,
            "fbs": <0 or 1>,
            "restecg": <0-2>,
            "thalach": <int>,
            "exang": <0 or 1>,
            "oldpeak": <float>,
            "slope": <0-2>,
            "ca": <0-3>,
            "thal": <1, 3, 6, or 7>
        }
        """
        if model is None:
            return Response(
                {"error": "Model not available"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
        # Validate input data
        input_serializer = HeartDiseasePredictionInputSerializer(data=request.data)
        if not input_serializer.is_valid():
            return Response(input_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        validated_data = input_serializer.validated_data
        
        # Prepare features as a DataFrame with proper column names
        # Feature names must match what the model was trained with
        feature_names = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 
                         'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal']
        
        features_dict = {
            'age': [validated_data['age']],
            'sex': [validated_data['sex']],
            'cp': [validated_data['cp']],
            'trestbps': [validated_data['trestbps']],
            'chol': [validated_data['chol']],
            'fbs': [validated_data['fbs']],
            'restecg': [validated_data['restecg']],
            'thalach': [validated_data['thalach']],
            'exang': [validated_data['exang']],
            'oldpeak': [validated_data['oldpeak']],
            'slope': [validated_data['slope']],
            'ca': [validated_data['ca']],
            'thal': [validated_data['thal']]
        }
        
        # Create DataFrame with feature names
        features_df = pd.DataFrame(features_dict)
        
        try:
            # Suppress the sklearn warning about feature names
            with warnings.catch_warnings():
                warnings.simplefilter("ignore")
                # Make prediction - pass as numpy array in correct order
                features_array = np.array([[
                    validated_data['age'],
                    validated_data['sex'],
                    validated_data['cp'],
                    validated_data['trestbps'],
                    validated_data['chol'],
                    validated_data['fbs'],
                    validated_data['restecg'],
                    validated_data['thalach'],
                    validated_data['exang'],
                    validated_data['oldpeak'],
                    validated_data['slope'],
                    validated_data['ca'],
                    validated_data['thal']
                ]], dtype=np.float64)
                
                prediction_result = model.predict(features_array)
                prediction = int(prediction_result[0])
                
                # Get prediction probability
                if hasattr(model, 'predict_proba'):
                    proba = model.predict_proba(features_array)[0]
                    # proba[0] = probability of class 0 (no disease)
                    # proba[1] = probability of class 1 (disease)
                    confidence = float(proba[prediction])
                else:
                    confidence = 1.0 if prediction == 1 else 0.0
            
            # Save prediction to database
            heart_prediction = HeartDiseasePrediction.objects.create(
                patient=request.user,
                age=validated_data['age'],
                sex=validated_data['sex'],
                cp=validated_data['cp'],
                trestbps=validated_data['trestbps'],
                chol=validated_data['chol'],
                fbs=validated_data['fbs'],
                restecg=validated_data['restecg'],
                thalach=validated_data['thalach'],
                exang=validated_data['exang'],
                oldpeak=validated_data['oldpeak'],
                slope=validated_data['slope'],
                ca=validated_data['ca'],
                thal=validated_data['thal'],
                prediction=prediction,
                confidence=confidence
            )
            
            # Serialize and return the result
            serializer = HeartDiseasePredictionSerializer(heart_prediction)
            return Response({
                "success": True,
                "message": "Prediction completed successfully",
                "prediction": serializer.data
            }, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response(
                {"error": f"Prediction failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def my_predictions(self, request):
        """Get all predictions for the current patient"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
