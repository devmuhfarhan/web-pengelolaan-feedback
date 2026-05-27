from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        STAFF_LAPANGAN = 'STAFF_LAPANGAN', 'Staff Lapangan'
        MANAGER = 'MANAGER', 'Manager'
        STAFF_OPERATIONAL = 'STAFF_OPERATIONAL', 'Staff Operational'
        PENERIMA_MANFAAT = 'PENERIMA_MANFAAT', 'Penerima Manfaat'

    role = models.CharField(max_length=50, choices=Role.choices, default=Role.PENERIMA_MANFAAT)
    phone_number = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"{self.username} - {self.get_role_display()}"


class BeneficiaryData(models.Model):
    class Status(models.TextChoices):
        VERIFIED = 'VERIFIED', 'Terverifikasi'
        INCOMPLETE = 'INCOMPLETE', 'Data Kurang'
        PENDING = 'PENDING', 'Pending'

    lokasi = models.CharField(max_length=255)
    status = models.CharField(max_length=50, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.lokasi} - {self.get_status_display()}"

