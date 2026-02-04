from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PastorViewSet

router = DefaultRouter()
router.register(r'pastors', PastorViewSet, basename='pastor')

urlpatterns = [
    path('', include(router.urls)),
from django.urls import path

urlpatterns = [
    # Add your pastor URLs here
]
