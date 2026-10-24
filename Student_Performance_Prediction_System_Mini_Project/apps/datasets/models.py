from django.db import models
from django.conf import settings

class Dataset(models.Model):
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='datasets/')
    file_format = models.CharField(max_length=10, default='CSV')
    row_count = models.IntegerField(default=0)
    column_count = models.IntegerField(default=0)
    is_cleaned = models.BooleanField(default=False)
    quality_score = models.FloatField(default=100.0)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='datasets')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.row_count} rows x {self.column_count} cols)"
