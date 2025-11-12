from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .schedule_views import (
    DoctorWeeklyScheduleViewSet,
    DoctorDayOffViewSet,
    DoctorExceptionalScheduleViewSet
)

app_name = 'appointments'

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'appointments', views.AppointmentViewSet, basename='appointment')
router.register(r'time-slots', views.TimeSlotViewSet, basename='timeslot')
router.register(r'weekly-schedules', DoctorWeeklyScheduleViewSet, basename='weekly-schedule')
router.register(r'days-off', DoctorDayOffViewSet, basename='day-off')
router.register(r'exceptional-schedules', DoctorExceptionalScheduleViewSet, basename='exceptional-schedule')

urlpatterns = [
    # Include the router URLs
    path('', include(router.urls)),
    
    # Custom API endpoints
    path('doctor-availability/', views.doctor_availability, name='doctor-availability'),
    path('statistics/', views.appointment_statistics, name='statistics'),
    path('upcoming/', views.upcoming_appointments, name='upcoming'),
    path('today/', views.today_appointments, name='today'),
    path('appointments/<int:appointment_id>/history/', 
         views.AppointmentHistoryListView.as_view(), 
         name='appointment-history'),
]