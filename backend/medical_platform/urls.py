"""
URL configuration for medical_platform project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

def api_status(request):
    return JsonResponse({
        "status": "success",
        "message": "Medical Platform API is running",
        "version": "1.0.0",
        "endpoints": {
            "authentication": "/api/auth/",
            "patients": "/api/patients/",
            "appointments": "/api/appointments/",
            "consultations": "/api/consultations/",
            "health_predictions": "/api/health-predictions/",
            "admin": "/admin/"
        }
    })

urlpatterns = [
    path('', api_status, name='api-status'),
    path('admin/', admin.site.urls),
    
    # API routes
    path('api/accounts/', include('accounts.urls')),
    path('api/patients/', include('patients.urls')),
    path('api/appointments/', include('appointments.urls')),
    path('api/consultations/', include('consultations.urls')),
    path('api/medical-documents/', include('medical_documents.urls')),
    path('api/health-predictions/', include('health_predictions.urls')),
    # path('api/medical-records/', include('medical_records.urls')),  # TODO: Create medical records app
    # path('api/statistics/', include('statistics.urls')),  # TODO: Create statistics app
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)