from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'consultations'

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'consultations', views.ConsultationViewSet, basename='consultation')

urlpatterns = [
    # Include the router URLs
    path('api/', include(router.urls)),
    
    # Nested resources (manual URL patterns)
    path('api/consultations/<int:consultation_pk>/vital-signs/', 
         views.VitalSignsViewSet.as_view({'get': 'list', 'post': 'create'}), 
         name='consultation-vital-signs-list'),
    path('api/consultations/<int:consultation_pk>/vital-signs/<int:pk>/', 
         views.VitalSignsViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), 
         name='consultation-vital-signs-detail'),
    
    path('api/consultations/<int:consultation_pk>/prescriptions/', 
         views.PrescriptionViewSet.as_view({'get': 'list', 'post': 'create'}), 
         name='consultation-prescriptions-list'),
    path('api/consultations/<int:consultation_pk>/prescriptions/<int:pk>/', 
         views.PrescriptionViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), 
         name='consultation-prescriptions-detail'),
    
    path('api/consultations/<int:consultation_pk>/notes/', 
         views.ConsultationNoteViewSet.as_view({'get': 'list', 'post': 'create'}), 
         name='consultation-notes-list'),
    path('api/consultations/<int:consultation_pk>/notes/<int:pk>/', 
         views.ConsultationNoteViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), 
         name='consultation-notes-detail'),
    
    # Custom API endpoints
    path('api/statistics/', views.consultation_statistics, name='consultation-statistics'),
    path('api/patients/<int:patient_id>/consultations/', views.patient_consultations, name='patient-consultations'),
    path('api/today/', views.today_consultations, name='today-consultations'),
]