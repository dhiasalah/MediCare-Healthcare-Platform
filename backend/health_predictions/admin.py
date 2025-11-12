from django.contrib import admin
from .models import HeartDiseasePrediction


@admin.register(HeartDiseasePrediction)
class HeartDiseasePredictionAdmin(admin.ModelAdmin):
    list_display = ['patient', 'age', 'prediction', 'confidence', 'created_at']
    list_filter = ['prediction', 'created_at', 'sex']
    search_fields = ['patient__first_name', 'patient__last_name', 'patient__email']
    readonly_fields = ['prediction', 'confidence', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Patient Information', {
            'fields': ('patient',)
        }),
        ('Clinical Measurements', {
            'fields': ('age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg')
        }),
        ('Cardiac Stress Test', {
            'fields': ('thalach', 'exang', 'oldpeak', 'slope')
        }),
        ('Additional Tests', {
            'fields': ('ca', 'thal')
        }),
        ('Prediction Results', {
            'fields': ('prediction', 'confidence')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
