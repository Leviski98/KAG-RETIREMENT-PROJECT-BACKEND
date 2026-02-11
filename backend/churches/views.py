from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Church, ChurchRole, ChurchPastor
from .serializers import ChurchSerializer, ChurchRoleSerializer, ChurchPastorSerializer


class ChurchViewSet(viewsets.ModelViewSet):
    """ViewSet for Church model with filtering and search"""
    queryset = Church.objects.all()
    serializer_class = ChurchSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['church_name', 'location']
    ordering_fields = ['church_name', 'created_at']
    filterset_fields = ['section', 'church_name']


class ChurchRoleViewSet(viewsets.ModelViewSet):
    """ViewSet for ChurchRole model"""
    queryset = ChurchRole.objects.all()
    serializer_class = ChurchRoleSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['role_name']
    ordering_fields = ['role_name', 'created_at']
    filterset_fields = ['role_name']


class ChurchPastorViewSet(viewsets.ModelViewSet):
    """ViewSet for ChurchPastor assignments with filtering"""
    queryset = ChurchPastor.objects.all()
    serializer_class = ChurchPastorSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['church__church_name', 'pastor__full_name', 'role__role_name']
    ordering_fields = ['created_at']
    filterset_fields = ['church', 'pastor', 'role']
