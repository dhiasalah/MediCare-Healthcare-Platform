from rest_framework import permissions

class IsPatientOrDoctor(permissions.BasePermission):
    """
    Permission to only allow patients and doctors to access certain views.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.user_type in ['patient', 'doctor']
        )

class IsDoctor(permissions.BasePermission):
    """
    Permission to only allow doctors to access certain views.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.user_type == 'doctor'
        )

class IsPatient(permissions.BasePermission):
    """
    Permission to only allow patients to access certain views.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.user_type == 'patient'
        )

class IsAppointmentParticipant(permissions.BasePermission):
    """
    Permission to only allow appointment participants (patient or doctor) to access appointment details.
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Allow access if user is the patient or doctor of the appointment
        return (
            obj.patient == request.user or 
            obj.doctor == request.user or
            request.user.user_type == 'admin'
        )

class IsTimeSlotOwner(permissions.BasePermission):
    """
    Permission to only allow doctors to manage their own time slots.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.user_type == 'doctor'
        )
    
    def has_object_permission(self, request, view, obj):
        # Allow access if user is the doctor who owns the time slot
        return obj.doctor == request.user or request.user.user_type == 'admin'

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the object.
        return obj.created_by == request.user or request.user.user_type == 'admin'

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permission to only allow admins to write, others can only read.
    """
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.user_type == 'admin'
        )

class IsDoctorOrReadOnly(permissions.BasePermission):
    """
    Permission to only allow doctors to write, others can only read.
    """
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.user_type == 'doctor'
        )