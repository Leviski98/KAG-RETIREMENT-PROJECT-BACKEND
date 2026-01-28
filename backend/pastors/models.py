from django.db import models
from django.core.validators import RegexValidator


class Pastor(models.Model):
    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
    ]
    
    RANK_CHOICES = [
        ('ArchBishop', 'ArchBishop'),
        ('Bishop', 'Bishop'),
        ('Presbyter', 'Presbyter'),
        ('Reverend', 'Reverend'),
        ('Pastor', 'Pastor'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('suspended', 'Suspended'),
        ('retired', 'Retired'),
        ('deceased', 'Deceased'),
    ]
    
    phone_regex = RegexValidator(
        regex=r'^\+2547[0-9]{8}$',
        message="Phone number must be in format: '+254712345678'"
    )
    
    id = models.AutoField(primary_key=True)
    full_name = models.CharField(max_length=150)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    pastor_rank = models.CharField(max_length=100, choices=RANK_CHOICES)
    national_id = models.CharField(max_length=30, blank=True, null=True)
    date_of_birth = models.DateField()
    phone_number = models.CharField(max_length=13, validators=[phone_regex])
    start_of_service = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['full_name']
        verbose_name = 'Pastor'
        verbose_name_plural = 'Pastors'
    
    def __str__(self):
        return self.full_name
    
    @property
    def pastor_id(self):
        """Return formatted ID as VARCHAR(20) like 'PAS001'"""
        return f"PAS{self.id:03d}"
