from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        FIELD_STAFF = 'FIELD_STAFF', 'Field Staff'
        MANAGER = 'MANAGER', 'Manager'
        OPERATIONAL_STAFF = 'OPERATIONAL_STAFF', 'Operational Staff'
        BENEFICIARY = 'BENEFICIARY', 'Beneficiary'


    role = models.CharField(max_length=50, choices=Role.choices, default=Role.BENEFICIARY)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    birth_date = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=[('L', 'Laki-laki'), ('P', 'Perempuan')], null=True, blank=True)
    program = models.ForeignKey('programs.Program', on_delete=models.SET_NULL, null=True, blank=True, related_name='beneficiaries')
    date_provided = models.DateField(null=True, blank=True)
    updated_by = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_users')
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


class BeneficiaryReplacement(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='replacements')
    program = models.ForeignKey('programs.Program', on_delete=models.SET_NULL, null=True, blank=True)
    date_replaced = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_replacements')

    def __str__(self):
        return f"Replacement for {self.user.username} on {self.date_replaced}"

class ActivityLog(models.Model):
    class Action(models.TextChoices):
        LOGIN = 'LOGIN', 'Login'
        UPDATE = 'UPDATE', 'Update Data'
        DELETE = 'DELETE', 'Delete Data'
        CREATE = 'CREATE', 'Create Data'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activity_logs')
    action = models.CharField(max_length=20, choices=Action.choices)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.action} at {self.created_at}"
