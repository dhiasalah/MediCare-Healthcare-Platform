# Generated migration to convert day_of_week from string to integer

from django.db import migrations

# Mapping of string day names to integers
DAY_MAPPING = {
    'monday': 0,
    'tuesday': 1,
    'wednesday': 2,
    'thursday': 3,
    'friday': 4,
    'saturday': 5,
    'sunday': 6,
}

def convert_to_int(apps, schema_editor):
    """Convert existing string day_of_week values to integers"""
    DoctorWeeklySchedule = apps.get_model('appointments', 'DoctorWeeklySchedule')
    
    for schedule in DoctorWeeklySchedule.objects.all():
        if isinstance(schedule.day_of_week, str):
            schedule.day_of_week = DAY_MAPPING.get(schedule.day_of_week.lower(), 0)
            schedule.save()

def reverse_convert(apps, schema_editor):
    """Reverse: convert integers back to strings (not typically needed)"""
    pass

class Migration(migrations.Migration):

    dependencies = [
        ('appointments', '0003_alter_doctorweeklyschedule_day_of_week'),
    ]

    operations = [
        migrations.RunPython(convert_to_int, reverse_convert),
    ]
