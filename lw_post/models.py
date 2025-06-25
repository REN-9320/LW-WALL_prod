from django.db import models
import random
# Create your models here.

def randint_exclude(max_screen, ex):
    i = random.randint(1,max_screen)
    while i == ex:
        i = random.randint(1,max_screen)
    return i

class LW(models.Model):
    lastwords = models.CharField(max_length=500, blank=False, null=False)
    seed_screen = models.IntegerField(null=True, blank=True)
    seed_x = models.IntegerField(null=True, blank=True)