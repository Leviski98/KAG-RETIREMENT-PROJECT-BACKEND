from django.contrib import admin
from .models import Pastor


@admin.register(Pastor)
class PastorAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'gender', 'pastor_rank', 'status', 'phone_number', 'date_of_birth']
    search_fields = ['full_name', 'national_id', 'phone_number']
    list_filter = ['gender', 'pastor_rank', 'status', 'created_at']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'start_of_service'