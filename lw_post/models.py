from django.db import models

# Create your models here.

class LW(models.Model):
    lastwords = models.CharField(max_length=500, blank=False, null=False)