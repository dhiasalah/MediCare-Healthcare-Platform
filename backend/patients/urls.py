from django.urls import path
from . import views

urlpatterns = [
    # Patient CRUD operations
    path('', views.PatientListCreateView.as_view(), name='patient_list_create'),
    path('<int:pk>/', views.PatientDetailView.as_view(), name='patient_detail'),
    
    # Additional endpoints
    path('search/', views.patient_search, name='patient_search'),
    path('statistics/', views.patient_statistics, name='patient_statistics'),
    
    # Patient self-service endpoints
    path('my-record/', views.get_my_patient_record, name='my_patient_record'),
    path('assign-doctor/', views.assign_doctor, name='assign_doctor'),
    
    # Specialist management endpoints
    path('assign-specialist/', views.assign_specialist, name='assign_specialist'),
    path('<int:patient_id>/specialists/', views.patient_specialists, name='patient_specialists'),
    path('my-specialists/', views.my_specialists, name='my_specialists'),
    path('specialists/<int:specialist_id>/status/', views.update_specialist_status, name='update_specialist_status'),
    path('available-specialists/', views.available_specialists, name='available_specialists'),
    
    # Medical records endpoints
    path('medical-records/', views.PatientMedicalRecordListCreateView.as_view(), name='medical_records_list'),
    path('medical-records/<int:pk>/', views.PatientMedicalRecordDetailView.as_view(), name='medical_record_detail'),
    path('<int:patient_id>/medical-records/latest/', views.patient_latest_medical_record, name='latest_medical_record'),
    path('my-medical-records/', views.my_medical_records, name='my_medical_records'),
    
    # Medicaments endpoints
    path('medicaments/', views.MedicamentListCreateView.as_view(), name='medicament_list_create'),
    path('medicaments/<int:pk>/', views.MedicamentDetailView.as_view(), name='medicament_detail'),
    path('my-medicaments/', views.my_medicaments, name='my_medicaments'),
]