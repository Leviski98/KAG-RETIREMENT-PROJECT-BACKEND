from django.contrib import admin
from .models import Church, ChurchRole, ChurchPastor

@admin.register(Church)
class ChurchAdmin(admin.ModelAdmin):
    list_display = ['church_id', 'church_name', 'section', 'location', 'created_at']
    list_filter = ['section']
    search_fields = ['church_name', 'location']

@admin.register(ChurchRole)
class ChurchRoleAdmin(admin.ModelAdmin):
    list_display = ['role_id', 'role_name', 'created_at']
    search_fields = ['role_name']

@admin.register(ChurchPastor)
class ChurchPastorAdmin(admin.ModelAdmin):
    list_display = ['church', 'pastor', 'role', 'created_at']
    list_filter = ['role', 'church']
    search_fields = ['pastor__full_name', 'church__church_name']