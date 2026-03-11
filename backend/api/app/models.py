from django.db import models

class User(models.Model):
    id=models.IntegerField(auto_created=True,primary_key=True)
    name=models.CharField(max_length=1000)
    email=models.CharField(max_length=1000)
    uni=models.CharField(max_length=1000)
    field=models.CharField(max_length=1000)
    passw=models.CharField(max_length=1000)