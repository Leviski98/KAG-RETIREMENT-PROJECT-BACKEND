from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
from .models import Section
from .serializers import SectionSerializer
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
    - POST /api/sections/bulk_create/ - Create multiple sections at once
    
    Filtering:
    - Use ?district=<id> to filter by district
    - Use ?name=<name> to filter by exact name
    """
    queryset = Section.objects.select_related('district').all()
    serializer_class = SectionSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'district__name']
    ordering_fields = ['name', 'created_at', 'updated_at', 'district__name']
    filterset_fields = ['name', 'district']
    ordering = ['name']  # Default ordering
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Get statistics about sections.
        
        GET /api/sections/statistics/
        
        Returns:
            - total_sections: Total number of sections
            - sections_by_district: Count of sections per district
            - recent_sections: Sections created in the last 30 days
        """
        total_sections = Section.objects.count()
        thirty_days_ago = timezone.now() - timedelta(days=30)
        recent_sections = Section.objects.filter(created_at__gte=thirty_days_ago).count()
        
        # Sections count by district
        sections_by_district = Section.objects.values('district__name').annotate(
            count=Count('id')
        ).order_by('-count')
        
        oldest_section = Section.objects.order_by('created_at').first()
        newest_section = Section.objects.order_by('-created_at').first()
        
        return Response({
            'total_sections': total_sections,
            'recent_sections': recent_sections,
            'sections_by_district': list(sections_by_district),
            'districts_with_sections': District.objects.filter(sections__isnull=False).distinct().count(),
            'oldest_section': oldest_section.name if oldest_section else None,
            'newest_section': newest_section.name if newest_section else None,
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
            # Use atomic transaction to ensure all sections are created or none are created.
            # This prevents partial saves if any section fails validation or database constraints.
            with transaction.atomic():
                serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
