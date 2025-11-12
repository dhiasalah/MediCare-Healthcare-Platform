from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from datetime import time, timedelta

User = get_user_model()


class DayOfWeek(models.IntegerChoices):
    """Days of the week (0=Monday, 6=Sunday)"""
    MONDAY = 0, 'Lundi'
    TUESDAY = 1, 'Mardi'
    WEDNESDAY = 2, 'Mercredi'
    THURSDAY = 3, 'Jeudi'
    FRIDAY = 4, 'Vendredi'
    SATURDAY = 5, 'Samedi'
    SUNDAY = 6, 'Dimanche'


class DoctorWeeklySchedule(models.Model):
    """
    Defines a doctor's regular weekly availability schedule.
    Each doctor has one schedule per day of the week.
    """
    doctor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='weekly_schedules',
        limit_choices_to={'user_type': 'doctor'}
    )
    day_of_week = models.IntegerField(
        choices=DayOfWeek.choices,
        validators=[MinValueValidator(0), MaxValueValidator(6)],
        verbose_name="Jour de la semaine"
    )
    is_available = models.BooleanField(
        default=True,
        verbose_name="Disponible",
        help_text="Le médecin travaille-t-il ce jour?"
    )
    
    # Morning session
    morning_start = models.TimeField(
        null=True,
        blank=True,
        verbose_name="Début matin",
        help_text="Heure de début de la session du matin"
    )
    morning_end = models.TimeField(
        null=True,
        blank=True,
        verbose_name="Fin matin",
        help_text="Heure de fin de la session du matin"
    )
    
    # Afternoon session
    afternoon_start = models.TimeField(
        null=True,
        blank=True,
        verbose_name="Début après-midi",
        help_text="Heure de début de la session de l'après-midi"
    )
    afternoon_end = models.TimeField(
        null=True,
        blank=True,
        verbose_name="Fin après-midi",
        help_text="Heure de fin de la session de l'après-midi"
    )
    
    # Appointment duration for this day
    appointment_duration = models.PositiveIntegerField(
        default=30,
        validators=[MinValueValidator(15), MaxValueValidator(120)],
        verbose_name="Durée rendez-vous (min)",
        help_text="Durée en minutes de chaque rendez-vous"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['doctor', 'day_of_week']
        ordering = ['doctor', 'day_of_week']
        verbose_name = "Horaire hebdomadaire"
        verbose_name_plural = "Horaires hebdomadaires"
    
    def __str__(self):
        status = "Disponible" if self.is_available else "Indisponible"
        return f"Dr. {self.doctor.get_full_name()} - {self.get_day_of_week_display()} ({status})"
    
    def get_time_slots(self):
        """Generate list of time slots for this day based on the schedule"""
        slots = []
        
        if not self.is_available:
            return slots
        
        # Morning slots
        if self.morning_start and self.morning_end:
            current_time = self.morning_start
            while current_time < self.morning_end:
                end_time = (
                    timezone.datetime.combine(timezone.datetime.today(), current_time) +
                    timedelta(minutes=self.appointment_duration)
                ).time()
                
                if end_time <= self.morning_end:
                    slots.append({
                        'start': current_time,
                        'end': end_time,
                        'session': 'morning'
                    })
                
                current_time = end_time
        
        # Afternoon slots
        if self.afternoon_start and self.afternoon_end:
            current_time = self.afternoon_start
            while current_time < self.afternoon_end:
                end_time = (
                    timezone.datetime.combine(timezone.datetime.today(), current_time) +
                    timedelta(minutes=self.appointment_duration)
                ).time()
                
                if end_time <= self.afternoon_end:
                    slots.append({
                        'start': current_time,
                        'end': end_time,
                        'session': 'afternoon'
                    })
                
                current_time = end_time
        
        return slots


class DoctorDayOff(models.Model):
    """
    Specific dates when a doctor is not available (vacations, holidays, etc.)
    Overrides the weekly schedule for specific dates.
    """
    doctor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='days_off',
        limit_choices_to={'user_type': 'doctor'}
    )
    date = models.DateField(
        verbose_name="Date",
        help_text="Date du congé"
    )
    reason = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Raison",
        help_text="Raison du congé (optionnel)"
    )
    is_full_day = models.BooleanField(
        default=True,
        verbose_name="Journée complète",
        help_text="Cochez si absent toute la journée"
    )
    
    # Partial day off - specific time range
    unavailable_start = models.TimeField(
        null=True,
        blank=True,
        verbose_name="Début indisponibilité",
        help_text="Heure de début (si absence partielle)"
    )
    unavailable_end = models.TimeField(
        null=True,
        blank=True,
        verbose_name="Fin indisponibilité",
        help_text="Heure de fin (si absence partielle)"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['doctor', 'date']
        ordering = ['date']
        verbose_name = "Congé médecin"
        verbose_name_plural = "Congés médecins"
    
    def __str__(self):
        day_type = "Journée complète" if self.is_full_day else "Partiel"
        return f"Dr. {self.doctor.get_full_name()} - {self.date} ({day_type})"
    
    def clean(self):
        from django.core.exceptions import ValidationError
        
        # Validate partial day off has times
        if not self.is_full_day and (not self.unavailable_start or not self.unavailable_end):
            raise ValidationError(
                "Pour un congé partiel, vous devez spécifier les heures de début et de fin."
            )
        
        # Validate start time is before end time
        if self.unavailable_start and self.unavailable_end:
            if self.unavailable_start >= self.unavailable_end:
                raise ValidationError(
                    "L'heure de début doit être antérieure à l'heure de fin."
                )


class DoctorExceptionalSchedule(models.Model):
    """
    Exceptional schedule for specific dates that differ from weekly schedule.
    For example: working on a normally off day, or different hours on a specific date.
    """
    doctor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='exceptional_schedules',
        limit_choices_to={'user_type': 'doctor'}
    )
    date = models.DateField(
        verbose_name="Date",
        help_text="Date de l'horaire exceptionnel"
    )
    
    # Morning session
    morning_start = models.TimeField(
        null=True,
        blank=True,
        verbose_name="Début matin"
    )
    morning_end = models.TimeField(
        null=True,
        blank=True,
        verbose_name="Fin matin"
    )
    
    # Afternoon session
    afternoon_start = models.TimeField(
        null=True,
        blank=True,
        verbose_name="Début après-midi"
    )
    afternoon_end = models.TimeField(
        null=True,
        blank=True,
        verbose_name="Fin après-midi"
    )
    
    appointment_duration = models.PositiveIntegerField(
        default=30,
        validators=[MinValueValidator(15), MaxValueValidator(120)],
        verbose_name="Durée rendez-vous (min)"
    )
    
    reason = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Raison",
        help_text="Raison de l'horaire exceptionnel (optionnel)"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['doctor', 'date']
        ordering = ['date']
        verbose_name = "Horaire exceptionnel"
        verbose_name_plural = "Horaires exceptionnels"
    
    def __str__(self):
        return f"Dr. {self.doctor.get_full_name()} - {self.date} (Exceptionnel)"
