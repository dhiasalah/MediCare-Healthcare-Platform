#!/usr/bin/env python
"""
Simple script to create test time slots directly in SQLite database
No Django setup required!
"""
import sqlite3
from datetime import datetime, timedelta

def create_test_slots():
    """Create test time slots directly in SQLite"""
    
    # Connect to database
    conn = sqlite3.connect('db.sqlite3')
    cursor = conn.cursor()
    
    # Get doctor ID 5
    cursor.execute('SELECT id, email, first_name FROM auth_user WHERE id = 5 AND user_type = "doctor"')
    doctor = cursor.fetchone()
    
    if not doctor:
        print("❌ Doctor with ID 5 not found")
        print("Available doctors:")
        cursor.execute('SELECT id, email, first_name FROM auth_user WHERE user_type = "doctor"')
        for row in cursor.fetchall():
            print(f"   ID: {row[0]}, Email: {row[1]}, Name: {row[2]}")
        return
    
    doctor_id, email, name = doctor
    print(f"✅ Found doctor: {name} ({email})")
    
    # Delete existing slots for this doctor
    cursor.execute('DELETE FROM appointments_timeslot WHERE doctor_id = ?', (doctor_id,))
    deleted = cursor.rowcount
    print(f"🗑️  Deleted {deleted} old time slots")
    
    # Create time slots for next 14 days
    today = datetime.now().date()
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
            cursor.execute('''
                INSERT INTO appointments_timeslot 
                (doctor_id, date, start_time, end_time, is_available, duration_minutes)
                VALUES (?, ?, ?, ?, 1, 60)
            ''', (doctor_id, slot_date, start_time, end_time))
            slots_created += 1
            print(f"✅ Created slot: {slot_date} {start_time}-{end_time}")
    
    # Commit changes
    conn.commit()
    conn.close()
    
    print(f"\n✨ Successfully created {slots_created} time slots for Dr. {name}")

if __name__ == '__main__':
    create_test_slots()
