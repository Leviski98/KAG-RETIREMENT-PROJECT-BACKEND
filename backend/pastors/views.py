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
    
    List: GET /api/pastors/
    Create: POST /api/pastors/
    Retrieve: GET /api/pastors/{id}/
    Update: PUT /api/pastors/{id}/
    Partial Update: PATCH /api/pastors/{id}/
    Delete: DELETE /api/pastors/{id}/
    
    Custom Actions:
    - GET /api/pastors/statistics/ - Get pastor statistics
    - GET /api/pastors/by_rank/?rank=<rank> - Get pastors by rank
    - GET /api/pastors/by_status/?status=<status> - Get pastors by status
    - GET /api/pastors/by_gender/?gender=<gender> - Get pastors by gender
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
    
    def list(self, request, *args, **kwargs):
        """
        List all pastors.
        Returns a paginated list of all pastors in the system.
        """
        return super().list(request, *args, **kwargs)
    
    def create(self, request, *args, **kwargs):
        """
        Create a new pastor.
        Requires full_name, gender, pastor_rank, date_of_birth, and phone_number.
        """
        return super().create(request, *args, **kwargs)
    
    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a specific pastor by ID.
        """
        return super().retrieve(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        """
        Update a pastor completely (PUT).
        """
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        """
        Partially update a pastor (PATCH).
        """
        return super().partial_update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """
        Delete a pastor.
        """
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Get statistics about pastors.
        
        GET /api/pastors/statistics/
        
        Returns:
            - total_pastors: Total number of pastors
            - pastors_by_rank: Count of pastors per rank
            - pastors_by_status: Count of pastors per status
            - pastors_by_gender: Count of pastors per gender
        """
        from django.utils import timezone
        from datetime import timedelta
        
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
    
    @action(detail=False, methods=['get'])
    def by_rank(self, request):
        """
        Get all pastors for a specific rank.
        
        GET /api/pastors/by_rank/?rank=<rank>
        
        Query Parameters:
            - rank: Rank to filter by (ArchBishop, Bishop, Presbyter, Reverend, Pastor)
        """
        rank = request.query_params.get('rank', None)
        
        if rank is None:
            return Response(
                {'error': 'rank query parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        pastors = Pastor.objects.filter(pastor_rank=rank)
        serializer = self.get_serializer(pastors, many=True)
        
        return Response({
            'rank': rank,
            'count': pastors.count(),
            'pastors': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def by_status(self, request):
        """
        Get all pastors for a specific status.
        
        GET /api/pastors/by_status/?status=<status>
        
        Query Parameters:
            - status: Status to filter by (active, suspended, retired, deceased)
        """
        status_param = request.query_params.get('status', None)
        
        if status_param is None:
            return Response(
                {'error': 'status query parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        pastors = Pastor.objects.filter(status=status_param)
        serializer = self.get_serializer(pastors, many=True)
        
        return Response({
            'status': status_param,
            'count': pastors.count(),
            'pastors': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def by_gender(self, request):
        """
        Get all pastors for a specific gender.
        
        GET /api/pastors/by_gender/?gender=<gender>
        
        Query Parameters:
            - gender: Gender to filter by (Male, Female)
        """
        gender = request.query_params.get('gender', None)
        
        if gender is None:
            return Response(
                {'error': 'gender query parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        pastors = Pastor.objects.filter(gender=gender)
        serializer = self.get_serializer(pastors, many=True)
        
        return Response({
            'gender': gender,
            'count': pastors.count(),
            'pastors': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """
        Get all active pastors.
        
        GET /api/pastors/active/
        """
        pastors = Pastor.objects.filter(status='active')
        serializer = self.get_serializer(pastors, many=True)
        
        return Response({
            'count': pastors.count(),
            'pastors': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def retired(self, request):
        """
        Get all retired pastors.
        
        GET /api/pastors/retired/
        """
        pastors = Pastor.objects.filter(status='retired')
        serializer = self.get_serializer(pastors, many=True)
        
        return Response({
            'count': pastors.count(),
            'pastors': serializer.data
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
