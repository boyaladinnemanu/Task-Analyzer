from django.db import models
from django.utils import timezone

class Task(models.Model):
    title = models.CharField(max_length=200)
    due_date = models.DateField()
    importance = models.IntegerField(
        default=5,
        help_text="Scale of 1-10, where 10 is most important"
    )
    estimated_hours = models.IntegerField(
        default=1,
        help_text="Estimated time to complete in hours"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    dependencies = models.JSONField(default=list, blank=True)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.title} (Due: {self.due_date})"

    def is_overdue(self):
        return self.due_date < timezone.now().date()

    def days_until_due(self):
        delta = self.due_date - timezone.now().date()
        return delta.days
