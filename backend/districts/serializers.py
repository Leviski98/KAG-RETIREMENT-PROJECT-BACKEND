from rest_framework import serializers
from .models import District


class DistrictSerializer(serializers.ModelSerializer):
    district_id = serializers.ReadOnlyField()
    
    class Meta:
        model = District
        fields = ['id', 'district_id', 'name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'district_id', 'created_at', 'updated_at']
