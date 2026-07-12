from django.db import models
from django.conf import settings
from programs.models import Program

class FeedbackCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class FeedbackQuestion(models.Model):
    text = models.CharField(max_length=500)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.text

class Feedback(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        REVIEWED = 'REVIEWED', 'Reviewed'
        RESOLVED = 'RESOLVED', 'Resolved'

    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='feedbacks')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='feedbacks_submitted')
    category = models.ForeignKey(FeedbackCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='feedbacks')
    content = models.TextField()
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 5)])
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    response = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Feedback for {self.program.title} by {self.user.username if self.user else 'Unknown'}"
