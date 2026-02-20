from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChurchViewSet, ChurchRoleViewSet, ChurchPastorViewSet

router = DefaultRouter()
router.register(r'churches', ChurchViewSet, basename='church')
router.register(r'church-roles', ChurchRoleViewSet, basename='church-role')
router.register(r'church-pastors', ChurchPastorViewSet, basename='church-pastor')

urlpatterns = [
    path('', include(router.urls)),
]
