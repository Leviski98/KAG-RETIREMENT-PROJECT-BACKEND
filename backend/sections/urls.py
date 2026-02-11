from rest_framework.routers import DefaultRouter
from .views import SectionViewSet

router = DefaultRouter()
router.register(r'sections', SectionViewSet, basename='section')

urlpatterns = router.urls
