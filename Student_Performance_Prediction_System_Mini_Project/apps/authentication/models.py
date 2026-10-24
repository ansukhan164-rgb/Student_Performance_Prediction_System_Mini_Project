from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('teacher', 'Teacher'),
        ('student', 'Student'),
    )

    university_uid = models.CharField(
        max_length=50,
        unique=True,
        help_text="University Register / UID Number (e.g. BCA2024-001)"
    )
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='student'
    )
    department = models.CharField(
        max_length=100,
        default='Computer Applications (BCA)'
    )
    year_of_study = models.CharField(
        max_length=20,
        default='3rd Year',
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'university_uid'
    REQUIRED_FIELDS = ['username', 'email', 'first_name', 'last_name', 'role']

    def __str__(self):
        return f"{self.get_full_name()} ({self.university_uid}) - {self.role.capitalize()}"
