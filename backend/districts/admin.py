from django.contrib import admin
from .models import District


@admin.register(District)
class DistrictAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'created_at', 'updated_at']
    search_fields = ['name', 'code', 'description']
    list_filter = ['created_at', 'updated_at']
    readonly_fields = ['created_at', 'updated_at']
