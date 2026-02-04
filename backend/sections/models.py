from django.db import models
from districts.models import District


class Section(models.Model):
    id = models.AutoField(primary_key=True)
    district = models.ForeignKey(District, on_delete=models.CASCADE, related_name='sections')
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = 'Section'
        verbose_name_plural = 'Sections'
    
    def __str__(self):
        return self.name
    
    @property
    def section_id(self):
        """Return formatted ID as VARCHAR(20) like 'SEC001'"""
        return f"SEC{self.id:03d}"
