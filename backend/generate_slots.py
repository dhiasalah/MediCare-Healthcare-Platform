#!/usr/bin/env python
"""
Generate time slots from doctor weekly schedules.
Run this to create TimeSlot records based on DoctorWeeklySchedule configurations.
"""
import os
import sys
import django
from datetime import datetime, timedelta, time

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medical_platform.settings')
django.setup()

from django.contrib.auth import get_user_model
from appointments.models import TimeSlot
from appointments.schedule_models import DoctorWeeklySchedule, DoctorDayOff, DoctorExceptionalSchedule
from django.utils import timezone

User = get_user_model()

def generate_time_slots(doctor_id=None, days_ahead=30):
    """
    Generate time slots from doctor weekly schedules.
    
    Args:
        doctor_id: Specific doctor ID or None for all doctors
        days_ahead: Number of days to generate slots for (default: 30)
    """
    
    # Get doctors
    if doctor_id:
        doctors = User.objects.filter(id=doctor_id, user_type='doctor')
    else:
        doctors = User.objects.filter(user_type='doctor')
    
    if not doctors.exists():
        print("❌ No doctors found")
        return
    
    total_slots_created = 0
    
    for doctor in doctors:
        print(f"\n{'='*60}")
        print(f"Generating slots for: {doctor.first_name} {doctor.last_name}")
        print(f"{'='*60}")
        
        # Get doctor's weekly schedules
        schedules = DoctorWeeklySchedule.objects.filter(
            doctor=doctor,
            is_available=True
        )
        
        if not schedules.exists():
            print(f"⚠️  No active weekly schedules found for {doctor.email}")
            continue
        
        print(f"✅ Found {schedules.count()} active days")
        
        # Get doctor's day-offs and exceptions
        day_offs = DoctorDayOff.objects.filter(doctor=doctor)
        exceptional = DoctorExceptionalSchedule.objects.filter(doctor=doctor)
        
        # Generate slots for next N days
        today = timezone.now().date()
        slots_created_for_doctor = 0
        
        for day_offset in range(days_ahead):
            slot_date = today + timedelta(days=day_offset)
            day_of_week = slot_date.weekday()  # 0=Monday, 6=Sunday
            
            # Check if it's a day-off
            if day_offs.filter(date=slot_date).exists():
                continue
            
            # Check if there's an exceptional schedule for this date
            exceptional_schedule = exceptional.filter(date=slot_date).first()
            
            if exceptional_schedule:
                # Use exceptional schedule for this date
                times_to_generate = []
                if exceptional_schedule.start_time and exceptional_schedule.end_time:
                    times_to_generate.append((
                        exceptional_schedule.start_time,
                        exceptional_schedule.end_time
                    ))
            else:
                # Use regular weekly schedule for this day
                schedule = schedules.filter(day_of_week=day_of_week).first()
                
                if not schedule:
                    continue
                
                times_to_generate = []
                if schedule.morning_start and schedule.morning_end:
                    times_to_generate.append((schedule.morning_start, schedule.morning_end))
                if schedule.afternoon_start and schedule.afternoon_end:
                    times_to_generate.append((schedule.afternoon_start, schedule.afternoon_end))
            
            # Generate time slots for each time range
            for start_time, end_time in times_to_generate:
                duration = schedule.appointment_duration if not exceptional_schedule else 30
                
                current_time = datetime.combine(slot_date, start_time)
                end_datetime = datetime.combine(slot_date, end_time)
                
                while current_time < end_datetime:
                    slot_end = current_time + timedelta(minutes=duration)
                    
                    if slot_end > end_datetime:
                        break
                    
                    # Check if slot already exists
                    existing = TimeSlot.objects.filter(
                        doctor=doctor,
                        date=slot_date,
                        start_time=current_time.time(),
                        end_time=slot_end.time()
                    ).exists()
                    
                    if not existing:
                        TimeSlot.objects.create(
                            doctor=doctor,
                            date=slot_date,
                            start_time=current_time.time(),
                            end_time=slot_end.time(),
                            is_available=True,
                            duration_minutes=duration
                        )
                        slots_created_for_doctor += 1
                        print(f"  ✅ {slot_date} {current_time.time()}-{slot_end.time()}")
                    
                    current_time = slot_end
        
        print(f"\n📊 Created {slots_created_for_doctor} slots for {doctor.first_name}")
        total_slots_created += slots_created_for_doctor
    
    print(f"\n{'='*60}")
    print(f"✨ TOTAL: {total_slots_created} time slots created successfully!")
    print(f"{'='*60}")

if __name__ == '__main__':
    doctor_id = None
    days_ahead = 30
    
    if len(sys.argv) > 1:
        try:
            doctor_id = int(sys.argv[1])
        except ValueError:
            print(f"Usage: python generate_slots.py [doctor_id] [days_ahead]")
            sys.exit(1)
    
    if len(sys.argv) > 2:
        try:
            days_ahead = int(sys.argv[2])
        except ValueError:
            days_ahead = 30
    
    generate_time_slots(doctor_id=doctor_id, days_ahead=days_ahead)
