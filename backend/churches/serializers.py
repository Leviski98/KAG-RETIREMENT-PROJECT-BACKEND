from rest_framework import serializers
from .models import Church, ChurchRole, ChurchPastor


class ChurchSerializer(serializers.ModelSerializer):
    """Serializer for Church model"""
    church_id = serializers.ReadOnlyField()
    section_name = serializers.CharField(source='section.name', read_only=True)
    
    class Meta:
        model = Church
        fields = [
            'id',
            'church_id',
            'section',
            'section_name',
            'church_name',
            'location',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'church_id', 'created_at', 'updated_at']


class ChurchRoleSerializer(serializers.ModelSerializer):
    """Serializer for ChurchRole model"""
    
    class Meta:
        model = ChurchRole
        fields = [
            'id',
            'role_name',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ChurchPastorSerializer(serializers.ModelSerializer):
    """Serializer for ChurchPastor junction model"""
    church_name = serializers.CharField(source='church.church_name', read_only=True)
    pastor_name = serializers.CharField(source='pastor.full_name', read_only=True)
    role_name = serializers.CharField(source='role.role_name', read_only=True)
    
    class Meta:
        model = ChurchPastor
        fields = [
            'id',
            'church',
            'church_name',
            'pastor',
            'pastor_name',
            'role',
            'role_name',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
