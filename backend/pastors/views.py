from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Q
from datetime import date
from .models import Pastor
from .serializers import PastorSerializer


class PastorViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing pastors.
    
    Provides CRUD operations for pastors with search, filter, and ordering capabilities.
    
    List: GET /api/pastors/ (supports filtering: ?pastor_rank=<rank>, ?status=<status>, ?gender=<gender>)
    Create: POST /api/pastors/
    Retrieve: GET /api/pastors/{id}/
    Update: PUT /api/pastors/{id}/
    Partial Update: PATCH /api/pastors/{id}/
    Delete: DELETE /api/pastors/{id}/
    
    Custom Actions:
    - GET /api/pastors/statistics/ - Get pastor statistics
    - GET /api/pastors/active/ - Get all active pastors
    - GET /api/pastors/retired/ - Get all retired pastors
    - GET /api/pastors/{id}/summary/ - Get detailed pastor summary
    """
    queryset = Pastor.objects.all()
    serializer_class = PastorSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['full_name', 'national_id', 'phone_number', 'pastor_rank']
    ordering_fields = ['full_name', 'pastor_rank', 'date_of_birth', 'start_of_service', 'created_at', 'status']
    filterset_fields = ['gender', 'pastor_rank', 'status']
    ordering = ['full_name']  # Default ordering
    
    def get_queryset(self):
        """
        Optionally restricts the returned pastors based on query parameters.
        """
        queryset = Pastor.objects.all()
        
        # Filter by rank if provided
        rank = self.request.query_params.get('rank', None)
        if rank is not None:
            queryset = queryset.filter(pastor_rank=rank)
        
        # Filter by status if provided
        status_param = self.request.query_params.get('status', None)
        if status_param is not None:
            queryset = queryset.filter(status=status_param)
        
        # Filter by gender if provided
        gender = self.request.query_params.get('gender', None)
        if gender is not None:
            queryset = queryset.filter(gender=gender)
        
        return queryset
    
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
        from django.utils import timezone
        from datetime import timedelta
        
        # Use self.get_queryset() to respect any queryset scoping/filtering
        queryset = self.get_queryset()
        
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        total_pastors = queryset.count()
        recent_pastors = queryset.filter(created_at__gte=thirty_days_ago).count()
        
        # Pastors count by rank
        pastors_by_rank = queryset.values('pastor_rank').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Pastors count by status
        pastors_by_status = queryset.values('status').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Pastors count by gender
        pastors_by_gender = queryset.values('gender').annotate(
            count=Count('id')
        ).order_by('-count')
        
        return Response({
            'total_pastors': total_pastors,
            'recent_pastors': recent_pastors,
            'active_pastors': queryset.filter(status='active').count(),
            'retired_pastors': queryset.filter(status='retired').count(),
            'pastors_by_rank': list(pastors_by_rank),
            'pastors_by_status': list(pastors_by_status),
            'pastors_by_gender': list(pastors_by_gender),
        })
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """
        Get all active pastors.
        
        GET /api/pastors/active/
        """
        pastors = self.get_queryset().filter(status='active')
        serializer = self.get_serializer(pastors, many=True)
        serialized_data = serializer.data
        
        return Response({
            'count': len(serialized_data),
            'pastors': serialized_data
        })
    
    @action(detail=False, methods=['get'])
    def retired(self, request):
        """
        Get all retired pastors.
        
        GET /api/pastors/retired/
        """
        pastors = self.get_queryset().filter(status='retired')
        serializer = self.get_serializer(pastors, many=True)
        serialized_data = serializer.data
        
        return Response({
            'count': len(serialized_data),
            'pastors': serialized_data
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
        
        # Calculate age
        today = date.today()
        age = None
        if pastor.date_of_birth:
            age = today.year - pastor.date_of_birth.year - (
                (today.month, today.day) < (pastor.date_of_birth.month, pastor.date_of_birth.day)
            )
        
        # Calculate years of service
        years_of_service = None
        if pastor.start_of_service:
            years_of_service = today.year - pastor.start_of_service.year - (
                (today.month, today.day) < (pastor.start_of_service.month, pastor.start_of_service.day)
            )
        
        return Response({
            'pastor': serializer.data,
            'age': age,
            'years_of_service': years_of_service,
            # 'current_church': pastor.current_church if hasattr(pastor, 'current_church') else None,
        })
    
    @action(detail=False, methods=['post'])
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
        """
        pastors_data = request.data.get('pastors', [])
        
        if not pastors_data or not isinstance(pastors_data, list):
            return Response(
                {'error': 'pastors field must be a non-empty list'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(data=pastors_data, many=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
