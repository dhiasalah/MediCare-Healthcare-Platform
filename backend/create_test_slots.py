#!/usr/bin/env python
"""
Script to create test time slots for a doctor in the database
Run this from the backend directory: python create_test_slots.py
"""
import os
import sys
import django
from datetime import datetime, timedelta

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medical_platform.settings')
django.setup()

from django.contrib.auth import get_user_model
from appointments.models import TimeSlot
from django.utils import timezone

User = get_user_model()

def create_test_slots():
    """Create test time slots for doctor with ID 5"""
    try:
        # Get doctor - assuming doctor ID is 5 (Ayoub Khouja from the screenshot)
        doctor = User.objects.get(id=5, user_type='doctor')
        print(f"✅ Found doctor: {doctor.email}")
    except User.DoesNotExist:
        print("❌ Doctor with ID 5 not found. Let me show you available doctors:")
        doctors = User.objects.filter(user_type='doctor')
        for doc in doctors:
            print(f"   ID: {doc.id}, Email: {doc.email}, Name: {doc.first_name} {doc.last_name}")
        return
    
    # Delete existing slots for this doctor
    TimeSlot.objects.filter(doctor=doctor).delete()
    print("🗑️  Deleted old time slots")
    
    # Create time slots for next 14 days
    today = timezone.now().date()
    slots_created = 0
    
    for day_offset in range(1, 15):
        slot_date = today + timedelta(days=day_offset)
        
        # Skip weekends (Saturday=5, Sunday=6)
        if slot_date.weekday() >= 5:
            print(f"⏭️  Skipping weekend: {slot_date}")
            continue
        
        # Create 4 slots per day: 09:00-10:00, 10:00-11:00, 14:00-15:00, 15:00-16:00
        time_slots = [
            ("09:00", "10:00"),
            ("10:00", "11:00"),
            ("14:00", "15:00"),
            ("15:00", "16:00"),
        ]
        
        for start_time, end_time in time_slots:
            slot = TimeSlot.objects.create(
                doctor=doctor,
                date=slot_date,
                start_time=start_time,
                end_time=end_time,
                is_available=True,
                max_patients=1
            )
            slots_created += 1
            print(f"✅ Created slot: {slot_date} {start_time}-{end_time}")
    
    print(f"\n✨ Successfully created {slots_created} time slots for Dr. {doctor.first_name} {doctor.last_name}")

if __name__ == '__main__':
    create_test_slots()
