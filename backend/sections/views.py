from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count
from .models import Section
from .serializers import SectionSerializer
from django.utils import timezone
from datetime import timedelta
from districts.models import District


class SectionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing sections.
    
    Provides CRUD operations for sections with search, filter, and ordering capabilities.
    
    List: GET /api/sections/
    Create: POST /api/sections/
    Retrieve: GET /api/sections/{id}/
    Update: PUT /api/sections/{id}/
    Partial Update: PATCH /api/sections/{id}/
    Delete: DELETE /api/sections/{id}/
    
    Custom Actions:
    - GET /api/sections/statistics/ - Get section statistics
    - GET /api/sections/by_district/?district_id=<id> - Get sections by district
    - GET /api/sections/{id}/summary/ - Get detailed section summary
    """
    queryset = Section.objects.select_related('district').all()
    serializer_class = SectionSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'district__name']
    ordering_fields = ['name', 'created_at', 'updated_at', 'district__name']
    filterset_fields = ['name', 'district']
    ordering = ['name']  # Default ordering
    
    def get_queryset(self):
        """
        Optionally restricts the returned sections based on query parameters.
        Optimizes queries with select_related for district.
        """
        return super().get_queryset()
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Get statistics about sections.
        
        GET /api/sections/statistics/
        
        Returns:
            - total_sections: Total number of sections
            - sections_by_district: Count of sections per district
            - recent_sections: Sections created in the last 30 days
            - districts_with_sections: Number of districts that have sections
            - oldest_section: Name of the oldest section
            - newest_section: Name of the newest section
        """
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        # Use self.get_queryset() to respect any queryset scoping/filtering
        queryset = self.get_queryset()
        
        total_sections = queryset.count()
        recent_sections = queryset.filter(created_at__gte=thirty_days_ago).count()
        
        # Sections count by district
        sections_by_district = queryset.values('district__name').annotate(
            count=Count('id')
        ).order_by('-count')
        
        oldest_section = queryset.order_by('created_at').first()
        newest_section = queryset.order_by('-created_at').first()
        
        # Count districts with sections by getting distinct district IDs from sections
        districts_with_sections = queryset.values('district').distinct().count()
        
        return Response({
            'total_sections': total_sections,
            'recent_sections': recent_sections,
            'sections_by_district': list(sections_by_district),
            'districts_with_sections': districts_with_sections,
            'oldest_section': oldest_section.name if oldest_section else None,
            'newest_section': newest_section.name if newest_section else None,
        })
    
    @action(detail=False, methods=['get'])
    def by_district(self, request):
        """
        Get all sections for a specific district.
        
        GET /api/sections/by_district/?district_id=<id>
        
        Query Parameters:
            - district_id: ID of the district to filter by (required)
        """
        district_id = request.query_params.get('district_id', None)
        
        if district_id is None:
            return Response(
                {'error': 'district_id query parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate district_id is a valid integer
        try:
            district_id = int(district_id)
        except (ValueError, TypeError):
            return Response(
                {'error': 'district_id must be a valid integer'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if district exists
        if not District.objects.filter(id=district_id).exists():
            return Response(
                {'error': f'District with id {district_id} does not exist'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        sections = self.get_queryset().filter(district_id=district_id)
        serializer = self.get_serializer(sections, many=True)
        serialized_data = serializer.data
        
        return Response({
            'district_id': district_id,
            'count': len(serialized_data),
            'sections': serialized_data
        })
    
    @action(detail=True, methods=['get'])
    def summary(self, request, pk=None):
        """
        Get a summary of a specific section.
        
        GET /api/sections/{id}/summary/
        
        Returns detailed information about a section including related entities.
        """
        section = self.get_object()
        serializer = self.get_serializer(section)
        
        # You can add related data here once you have relationships set up
        # For example: churches_count, pastors_count
        
        return Response({
            'section': serializer.data,
            'district': {
                'id': section.district.id,
                'name': section.district.name,
                'district_id': section.district.district_id
            },
            # 'churches_count': section.churches.count(),
            # 'pastors_count': section.pastors.count(),
        })
    
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """
        Create multiple sections at once.
        
        POST /api/sections/bulk_create/
        
        Request body should contain a list of section objects:
        {
            "sections": [
                {"name": "Section 1", "district": 1},
                {"name": "Section 2", "district": 1}
            ]
        }
        """
        sections_data = request.data.get('sections', [])
        
        if not sections_data or not isinstance(sections_data, list):
            return Response(
                {'error': 'sections field must be a non-empty list'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(data=sections_data, many=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

