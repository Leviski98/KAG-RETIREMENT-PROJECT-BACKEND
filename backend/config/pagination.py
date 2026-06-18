from rest_framework.pagination import PageNumberPagination


class DynamicPageNumberPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 200

    def get_page_size(self, request):
        # Per-request override always wins
        if self.page_size_query_param in request.query_params:
            return super().get_page_size(request)
        try:
            from app_settings.models import SystemSettings
            obj = SystemSettings.objects.only('default_page_size').get(pk=1)
            return obj.default_page_size
        except Exception:
            return self.page_size
