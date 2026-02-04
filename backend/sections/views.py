from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Section
from .serializers import SectionSerializer


class SectionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing sections.
    
    Provides CRUD operations for sections with search, filter, and ordering capabilities.
    """
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'code', 'created_at']
    filterset_fields = ['name', 'code']
