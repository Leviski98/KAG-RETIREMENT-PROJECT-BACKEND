from django.contrib import admin
from .models import Section


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ['name', 'district', 'created_at', 'updated_at']
    search_fields = ['name']
    list_filter = ['district', 'created_at', 'updated_at']
    readonly_fields = ['created_at', 'updated_at']
