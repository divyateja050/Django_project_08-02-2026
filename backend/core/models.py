from django.db import models
from django.contrib.auth.models import User

class UploadHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    filename = models.CharField(max_length=255)
    file = models.FileField(upload_to='uploads/')

    def __str__(self):
        return f"{self.filename} - {self.uploaded_at}"

class EquipmentData(models.Model):
    upload = models.ForeignKey(UploadHistory, on_delete=models.CASCADE, related_name='equipment_data')
    equipment_name = models.CharField(max_length=255)
    equipment_type = models.CharField(max_length=100)
    flowrate = models.FloatField()
    pressure = models.FloatField()
    temperature = models.FloatField()

    def __str__(self):
        return self.equipment_name
