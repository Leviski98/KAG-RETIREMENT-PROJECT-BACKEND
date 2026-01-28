from rest_framework import serializers
from .models import Section


class SectionSerializer(serializers.ModelSerializer):
    section_id = serializers.ReadOnlyField()
    
    class Meta:
        model = Section
        fields = ['id', 'section_id', 'district', 'name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
