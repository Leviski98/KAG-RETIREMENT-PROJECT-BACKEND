from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import District
from .serializers import DistrictSerializer


class DistrictViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing districts.
    
    Provides CRUD operations for districts with search, filter, and ordering capabilities.
    """
    queryset = District.objects.all()
    serializer_class = DistrictSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'code', 'created_at']
    filterset_fields = ['name', 'code']
