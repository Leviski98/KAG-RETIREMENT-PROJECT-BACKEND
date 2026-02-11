from rest_framework import serializers
from .models import Section
from districts.serializers import DistrictSerializer


class SectionSerializer(serializers.ModelSerializer):
    section_id = serializers.ReadOnlyField()
    district_name = serializers.CharField(source='district.name', read_only=True)
    district_details = DistrictSerializer(source='district', read_only=True)
    
    class Meta:
        model = Section
        fields = [
            'id', 
            'section_id', 
            'name', 
            'district', 
            'district_name',
            'district_details',
            'created_at', 
            'updated_at'
        ]
        read_only_fields = ['id', 'section_id', 'created_at', 'updated_at']
