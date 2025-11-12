from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'health_predictions'

router = DefaultRouter()
router.register(r'predictions', views.HeartDiseasePredictionViewSet, basename='prediction')

urlpatterns = [
    path('', include(router.urls)),
]
