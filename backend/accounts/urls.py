from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Authentication endpoints
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('logout/', views.logout_view, name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Profile endpoints
    path('me/', views.profile_view, name='current_user'),  # Alias for profile
    path('profile/', views.profile_view, name='profile'),
    path('profile/update/', views.update_profile_view, name='update_profile'),
    
    # Password management
    path('set-initial-password/', views.set_initial_password, name='set_initial_password'),
    path('set-password-first-time/', views.set_password_first_time, name='set_password_first_time'),
    path('check-email/', views.check_email_exists, name='check_email'),
    
    # Doctors list
    path('doctors/', views.DoctorListView.as_view(), name='doctors_list'),
    path('doctors/available/', views.available_doctors_view, name='available_doctors'),
]