from rest_framework import serializers
from .models import Pastor


class PastorSerializer(serializers.ModelSerializer):
    pastor_id = serializers.ReadOnlyField()
    
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
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'pastor_id', 'created_at', 'updated_at']
