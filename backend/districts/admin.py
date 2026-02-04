from django.contrib import admin
from .models import District


@admin.register(District)
class DistrictAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at', 'updated_at']
    search_fields = ['name']
    list_filter = ['created_at', 'updated_at']
    readonly_fields = ['created_at', 'updated_at']
