"""
Utility functions to generate available time slots dynamically from doctor's schedule.
This avoids needing to pre-generate and store TimeSlot records.
"""
from datetime import datetime, timedelta, time
from django.utils import timezone
from .schedule_models import DoctorWeeklySchedule, DoctorDayOff, DoctorExceptionalSchedule


def get_available_slots(doctor, start_date=None, end_date=None, days_ahead=30):
    """
    Generate available time slots for a doctor based on their schedule.
    
    Args:
        doctor: User object (doctor)
        start_date: Start date (default: today)
        end_date: End date (default: start_date + days_ahead)
        days_ahead: Number of days to generate slots for
        
    Returns:
        List of dictionaries with available slots
    """
    if start_date is None:
        start_date = timezone.now().date()
    
    if end_date is None:
        end_date = start_date + timedelta(days=days_ahead)
    
    available_slots = []
    
    # Get doctor's weekly schedules
    weekly_schedules = DoctorWeeklySchedule.objects.filter(
        doctor=doctor,
        is_available=True
    )
    
    if not weekly_schedules.exists():
        return []
    
    # Get doctor's day-offs and exceptional schedules
    day_offs = DoctorDayOff.objects.filter(doctor=doctor)
    exceptional_schedules = DoctorExceptionalSchedule.objects.filter(doctor=doctor)
    
    # Get booked appointments to mark slots as unavailable
    from .models import Appointment
    booked_slots = Appointment.objects.filter(
        doctor=doctor,
        status__in=['scheduled', 'confirmed', 'in_progress']
    ).values_list('time_slot__id', flat=True)
    
    # Iterate through each day
    current_date = start_date
    while current_date <= end_date:
        day_of_week = current_date.weekday()  # 0=Monday, 6=Sunday
        
        # Check if it's a day off
        if day_offs.filter(date=current_date).exists():
            current_date += timedelta(days=1)
            continue
        
        # Check for exceptional schedule
        exceptional = exceptional_schedules.filter(date=current_date).first()
        
        if exceptional:
            # Use exceptional schedule for this date
            if exceptional.start_time and exceptional.end_time:
                times_to_generate = [(exceptional.start_time, exceptional.end_time)]
            else:
                current_date += timedelta(days=1)
                continue
            duration = 30  # Default duration for exceptional schedules
        else:
            # Use regular weekly schedule for this day
            schedule = weekly_schedules.filter(day_of_week=day_of_week).first()
            
            if not schedule:
                current_date += timedelta(days=1)
                continue
            
            times_to_generate = []
            if schedule.morning_start and schedule.morning_end:
                times_to_generate.append((schedule.morning_start, schedule.morning_end))
            if schedule.afternoon_start and schedule.afternoon_end:
                times_to_generate.append((schedule.afternoon_start, schedule.afternoon_end))
            
            duration = schedule.appointment_duration
        
        # Generate slots for each time range
        for start_time, end_time in times_to_generate:
            current_time = datetime.combine(current_date, start_time)
            end_datetime = datetime.combine(current_date, end_time)
            
            while current_time < end_datetime:
                slot_end = current_time + timedelta(minutes=duration)
                
                if slot_end > end_datetime:
                    break
                
                # Check if slot is already booked
                is_available = True
                # In a real system, you'd check if this time is already booked
                
                available_slots.append({
                    'id': f"{doctor.id}_{current_date.isoformat()}_{current_time.time().isoformat()}",
                    'doctor_id': doctor.id,
                    'doctor_name': doctor.get_full_name(),
                    'date': current_date.isoformat(),
                    'start_time': current_time.time().isoformat(),
                    'end_time': slot_end.time().isoformat(),
                    'is_available': is_available,
                    'duration_minutes': duration
                })
                
                current_time = slot_end
        
        current_date += timedelta(days=1)
    
    return available_slots
