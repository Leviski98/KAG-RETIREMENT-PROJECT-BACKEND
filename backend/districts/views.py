from datetime import timedelta
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db import transaction, IntegrityError
from django.db.models import Count, Min, Max, Q
from django.conf import settings
from .models import District
from .serializers import DistrictSerializer


class DistrictViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing districts.
    
    Provides CRUD operations for districts with search, filter, and ordering capabilities.
    
    List: GET /api/districts/ (supports ?search=<name> for name search)
    Create: POST /api/districts/
    Retrieve: GET /api/districts/{id}/
    Update: PUT /api/districts/{id}/
    Partial Update: PATCH /api/districts/{id}/
    Delete: DELETE /api/districts/{id}/
    
    Custom Actions:
    - GET /api/districts/statistics/ - Get district statistics
    - GET /api/districts/{id}/summary/ - Get a summary of a specific district
    - POST /api/districts/bulk_create/ - Create multiple districts at once
    """
    queryset = District.objects.all()
    serializer_class = DistrictSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at', 'updated_at']
    filterset_fields = ['name']
    ordering = ['name']  # Default ordering
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Get statistics about districts.
        
        GET /api/districts/statistics/
        
        Returns:
            - total_districts: Total number of districts
            - recent_districts: Districts created in the last 30 days
            - oldest_district: Name of the oldest district
            - newest_district: Name of the newest district
        """
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        # Single aggregated query for all statistics
        # Use self.get_queryset() to respect any queryset scoping/filtering
        stats = self.get_queryset().aggregate(
            total_districts=Count('id'),
            recent_districts=Count('id', filter=Q(created_at__gte=thirty_days_ago)),
            oldest_created_at=Min('created_at'),
            newest_created_at=Max('created_at')
        )
        
        # Fetch both oldest and newest district names in one additional query
        # Total: 2 queries instead of the original 5-6
        oldest_district = None
        newest_district = None
        
        if stats['oldest_created_at']:
            # Get districts matching either oldest or newest timestamp
            # Evaluate queryset once to avoid multiple DB queries
            districts = list(self.get_queryset().filter(
                Q(created_at=stats['oldest_created_at']) | 
                Q(created_at=stats['newest_created_at'])
            ).only('name', 'created_at').order_by('created_at'))
            
            if districts:
                oldest_district = districts[0].name
                newest_district = districts[-1].name
        
        return Response({
            'total_districts': stats['total_districts'],
            'recent_districts': stats['recent_districts'],
            'oldest_district': oldest_district,
            'newest_district': newest_district,
        })
    
    @action(detail=True, methods=['get'])
    def summary(self, request, pk=None):
        """
        Get a summary of a specific district.
        
        GET /api/districts/{id}/summary/
        
        Returns detailed information about a district including related entities.
        """
        district = self.get_object()
        serializer = self.get_serializer(district)
        
        # You can add related data here once you have relationships set up
        # For example: churches_count, pastors_count, sections_count
        
        return Response({
            'district': serializer.data,
            # 'churches_count': district.churches.count(),
            # 'sections_count': district.sections.count(),
        })
    
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """
        Create multiple districts at once.
        
        POST /api/districts/bulk_create/
        
        Request body should contain a list of district objects (max 10):
        {
            "districts": [
                {"name": "District 1"},
                {"name": "District 2"}
            ]
        }
        """
        MAX_BULK_CREATE = 10
        
        districts_data = request.data.get('districts', [])
        
        if not districts_data or not isinstance(districts_data, list):
            return Response(
                {'error': 'districts field must be a non-empty list'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if len(districts_data) > MAX_BULK_CREATE:
            return Response(
                {'error': f'Cannot create more than {MAX_BULK_CREATE} districts at once. Provided: {len(districts_data)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(data=districts_data, many=True)
        serializer.is_valid(raise_exception=True)
        
        try:
            with transaction.atomic():
                serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except IntegrityError as e:
            error_response = {'error': 'Duplicate district name or database constraint violation'}
            # Only expose database details in development mode
            if settings.DEBUG:
                error_response['detail'] = str(e)
            return Response(error_response, status=status.HTTP_400_BAD_REQUEST)
