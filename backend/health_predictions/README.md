# Health Predictions & AI Analysis

## Overview

This module implements advanced AI capabilities for the MediCare platform, providing two main features:
1. **Heart Disease Prediction**: A Machine Learning model to assess heart disease risk.
2. **Brain Tumor Segmentation**: A Deep Learning model to identify and segment tumors in MRI scans.

## 1. Heart Disease Prediction

### Architecture
- **Model**: Scikit-learn Classification Model (`heart_dicease_2.pkl`)
- **Input**: 13 clinical features (Age, Sex, CP, Trestbps, Chol, FBS, RestECG, Thalach, Exang, Oldpeak, Slope, CA, Thal)
- **Output**: Binary prediction (Disease/No Disease) + Confidence Score

### API Endpoints
- `POST /predictions/predict/`: Submit clinical data for prediction.
- `GET /predictions/my_predictions/`: Retrieve history for the authenticated patient.

### Clinical Features
| Feature | Description | Range/Values |
|---------|-------------|--------------|
| age | Age in years | 18-120 |
| sex | Biological Sex | 0=Female, 1=Male |
| cp | Chest Pain Type | 0-3 |
| trestbps | Resting Blood Pressure | 80-200 mmHg |
| chol | Serum Cholesterol | 100-400 mg/dL |
| ... | ... | ... |

## 2. Brain Tumor Segmentation

### Architecture
- **Model**: TensorFlow/Keras U-Net style model (`model.keras`)
- **Input**: MRI Image file (JPG, PNG, etc.)
- **Output**: 
    - Segmentation Mask (Base64)
    - Comparison Image (Original + Mask side-by-side)
    - Processing Time

### API Endpoints
- `POST /segmentation/segment/`: Upload an MRI image to receive the segmentation mask.

### Technical Details
- **Image Processing**: Images are resized to 256x256 and normalized before being fed to the model.
- **Post-processing**: The model output is thresholded and converted back to a visual mask.
- **Loss Function**: The model was trained using Dice Loss for optimal segmentation performance.

## 3. Doctor Activity & Stats

### Overview
Tracks the usage of AI tools by doctors to provide insights into their activity.

### API Endpoints
- `GET /activities/recent/`: Get recent activity logs.
- `GET /activities/stats/`: Get daily statistics (consultations, appointments, etc.).

## Setup & Requirements

### Dependencies
- `tensorflow>=2.13.0`
- `scikit-learn>=1.0.0`
- `pandas>=1.3.0`
- `numpy>=1.24.0`
- `joblib>=1.3.0`
- `Pillow`

### Model Files
The following files must be present in `backend/models/`:
1. `heart_dicease_2.pkl`
2. `model.keras`

## Error Handling
- The system gracefully handles missing models (e.g., if TensorFlow is not installed or models are missing), returning 503 Service Unavailable for those specific endpoints while keeping the rest of the API functional.
