from django.db import models


class District(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = 'District'
        verbose_name_plural = 'Districts'
    
    def __str__(self):
        return self.name
    
    @property
    def district_id(self):
        """Return formatted ID as VARCHAR(20) like 'DIS001'"""
        return f"DIS{self.id:03d}"
