"""
Role-based access helpers shared across apps.

Three system roles exist (assigned via `UserProfile.role` at approval time):
- Administrator (`is_staff=True`): full read/write access everywhere.
- Archbishop: read-only access across all data.
- Bishop: read-only access, scoped to `profile.districts`.
"""
from rest_framework.permissions import SAFE_METHODS, BasePermission

from .models import UserProfile


def get_profile(user):
    return getattr(user, 'profile', None)


def is_admin_role(user) -> bool:
    return bool(user and user.is_authenticated and (user.is_staff or user.is_superuser))


def is_bishop_role(user) -> bool:
    profile = get_profile(user)
    return bool(profile and profile.role == UserProfile.ROLE_BISHOP)


def bishop_district_ids(user):
    """
    District ids a Bishop is scoped to, or None if the user is unrestricted
    (Administrator or Archbishop, or not a Bishop at all).
    """
    if is_admin_role(user) or not is_bishop_role(user):
        return None
    profile = get_profile(user)
    return set(profile.districts.values_list('id', flat=True))


class IsAdminOrReadOnly(BasePermission):
    """Full access for Administrators; read-only for any other authenticated user."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)
        return is_admin_role(request.user)
