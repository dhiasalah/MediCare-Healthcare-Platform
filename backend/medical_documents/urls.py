from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PatientDocumentViewSet, SpecialistReferralPDFViewSet

router = DefaultRouter()
router.register(r'documents', PatientDocumentViewSet, basename='patient-document')
router.register(r'referral-pdfs', SpecialistReferralPDFViewSet, basename='referral-pdf')

urlpatterns = [
    path('', include(router.urls)),
]
