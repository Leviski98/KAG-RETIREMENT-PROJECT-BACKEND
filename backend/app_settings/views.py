from rest_framework.views import APIView
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from .models import SystemSettings
from .serializers import SystemSettingsSerializer


class SystemSettingsView(APIView):
    """
    GET  /api/settings/  — retrieve current settings (creates defaults on first call)
    PATCH /api/settings/ — partially update settings
    """

    def _get_instance(self):
        instance, _ = SystemSettings.objects.get_or_create(pk=1)
        return instance

    @extend_schema(
        tags=['Settings'],
        summary='Retrieve system settings',
        responses=SystemSettingsSerializer,
    )
    def get(self, request):
        serializer = SystemSettingsSerializer(self._get_instance())
        return Response(serializer.data)

    @extend_schema(
        tags=['Settings'],
        summary='Update system settings (partial)',
        request=SystemSettingsSerializer,
        responses=SystemSettingsSerializer,
    )
    def patch(self, request):
        instance = self._get_instance()
        serializer = SystemSettingsSerializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class SystemStatsView(APIView):
    """
    GET /api/settings/stats/ — live record counts across all main entities
    """

    @extend_schema(
        tags=['Settings'],
        summary='System record counts',
    )
    def get(self, request):
        from districts.models import District
        from sections.models import Section
        from churches.models import Church
        from pastors.models import Pastor

        return Response({
            'districts': District.objects.count(),
            'sections': Section.objects.count(),
            'churches': Church.objects.count(),
            'pastors': Pastor.objects.count(),
        })
