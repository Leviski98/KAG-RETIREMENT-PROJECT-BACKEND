from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count
from django.db import transaction
from django.utils import timezone
from datetime import date, timedelta
from .models import Pastor
from .serializers import PastorSerializer


def calculate_years_from_date(from_date):
    """
    Calculate the number of years between a given date and today.
    
    Args:
        from_date: The starting date (date object or None)
    
    Returns:
        Number of complete years or None if from_date is None
    """
    if not from_date:
        return None
    
    today = date.today()
    return today.year - from_date.year - (
        (today.month, today.day) < (from_date.month, from_date.day)
    )


class PastorViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing pastors.
    
    Provides CRUD operations for pastors with search, filter, and ordering capabilities.
    
    Standard endpoints:
    - GET /api/pastors/ - List all pastors (supports filtering via ?pastor_rank=Bishop&status=active&gender=Male)
    - POST /api/pastors/ - Create a new pastor
    - GET /api/pastors/{id}/ - Retrieve a specific pastor
    - PUT /api/pastors/{id}/ - Full update of a pastor
    - PATCH /api/pastors/{id}/ - Partial update of a pastor
    - DELETE /api/pastors/{id}/ - Delete a pastor
    
    Custom Actions:
    - GET /api/pastors/statistics/ - Get pastor statistics and counts
    - GET /api/pastors/{id}/summary/ - Get detailed pastor summary with calculated fields
    - POST /api/pastors/bulk_create/ - Create multiple pastors at once
    
    Filtering:
    Use query parameters for filtering: ?pastor_rank=Bishop&status=active&gender=Male
    Search: ?search=<query> - Search by name, national_id, phone_number, or rank
    Ordering: ?ordering=full_name (or -full_name for descending)
    """
    queryset = Pastor.objects.all()
    serializer_class = PastorSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['full_name', 'national_id', 'phone_number', 'pastor_rank']
    ordering_fields = ['full_name', 'pastor_rank', 'date_of_birth', 'start_of_service', 'created_at', 'status']
    filterset_fields = ['gender', 'pastor_rank', 'status']
    ordering = ['full_name']  # Default ordering
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Get statistics about pastors.
        
        GET /api/pastors/statistics/
        
        Returns:
            - total_pastors: Total number of pastors
            - recent_pastors: Pastors created in the last 30 days
            - active_pastors: Count of active pastors
            - retired_pastors: Count of retired pastors
            - pastors_by_rank: Count of pastors per rank
            - pastors_by_status: Count of pastors per status
            - pastors_by_gender: Count of pastors per gender
        """
        total_pastors = Pastor.objects.count()
        thirty_days_ago = timezone.now() - timedelta(days=30)
        recent_pastors = Pastor.objects.filter(created_at__gte=thirty_days_ago).count()
        
        # Pastors count by rank
        pastors_by_rank = Pastor.objects.values('pastor_rank').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Pastors count by status
        pastors_by_status = Pastor.objects.values('status').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Pastors count by gender
        pastors_by_gender = Pastor.objects.values('gender').annotate(
            count=Count('id')
        ).order_by('-count')
        
        return Response({
            'total_pastors': total_pastors,
            'recent_pastors': recent_pastors,
            'active_pastors': Pastor.objects.filter(status='active').count(),
            'retired_pastors': Pastor.objects.filter(status='retired').count(),
            'pastors_by_rank': list(pastors_by_rank),
            'pastors_by_status': list(pastors_by_status),
            'pastors_by_gender': list(pastors_by_gender),
        })
    
    @action(detail=True, methods=['get'])
    def summary(self, request, pk=None):
        """
        Get a summary of a specific pastor.
        
        GET /api/pastors/{id}/summary/
        
        Returns detailed information about a pastor including calculated fields.
        """
        pastor = self.get_object()
        serializer = self.get_serializer(pastor)
        
        # Calculate age and years of service using helper function
        age = calculate_years_from_date(pastor.date_of_birth)
        years_of_service = calculate_years_from_date(pastor.start_of_service)
        
        return Response({
            'pastor': serializer.data,
            'age': age,
            'years_of_service': years_of_service,
        })
    
    @action(detail=False, methods=['post'])
    @transaction.atomic
    def bulk_create(self, request):
        """
        Create multiple pastors at once.
        
        POST /api/pastors/bulk_create/
        
        Request body should contain a list of pastor objects:
        {
            "pastors": [
                {"full_name": "John Doe", "gender": "Male", ...},
                {"full_name": "Jane Smith", "gender": "Female", ...}
            ]
        }
        
        Maximum 1000 pastors per request to prevent DoS attacks.
        """
        pastors_data = request.data.get('pastors', [])
        
        if not pastors_data or not isinstance(pastors_data, list):
            return Response(
                {'error': 'pastors field must be a non-empty list'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Rate limiting: Check maximum limit
        MAX_BULK_CREATE = 1000
        if len(pastors_data) > MAX_BULK_CREATE:
            return Response(
                {'error': f'Maximum {MAX_BULK_CREATE} pastors can be created at once. You attempted to create {len(pastors_data)}.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(data=pastors_data, many=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
