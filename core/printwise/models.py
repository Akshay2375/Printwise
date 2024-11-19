from django.db import models

# Create your models here.
class MyPrint(models.Model):
    printfile=models.FileField(upload_to="uploaded")
 