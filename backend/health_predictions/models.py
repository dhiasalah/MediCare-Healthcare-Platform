from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class HeartDiseasePrediction(models.Model):
    """Store heart disease predictions for patients"""
    
    patient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='heart_predictions',
        limit_choices_to={'user_type': 'patient'}
    )
    
    # Input features
    age = models.IntegerField(help_text="Age in years")
    sex = models.IntegerField(choices=[(0, 'Female'), (1, 'Male')], help_text="0 = female; 1 = male")
    cp = models.IntegerField(
        choices=[
            (0, 'Typical angina'),
            (1, 'Atypical angina'),
            (2, 'Non-anginal pain'),
            (3, 'Asymptomatic')
        ],
        help_text="Chest pain type"
    )
    trestbps = models.IntegerField(help_text="Resting blood pressure (mm Hg)")
    chol = models.IntegerField(help_text="Serum cholesterol (mg/dl)")
    fbs = models.IntegerField(choices=[(0, 'No'), (1, 'Yes')], help_text="Fasting blood sugar > 120 mg/dl")
    restecg = models.IntegerField(
        choices=[
            (0, 'Nothing to note'),
            (1, 'ST-T Wave abnormality'),
            (2, 'Left ventricular hypertrophy')
        ],
        help_text="Resting electrocardiographic results"
    )
    thalach = models.IntegerField(help_text="Maximum heart rate achieved")
    exang = models.IntegerField(choices=[(0, 'No'), (1, 'Yes')], help_text="Exercise induced angina")
    oldpeak = models.FloatField(help_text="ST depression induced by exercise")
    slope = models.IntegerField(
        choices=[
            (0, 'Upsloping'),
            (1, 'Flatsloping'),
            (2, 'Downsloping')
        ],
        help_text="Slope of peak exercise ST segment"
    )
    ca = models.IntegerField(choices=[(0, '0'), (1, '1'), (2, '2'), (3, '3')], help_text="Number of major vessels (0-3)")
    thal = models.IntegerField(
        choices=[
            (1, 'Normal'),
            (3, 'Normal'),
            (6, 'Fixed defect'),
            (7, 'Reversible defect')
        ],
        help_text="Thalium stress result"
    )
    
    # Prediction result
    prediction = models.IntegerField(choices=[(0, 'No disease'), (1, 'Disease present')], help_text="Prediction result")
    confidence = models.FloatField(help_text="Model confidence score (0-1)")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Heart Disease Prediction"
        verbose_name_plural = "Heart Disease Predictions"
    
    def __str__(self):
        prediction_text = "Disease" if self.prediction == 1 else "No Disease"
        return f"{self.patient.get_full_name()} - {prediction_text} ({self.created_at.date()})"
