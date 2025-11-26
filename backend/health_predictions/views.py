import joblib
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.conf import settings
import os
import warnings
import time

from .models import HeartDiseasePrediction
from .serializers import HeartDiseasePredictionSerializer, HeartDiseasePredictionInputSerializer
from .image_utils import process_image_for_model, postprocess_segmentation, create_comparison_image, image_to_base64
from django.contrib.auth import get_user_model

User = get_user_model()

# Try to import pandas for heart disease prediction
try:
    import pandas as pd
    PANDAS_AVAILABLE = True
except ImportError:
    print("Warning: Pandas not available. Heart disease prediction will not work.")
    PANDAS_AVAILABLE = False

# Try to import numpy for heart disease prediction
try:
    import numpy as np
    NUMPY_AVAILABLE = True
except ImportError:
    print("Warning: NumPy not available. Heart disease prediction will not work.")
    NUMPY_AVAILABLE = False

# Try to import tensorflow for brain tumor segmentation
try:
    import tensorflow as tf
    TENSORFLOW_AVAILABLE = True
    print("✓ TensorFlow imported successfully")
except ImportError as e:
    print(f"✗ TensorFlow import failed: {e}")
    TENSORFLOW_AVAILABLE = False

# Load the pre-trained heart disease model
MODEL_PATH = os.path.join(settings.BASE_DIR, 'models', 'heart_dicease_2.pkl')
try:
    heart_model = joblib.load(MODEL_PATH) if (NUMPY_AVAILABLE and PANDAS_AVAILABLE) else None
except Exception as e:
    print(f"Warning: Could not load heart disease model at {MODEL_PATH}: {e}")
    heart_model = None

# Load the pre-trained brain tumor segmentation model
BRAIN_TUMOR_MODEL_PATH = os.path.join(settings.BASE_DIR, 'models', 'model.keras')
brain_tumor_model = None

print(f"\n=== Brain Tumor Model Loading ===")
print(f"TensorFlow Available: {TENSORFLOW_AVAILABLE}")
print(f"Model Path: {BRAIN_TUMOR_MODEL_PATH}")
print(f"Model Exists: {os.path.exists(BRAIN_TUMOR_MODEL_PATH)}")

try:
    if TENSORFLOW_AVAILABLE and os.path.exists(BRAIN_TUMOR_MODEL_PATH):
        print(f"Attempting to load model from {BRAIN_TUMOR_MODEL_PATH}...")
        # Try loading with custom_objects for dice loss/coef if the model was trained with them
        try:
            brain_tumor_model = tf.keras.models.load_model(
                BRAIN_TUMOR_MODEL_PATH,
                custom_objects={
                    'dice_loss': lambda y_true, y_pred: y_true,  # Placeholder
                    'dice_coef': lambda y_true, y_pred: y_true,  # Placeholder
                }
            )
        except Exception as custom_obj_error:
            print(f"Loading with custom objects failed ({custom_obj_error}), trying standard load...")
            brain_tumor_model = tf.keras.models.load_model(BRAIN_TUMOR_MODEL_PATH)
        
        if brain_tumor_model is not None:
            print(f"✓ Brain tumor model loaded successfully!")
            print(f"  Model input shape: {brain_tumor_model.input_shape}")
            print(f"  Model output shape: {brain_tumor_model.output_shape}")
        else:
            print(f"✗ Model loaded but is None")
    else:
        brain_tumor_model = None
        if not TENSORFLOW_AVAILABLE:
            print("✗ TensorFlow not available. Brain tumor segmentation will not work.")
        else:
            print(f"✗ Brain tumor model not found at {BRAIN_TUMOR_MODEL_PATH}")
except Exception as e:
    print(f"✗ Error loading brain tumor model: {type(e).__name__}: {e}")
    import traceback
    print(traceback.format_exc())
    brain_tumor_model = None

print(f"=== Loading Complete ===\n")

# Model configuration for brain tumor segmentation
BRAIN_TUMOR_CONFIG = {
    "image_size": 256,
    "num_channels": 3,
    "patch_size": 16,
}


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
        if heart_model is None or not (NUMPY_AVAILABLE and PANDAS_AVAILABLE):
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
                
                prediction_result = heart_model.predict(features_array)
                prediction = int(prediction_result[0])
                
                # Get prediction probability
                if hasattr(heart_model, 'predict_proba'):
                    proba = heart_model.predict_proba(features_array)[0]
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


class BrainTumorSegmentationViewSet(viewsets.ViewSet):
    """ViewSet for brain tumor segmentation from RMI/MRI images"""
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)
    
    @action(detail=False, methods=['post'])
    def segment(self, request):
        """
        Perform brain tumor segmentation on an uploaded MRI image.
        
        Expected request:
        - multipart/form-data with 'image' field containing the MRI image file
        
        Returns:
        - segmentation_mask: Base64 encoded segmentation result
        - comparison_image: Base64 encoded side-by-side comparison
        - processing_time: Time taken for segmentation
        """
        if brain_tumor_model is None or not TENSORFLOW_AVAILABLE:
            return Response(
                {"error": "Brain tumor segmentation model not available"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
        # Check if image file is provided
        if 'image' not in request.FILES:
            return Response(
                {"error": "No image file provided. Please upload an image file."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        image_file = request.FILES['image']
        
        # Validate file type
        allowed_extensions = ['jpg', 'jpeg', 'png', 'bmp', 'gif']
        file_ext = image_file.name.split('.')[-1].lower()
        if file_ext not in allowed_extensions:
            return Response(
                {"error": f"Invalid file type. Allowed types: {', '.join(allowed_extensions)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            start_time = time.time()
            
            # Process image - simple resize and normalize
            processed_image, original_image_resized = process_image_for_model(
                image_file, 
                BRAIN_TUMOR_CONFIG
            )
            
            # Run segmentation
            prediction = brain_tumor_model.predict(processed_image, verbose=0)
            
            # Debug: Log prediction statistics
            pred_min = float(np.min(prediction))
            pred_max = float(np.max(prediction))
            pred_mean = float(np.mean(prediction))
            print(f"Prediction statistics: min={pred_min:.4f}, max={pred_max:.4f}, mean={pred_mean:.4f}")
            
            # Postprocess segmentation
            segmentation_mask = postprocess_segmentation(
                prediction, 
                BRAIN_TUMOR_CONFIG
            )
            
            # Create comparison image
            comparison_image = create_comparison_image(
                original_image_resized, 
                segmentation_mask, 
                BRAIN_TUMOR_CONFIG
            )
            
            # Convert images to base64 for JSON response
            mask_base64 = image_to_base64(segmentation_mask)
            comparison_base64 = image_to_base64(comparison_image)
            original_base64 = image_to_base64(original_image_resized)
            
            processing_time = time.time() - start_time
            
            return Response({
                "success": True,
                "message": "Segmentation completed successfully",
                "original_image": original_base64,
                "segmentation_mask": mask_base64,
                "comparison_image": comparison_base64,
                "processing_time": round(processing_time, 2),
                "image_size": BRAIN_TUMOR_CONFIG["image_size"]
            }, status=status.HTTP_200_OK)
        
        except ValueError as e:
            return Response(
                {"error": f"Image processing error: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            import traceback
            print(f"Segmentation error: {traceback.format_exc()}")
            return Response(
                {"error": f"Segmentation failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )





