from django.db import models


class Church(models.Model):
    """Church model representing individual churches within sections"""
    
    section = models.ForeignKey(
        'sections.Section',
        on_delete=models.CASCADE,
        related_name='churches'
    )
    church_name = models.CharField(max_length=150)
    location = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['church_name']
        verbose_name = 'Church'
        verbose_name_plural = 'Churches'
    
    def __str__(self):
        return self.church_name
    
    @property
    def church_id(self):
        """Return formatted ID as VARCHAR(20) like 'CHU001'"""
        return f"CHU{self.id:03d}"


class ChurchRole(models.Model):
    """Church Role model for pastor positions within churches"""
    
    ROLE_CHOICES = [
        ('Senior Pastor', 'Senior Pastor'),
        ('Assistant Pastor', 'Assistant Pastor'),
        ('Youth Pastor', 'Youth Pastor'),
        ('Missions Pastor', 'Missions Pastor'),
        ('Associate Minister', 'Associate Minister'),
    ]
    
    role_name = models.CharField(max_length=50, unique=True, choices=ROLE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['role_name']
        verbose_name = 'Church Role'
        verbose_name_plural = 'Church Roles'
    
    def __str__(self):
        return self.role_name
    
    @property
    def role_id(self):
        """Return formatted ID as VARCHAR(20) like 'ROL001'"""
        return f"ROL{self.id:03d}"


class ChurchPastor(models.Model):
    """Junction table linking pastors to churches with their roles"""
    
    church = models.ForeignKey(
        Church,
        on_delete=models.CASCADE,
        related_name='church_pastors'
    )
    pastor = models.ForeignKey(
        'pastors.Pastor',
        on_delete=models.CASCADE,
        related_name='church_assignments'
    )
    role = models.ForeignKey(
        ChurchRole,
        on_delete=models.CASCADE,
        related_name='assignments'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['church', 'pastor']
        unique_together = [['church', 'pastor', 'role']]
        verbose_name = 'Church Pastor Assignment'
        verbose_name_plural = 'Church Pastor Assignments'
    
    def __str__(self):
        return f"{self.pastor} - {self.role} at {self.church}"
