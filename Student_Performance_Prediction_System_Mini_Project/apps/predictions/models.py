from django.db import models
from django.conf import settings
from apps.ml_models.models import TrainedModel

class PredictionRecord(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='predictions')
    model = models.ForeignKey(TrainedModel, on_delete=models.SET_NULL, null=True, blank=True)
    
    attendance_percentage = models.FloatField()
    past_exam_score = models.FloatField()
    assignment_score = models.FloatField()
    study_hours_per_week = models.FloatField()
    previous_backlogs = models.IntegerField(default=0)
    
    predicted_score = models.FloatField()
    performance_category = models.CharField(max_length=50)
    recommendations_json = models.TextField(blank=True, default='[]')
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.get_full_name()} - Predicted: {self.predicted_score:.1f}/100 ({self.performance_category})"
