from django.db import models
from django.conf import settings
from apps.datasets.models import Dataset

class TrainedModel(models.Model):
    ALGORITHM_CHOICES = (
        ('random_forest', 'Random Forest Regressor'),
        ('linear_regression', 'Linear Regression'),
        ('decision_tree', 'Decision Tree Regressor'),
        ('gradient_boosting', 'Gradient Boosting Regressor'),
    )

    name = models.CharField(max_length=255)
    algorithm = models.CharField(max_length=50, choices=ALGORITHM_CHOICES, default='random_forest')
    target_column = models.CharField(max_length=100, default='final_exam_score')
    
    r2_score = models.FloatField(default=0.0)
    mae = models.FloatField(default=0.0)
    mse = models.FloatField(default=0.0)
    rmse = models.FloatField(default=0.0)
    
    is_active = models.BooleanField(default=True)
    dataset = models.ForeignKey(Dataset, on_delete=models.SET_NULL, null=True, blank=True)
    trained_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    trained_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} (R² = {self.r2_score:.2f})"
