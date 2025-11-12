#!/usr/bin/env python
"""Debug script to check database state"""
import sqlite3

conn = sqlite3.connect('db.sqlite3')
cursor = conn.cursor()

# First, list all tables
print("=" * 60)
print("ALL TABLES IN DATABASE")
print("=" * 60)
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
for table in tables:
    print(f"  - {table[0]}")

print("\n" + "=" * 60)
print("DOCTORS IN DATABASE")
print("=" * 60)
try:
    cursor.execute('SELECT id, email, first_name, last_name, user_type FROM users WHERE user_type = "doctor"')
    doctors = cursor.fetchall()
    if doctors:
        for row in doctors:
            print(f"ID: {row[0]}, Email: {row[1]}, Name: {row[2]} {row[3]}, Type: {row[4]}")
    else:
        print("NO DOCTORS FOUND")
except Exception as e:
    print(f"Error: {e}")

print("\n" + "=" * 60)
print("DOCTOR WEEKLY SCHEDULES")
print("=" * 60)
try:
    cursor.execute('SELECT id, doctor_id FROM appointments_doctorweeklyschedule')
    schedules = cursor.fetchall()
    if schedules:
        print(f"Found {len(schedules)} schedules")
        for row in schedules:
            print(f"  Schedule ID: {row[0]}, Doctor ID: {row[1]}")
    else:
        print("NO SCHEDULES FOUND")
except Exception as e:
    print(f"Error: {e}")

print("\n" + "=" * 60)
print("TIME SLOTS IN DATABASE")
print("=" * 60)
try:
    cursor.execute('SELECT COUNT(*) FROM appointments_timeslot')
    count = cursor.fetchone()[0]
    print(f"Total time slots: {count}")
    
    if count > 0:
        cursor.execute('SELECT id, doctor_id, date, start_time, end_time, is_available FROM appointments_timeslot LIMIT 5')
        for row in cursor.fetchall():
            print(f"  Slot ID: {row[0]}, Doctor: {row[1]}, Date: {row[2]}, Time: {row[3]}-{row[4]}, Available: {row[5]}")
except Exception as e:
    print(f"Error: {e}")

conn.close()
