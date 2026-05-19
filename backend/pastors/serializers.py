from rest_framework import serializers
from .models import Pastor


class PastorSerializer(serializers.ModelSerializer):
    pastor_id = serializers.ReadOnlyField()
    church_assignments = serializers.SerializerMethodField()
    
    class Meta:
        model = Pastor
        fields = [
            'id',
            'pastor_id',
            'full_name',
            'gender',
            'pastor_rank',
            'national_id',
            'date_of_birth',
            'phone_number',
            'start_of_service',
            'status',
            'church_assignments',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'pastor_id', 'church_assignments', 'created_at', 'updated_at']
    
    def get_church_assignments(self, obj):
        """Get all church assignments for this pastor"""
        assignments = obj.church_assignments.select_related('church', 'church__section', 'church__section__district', 'role').all()
        return [{
            'id': assignment.id,
            'church_id': assignment.church.id,
            'church_name': assignment.church.church_name,
            'section_id': assignment.church.section.id,
            'section_name': assignment.church.section.name,
            'district_id': assignment.church.section.district.id,
            'district_name': assignment.church.section.district.name,
            'role_id': assignment.role.id,
            'role_name': assignment.role.role_name,
        } for assignment in assignments]
    
    def validate(self, data):
        """
        Validate that only one active Archbishop can exist at a time.
        """
        # Get the rank and status from data, or from the instance if updating
        pastor_rank = data.get('pastor_rank', None)
        status = data.get('status', None)
        
        # If updating, get current values for fields not being changed
        if self.instance:
            if pastor_rank is None:
                pastor_rank = self.instance.pastor_rank
            if status is None:
                status = self.instance.status
        
        # Check if trying to create/update an active Archbishop
        if pastor_rank == 'ArchBishop' and status == 'active':
            # Query for existing active Archbishops
            existing_active_archbishop = Pastor.objects.filter(
                pastor_rank='ArchBishop',
                status='active'
            )
            
            # If updating, exclude the current instance
            if self.instance:
                existing_active_archbishop = existing_active_archbishop.exclude(id=self.instance.id)
            
            # If another active Archbishop exists, raise validation error
            if existing_active_archbishop.exists():
                existing = existing_active_archbishop.first()
                raise serializers.ValidationError(
                    f"Only one active Archbishop is allowed. "
                    f"{existing.full_name} is currently the active Archbishop."
                )
        
        return data
