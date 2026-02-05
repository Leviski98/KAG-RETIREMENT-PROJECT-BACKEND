from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count
from .models import District
from .serializers import DistrictSerializer


class DistrictViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing districts.
    
    Provides CRUD operations for districts with search, filter, and ordering capabilities.
    
    List: GET /api/districts/
    Create: POST /api/districts/
    Retrieve: GET /api/districts/{id}/
    Update: PUT /api/districts/{id}/
    Partial Update: PATCH /api/districts/{id}/
    Delete: DELETE /api/districts/{id}/
    
    Custom Actions:
    - GET /api/districts/search/?name=<name> - Search districts by name
    - GET /api/districts/statistics/ - Get district statistics
    """
    queryset = District.objects.all()
    serializer_class = DistrictSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at', 'updated_at']
    filterset_fields = ['name']
    ordering = ['name']  # Default ordering
    
    def get_queryset(self):
        """
        Optionally restricts the returned districts based on query parameters.
        """
        queryset = District.objects.all()
        return queryset
    
    def list(self, request, *args, **kwargs):
        """
        List all districts.
        Returns a paginated list of all districts in the system.
        """
        return super().list(request, *args, **kwargs)
    
    def create(self, request, *args, **kwargs):
        """
        Create a new district.
        Requires 'name' field in the request body.
        """
        return super().create(request, *args, **kwargs)
    
    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a specific district by ID.
        """
        return super().retrieve(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        """
        Update a district completely (PUT).
        """
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        """
        Partially update a district (PATCH).
        """
        return super().partial_update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """
        Delete a district.
        """
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Get statistics about districts.
        
        GET /api/districts/statistics/
        
        Returns:
            - total_districts: Total number of districts
            - recent_districts: Districts created in the last 30 days
        """
        from django.utils import timezone
        from datetime import timedelta
        
        total_districts = District.objects.count()
        thirty_days_ago = timezone.now() - timedelta(days=30)
        recent_districts = District.objects.filter(created_at__gte=thirty_days_ago).count()
        
        return Response({
            'total_districts': total_districts,
            'recent_districts': recent_districts,
            'oldest_district': District.objects.order_by('created_at').first().name if District.objects.exists() else None,
            'newest_district': District.objects.order_by('-created_at').first().name if District.objects.exists() else None,
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
        
        Request body should contain a list of district objects:
        {
            "districts": [
                {"name": "District 1"},
                {"name": "District 2"}
            ]
        }
        """
        districts_data = request.data.get('districts', [])
        
        if not districts_data or not isinstance(districts_data, list):
            return Response(
                {'error': 'districts field must be a non-empty list'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(data=districts_data, many=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
