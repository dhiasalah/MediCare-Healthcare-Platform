# Heart Disease Prediction Feature

## Overview

This feature implements ML-based heart disease risk assessment for patients using a pre-trained machine learning model. Patients can input their clinical measurements and receive a confidence-scored prediction about their heart disease risk.

## Architecture

### Backend (`backend/health_predictions/`)

#### Models (`models.py`)

- **HeartDiseasePrediction**: Stores prediction records with 13 clinical features
  - Features: age, sex, chest pain type, resting BP, cholesterol, fasting BS, ECG, max HR, exercise angina, ST depression, ST slope, major vessels, thalassemia
  - Stores: prediction (0/1), confidence (0-1), timestamps, patient reference

#### Serializers (`serializers.py`)

- **HeartDiseasePredictionInputSerializer**: Validates incoming clinical data with proper ranges and constraints
- **HeartDiseasePredictionSerializer**: Returns prediction results with formatted display choices

#### Views (`views.py`)

- **HeartDiseasePredictionViewSet**:
  - `predict()`: Main endpoint that processes 13 clinical features, loads ML model, generates prediction with confidence score
  - `my_predictions()`: Returns all predictions for authenticated patient
  - Model Path: `backend/models/heart_dicease_2.pkl`
  - Uses joblib for model loading and numpy for feature array manipulation

#### URLs (`urls.py`)

- Registered with DefaultRouter: `/api/health-predictions/predictions/`
  - `POST /api/health-predictions/predictions/predict/` - Generate new prediction
  - `GET /api/health-predictions/predictions/my_predictions/` - Retrieve patient's prediction history
  - `GET /api/health-predictions/predictions/{id}/` - Get specific prediction

#### Admin (`admin.py`)

- Configured with organized fieldsets for data viewing
- Fieldsets: Patient Information, Clinical Measurements, Cardiac Stress Test, Additional Tests, Prediction Results, Timestamps

### Frontend Components

#### HeartDiseaseForm (`src/components/patient/HeartDiseaseForm.tsx`)

- Comprehensive form with 13 input fields grouped into 3 sections
- **Section 1**: Personal Information (Age, Gender)
- **Section 2**: Cardiac Measurements (Chest Pain Type, BP, Cholesterol, Max HR)
- **Section 3**: Clinical Tests (Fasting BS, ECG, Exercise Angina, ST Depression, ST Slope, Major Vessels, Thalassemia)
- Features:
  - Zod validation schema with proper range and choice constraints
  - React Hook Form integration with error messages
  - Real-time validation with error display
  - Submit button shows loading state during API call
  - Results display with risk level color coding
  - Confidence percentage display
  - Clinical recommendation messages

#### Heart Prediction Page (`src/app/espace-patient/heart-prediction/page.tsx`)

- Wraps HeartDiseaseForm component
- Gradient background styling

#### Navigation Integration

- Added "Prédiction Cardiaque" (Heart Prediction) link to PatientNavigation
- Uses Activity icon for visual identification
- Routes to `/espace-patient/heart-prediction`

#### API Integration (`src/lib/api.ts`)

- `healthPredictionsAPI.predict()`: Send clinical data and receive prediction
- `healthPredictionsAPI.getMyPredictions()`: Fetch prediction history
- `healthPredictionsAPI.getPredictionDetail()`: Get specific prediction details

## Clinical Features Reference

### Feature Specifications

| Feature  | Range   | Type   | Description                                                           |
| -------- | ------- | ------ | --------------------------------------------------------------------- |
| age      | 18-120  | number | Patient age in years                                                  |
| sex      | 0-1     | enum   | 0=Female, 1=Male                                                      |
| cp       | 0-3     | enum   | Chest pain type: 0=Typical, 1=Atypical, 2=Non-anginal, 3=Asymptomatic |
| trestbps | 80-200  | number | Resting blood pressure (mmHg)                                         |
| chol     | 100-400 | number | Serum cholesterol (mg/dL)                                             |
| fbs      | 0-1     | enum   | Fasting blood sugar > 120 mg/dL: 0=No, 1=Yes                          |
| restecg  | 0-2     | enum   | Resting ECG: 0=Normal, 1=ST-T abnormality, 2=LV hypertrophy           |
| thalach  | 60-220  | number | Maximum heart rate achieved (bpm)                                     |
| exang    | 0-1     | enum   | Exercise induced angina: 0=No, 1=Yes                                  |
| oldpeak  | 0-10    | number | ST depression induced by exercise                                     |
| slope    | 0-2     | enum   | ST segment slope: 0=Upsloping, 1=Flat, 2=Downsloping                  |
| ca       | 0-3     | enum   | Number of major vessels colored by fluoroscopy                        |
| thal     | 1,3,6,7 | enum   | Thalassemia result: 3=Normal, 6=Fixed defect, 7=Reversible defect     |

## User Flow

1. **Patient navigates** to "Prédiction Cardiaque" in patient space
2. **Enters clinical data** across 3 organized sections
3. **Form validates** inputs with real-time error feedback
4. **Clicks "Get Prediction"**
5. **Backend loads ML model** and processes 13 features
6. **Returns prediction** (Disease/No Disease) with confidence percentage
7. **UI displays results** with color-coded risk level
8. **Shows clinical recommendation** based on prediction
9. **Saves prediction** to database for history tracking

## Technical Details

### Model Loading

```python
import joblib
import numpy as np

MODEL_PATH = os.path.join(settings.BASE_DIR, 'models', 'heart_dicease_2.pkl')
model = joblib.load(MODEL_PATH)

# Create feature array (1, 13)
features = np.array([age, sex, cp, trestbps, chol, fbs, restecg,
                     thalach, exang, oldpeak, slope, ca, thal]).reshape(1, -1)

# Get prediction and confidence
prediction = model.predict(features)[0]  # 0 or 1
proba = model.predict_proba(features)[0]  # [prob_0, prob_1]
confidence = float(max(proba))  # 0-1
```

### Validation Schema (Zod)

```typescript
const schema = z.object({
  age: z.number().min(18).max(120),
  sex: z.enum(["0", "1"]),
  cp: z.enum(["0", "1", "2", "3"]),
  trestbps: z.number().min(80).max(200),
  chol: z.number().min(100).max(400),
  fbs: z.enum(["0", "1"]),
  restecg: z.enum(["0", "1", "2"]),
  thalach: z.number().min(60).max(220),
  exang: z.enum(["0", "1"]),
  oldpeak: z.number().min(0).max(10),
  slope: z.enum(["0", "1", "2"]),
  ca: z.enum(["0", "1", "2", "3"]),
  thal: z.enum(["1", "3", "6", "7"]),
});
```

## Security & Permissions

- **Authentication**: All endpoints require JWT token
- **Patient Privacy**: Patients can only view their own predictions
- **Doctor Access**: Doctors can view predictions of their assigned patients
- **Admin Access**: Admins can view all predictions
- **Data Validation**: All inputs validated server-side before model processing

## Error Handling

### Frontend

- Real-time validation with error messages under each field
- Form submission disabled if validation fails
- API error messages displayed in alert box
- Loading state during processing

### Backend

- Input serializer validates all 13 features
- HTTP 400 if validation fails
- HTTP 404 if model file not found
- HTTP 401 if user not authenticated

## Files Modified/Created

**Backend:**

- `backend/health_predictions/__init__.py` - App initialization
- `backend/health_predictions/models.py` - HeartDiseasePrediction model
- `backend/health_predictions/serializers.py` - Input/output serializers
- `backend/health_predictions/views.py` - ViewSet with predict endpoint
- `backend/health_predictions/urls.py` - URL routing
- `backend/health_predictions/admin.py` - Django admin
- `backend/health_predictions/apps.py` - App config
- `backend/medical_platform/urls.py` - Added health_predictions route
- `backend/medical_platform/settings.py` - Added health_predictions to INSTALLED_APPS

**Frontend:**

- `src/components/patient/HeartDiseaseForm.tsx` - Main form component
- `src/app/espace-patient/heart-prediction/page.tsx` - Page component
- `src/lib/api.ts` - Added healthPredictionsAPI
- `src/components/PatientNavigation.tsx` - Added navigation link

## Future Enhancements

- [ ] Prediction history with date filtering
- [ ] Export predictions as PDF
- [ ] Risk trend analysis over time
- [ ] Comparison with population averages
- [ ] Integration with appointment booking for follow-up
- [ ] Doctor notifications on high-risk predictions
- [ ] Risk factors explanation for each prediction
