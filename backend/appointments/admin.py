from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Appointment, TimeSlot, AppointmentHistory
from .schedule_models import DoctorWeeklySchedule, DoctorDayOff, DoctorExceptionalSchedule

@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display = [
        'doctor_name', 'date', 'start_time', 'end_time', 
        'duration_minutes', 'is_available', 'has_appointment'
    ]
    list_filter = ['date', 'is_available', 'doctor', 'duration_minutes']
    search_fields = ['doctor__first_name', 'doctor__last_name', 'doctor__email']
    date_hierarchy = 'date'
    ordering = ['-date', 'start_time']
    
    def doctor_name(self, obj):
        return obj.doctor.get_full_name()
    doctor_name.short_description = 'Doctor'
    doctor_name.admin_order_field = 'doctor__last_name'
    
    def has_appointment(self, obj):
        if hasattr(obj, 'appointment'):
            return format_html(
                '<span style="color: #ffc107;">Yes</span>'
            )
        return format_html(
            '<span style="color: #28a745;">No</span>'
        )
    has_appointment.short_description = 'Has Appointment'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('doctor')

class AppointmentHistoryInline(admin.TabularInline):
    model = AppointmentHistory
    extra = 0
    readonly_fields = ['timestamp', 'changed_by', 'change_type', 'old_status', 'new_status']
    can_delete = False
    
    def has_add_permission(self, request, obj=None):
        return False

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'patient_name', 'doctor_name', 'appointment_date', 
        'appointment_time', 'status_badge', 'consultation_type', 
        'priority_badge', 'created_at'
    ]
    list_filter = [
        'status', 'consultation_type', 'priority', 
        'time_slot__date', 'created_at'
    ]
    search_fields = [
        'patient__first_name', 'patient__last_name', 'patient__email',
        'doctor__first_name', 'doctor__last_name', 'doctor__email',
        'reason_for_visit'
    ]
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    readonly_fields = ['created_at', 'updated_at', 'appointment_datetime', 'is_upcoming']
    
    fieldsets = (
        ('Appointment Details', {
            'fields': (
                'patient', 'doctor', 'time_slot', 'status', 
                'consultation_type', 'priority'
            )
        }),
        ('Medical Information', {
            'fields': (
                'reason_for_visit', 'symptoms', 'patient_notes', 'doctor_notes'
            )
        }),
        ('Contact Information', {
            'fields': ('contact_phone',)
        }),
        ('Metadata', {
            'fields': (
                'created_by', 'created_at', 'updated_at', 
                'appointment_datetime', 'is_upcoming'
            ),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [AppointmentHistoryInline]
    
    def patient_name(self, obj):
        return obj.patient.get_full_name()
    patient_name.short_description = 'Patient'
    patient_name.admin_order_field = 'patient__last_name'
    
    def doctor_name(self, obj):
        return obj.doctor.get_full_name()
    doctor_name.short_description = 'Doctor'
    doctor_name.admin_order_field = 'doctor__last_name'
    
    def appointment_date(self, obj):
        return obj.time_slot.date
    appointment_date.short_description = 'Date'
    appointment_date.admin_order_field = 'time_slot__date'
    
    def appointment_time(self, obj):
        return f"{obj.time_slot.start_time} - {obj.time_slot.end_time}"
    appointment_time.short_description = 'Time'
    
    def status_badge(self, obj):
        colors = {
            'scheduled': '#007bff',
            'confirmed': '#28a745',
            'in_progress': '#ffc107',
            'completed': '#6c757d',
            'cancelled': '#dc3545',
            'no_show': '#fd7e14'
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 8px; '
            'border-radius: 4px; font-size: 12px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    
    def priority_badge(self, obj):
        colors = {
            'low': '#28a745',
            'medium': '#ffc107', 
            'high': '#fd7e14',
            'urgent': '#dc3545'
        }
        color = colors.get(obj.priority, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 6px; '
            'border-radius: 3px; font-size: 11px;">{}</span>',
            color, obj.get_priority_display().upper()
        )
    priority_badge.short_description = 'Priority'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'patient', 'doctor', 'time_slot', 'created_by'
        )
    
    actions = ['mark_as_confirmed', 'mark_as_completed', 'mark_as_cancelled']
    
    def mark_as_confirmed(self, request, queryset):
        updated = queryset.filter(status='scheduled').update(status='confirmed')
        self.message_user(
            request, 
            f'{updated} appointments marked as confirmed.'
        )
        
        # Create history entries
        for appointment in queryset.filter(status='confirmed'):
            AppointmentHistory.objects.create(
                appointment=appointment,
                changed_by=request.user,
                change_type='updated',
                old_status='scheduled',
                new_status='confirmed',
                notes='Bulk action: marked as confirmed by admin'
            )
    mark_as_confirmed.short_description = 'Mark selected appointments as confirmed'
    
    def mark_as_completed(self, request, queryset):
        updated = queryset.exclude(status__in=['completed', 'cancelled']).update(status='completed')
        self.message_user(
            request, 
            f'{updated} appointments marked as completed.'
        )
        
        # Create history entries
        for appointment in queryset.filter(status='completed'):
            AppointmentHistory.objects.create(
                appointment=appointment,
                changed_by=request.user,
                change_type='completed',
                new_status='completed',
                notes='Bulk action: marked as completed by admin'
            )
    mark_as_completed.short_description = 'Mark selected appointments as completed'
    
    def mark_as_cancelled(self, request, queryset):
        updated = queryset.exclude(status='cancelled').update(status='cancelled')
        self.message_user(
            request, 
            f'{updated} appointments marked as cancelled.'
        )
        
        # Create history entries  
        for appointment in queryset.filter(status='cancelled'):
            AppointmentHistory.objects.create(
                appointment=appointment,
                changed_by=request.user,
                change_type='cancelled',
                new_status='cancelled',
                notes='Bulk action: marked as cancelled by admin'
            )
    mark_as_cancelled.short_description = 'Mark selected appointments as cancelled'

@admin.register(AppointmentHistory)
class AppointmentHistoryAdmin(admin.ModelAdmin):
    list_display = [
        'appointment_id', 'patient_name', 'doctor_name', 
        'change_type', 'old_status', 'new_status', 
        'changed_by_name', 'timestamp'
    ]
    list_filter = ['change_type', 'old_status', 'new_status', 'timestamp']
    search_fields = [
        'appointment__patient__first_name', 'appointment__patient__last_name',
        'appointment__doctor__first_name', 'appointment__doctor__last_name',
        'changed_by__first_name', 'changed_by__last_name'
    ]
    date_hierarchy = 'timestamp'
    ordering = ['-timestamp']
    readonly_fields = ['timestamp']
    
    def appointment_id(self, obj):
        url = reverse('admin:appointments_appointment_change', args=[obj.appointment.id])
        return format_html('<a href="{}">{}</a>', url, obj.appointment.id)
    appointment_id.short_description = 'Appointment ID'
    
    def patient_name(self, obj):
        return obj.appointment.patient.get_full_name()
    patient_name.short_description = 'Patient'
    
    def doctor_name(self, obj):
        return obj.appointment.doctor.get_full_name()
    doctor_name.short_description = 'Doctor'
    
    def changed_by_name(self, obj):
        return obj.changed_by.get_full_name() if obj.changed_by else 'System'
    changed_by_name.short_description = 'Changed By'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'appointment__patient', 'appointment__doctor', 'changed_by'
        )
    
    def has_add_permission(self, request):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(DoctorWeeklySchedule)
class DoctorWeeklyScheduleAdmin(admin.ModelAdmin):
    list_display = [
        'doctor_name', 'day_of_week_display', 'is_available',
        'morning_hours', 'afternoon_hours', 'appointment_duration'
    ]
    list_filter = ['is_available', 'day_of_week', 'appointment_duration']
    search_fields = ['doctor__first_name', 'doctor__last_name', 'doctor__email']
    ordering = ['doctor', 'day_of_week']
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('doctor', 'day_of_week', 'is_available', 'appointment_duration')
        }),
        ('Session du matin', {
            'fields': ('morning_start', 'morning_end'),
            'classes': ('collapse',)
        }),
        ('Session de l\'après-midi', {
            'fields': ('afternoon_start', 'afternoon_end'),
            'classes': ('collapse',)
        }),
    )
    
    def doctor_name(self, obj):
        return obj.doctor.get_full_name()
    doctor_name.short_description = 'Médecin'
    doctor_name.admin_order_field = 'doctor__last_name'
    
    def day_of_week_display(self, obj):
        return obj.get_day_of_week_display()
    day_of_week_display.short_description = 'Jour'
    
    def morning_hours(self, obj):
        if obj.morning_start and obj.morning_end:
            return f"{obj.morning_start.strftime('%H:%M')} - {obj.morning_end.strftime('%H:%M')}"
        return "-"
    morning_hours.short_description = 'Matin'
    
    def afternoon_hours(self, obj):
        if obj.afternoon_start and obj.afternoon_end:
            return f"{obj.afternoon_start.strftime('%H:%M')} - {obj.afternoon_end.strftime('%H:%M')}"
        return "-"
    afternoon_hours.short_description = 'Après-midi'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('doctor')


@admin.register(DoctorDayOff)
class DoctorDayOffAdmin(admin.ModelAdmin):
    list_display = [
        'doctor_name', 'date', 'is_full_day', 'reason', 'unavailable_hours'
    ]
    list_filter = ['is_full_day', 'date']
    search_fields = ['doctor__first_name', 'doctor__last_name', 'reason']
    date_hierarchy = 'date'
    ordering = ['-date']
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('doctor', 'date', 'is_full_day', 'reason')
        }),
        ('Absence partielle', {
            'fields': ('unavailable_start', 'unavailable_end'),
            'classes': ('collapse',),
            'description': 'Remplissez ces champs uniquement pour une absence partielle'
        }),
    )
    
    def doctor_name(self, obj):
        return obj.doctor.get_full_name()
    doctor_name.short_description = 'Médecin'
    doctor_name.admin_order_field = 'doctor__last_name'
    
    def unavailable_hours(self, obj):
        if obj.is_full_day:
            return "Toute la journée"
        if obj.unavailable_start and obj.unavailable_end:
            return f"{obj.unavailable_start.strftime('%H:%M')} - {obj.unavailable_end.strftime('%H:%M')}"
        return "-"
    unavailable_hours.short_description = 'Heures indisponibles'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('doctor')


@admin.register(DoctorExceptionalSchedule)
class DoctorExceptionalScheduleAdmin(admin.ModelAdmin):
    list_display = [
        'doctor_name', 'date', 'morning_hours', 'afternoon_hours',
        'appointment_duration', 'reason'
    ]
    list_filter = ['date', 'appointment_duration']
    search_fields = ['doctor__first_name', 'doctor__last_name', 'reason']
    date_hierarchy = 'date'
    ordering = ['-date']
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('doctor', 'date', 'appointment_duration', 'reason')
        }),
        ('Session du matin', {
            'fields': ('morning_start', 'morning_end'),
            'classes': ('collapse',)
        }),
        ('Session de l\'après-midi', {
            'fields': ('afternoon_start', 'afternoon_end'),
            'classes': ('collapse',)
        }),
    )
    
    def doctor_name(self, obj):
        return obj.doctor.get_full_name()
    doctor_name.short_description = 'Médecin'
    doctor_name.admin_order_field = 'doctor__last_name'
    
    def morning_hours(self, obj):
        if obj.morning_start and obj.morning_end:
            return f"{obj.morning_start.strftime('%H:%M')} - {obj.morning_end.strftime('%H:%M')}"
        return "-"
    morning_hours.short_description = 'Matin'
    
    def afternoon_hours(self, obj):
        if obj.afternoon_start and obj.afternoon_end:
            return f"{obj.afternoon_start.strftime('%H:%M')} - {obj.afternoon_end.strftime('%H:%M')}"
        return "-"
    afternoon_hours.short_description = 'Après-midi'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('doctor')
    
    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser