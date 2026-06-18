from django.urls import path
from .views import SystemSettingsView, SystemStatsView

urlpatterns = [
    path('settings/', SystemSettingsView.as_view(), name='system-settings'),
    path('settings/stats/', SystemStatsView.as_view(), name='system-stats'),
]
