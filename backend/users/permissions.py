from rest_framework import permissions

class IsStaffOperational(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'STAFF_OPERATIONAL')

class IsManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'MANAGER')

class IsStaffLapangan(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'STAFF_LAPANGAN')

class IsPenerimaManfaat(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'PENERIMA_MANFAAT')

class IsStaffOperationalOrManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['STAFF_OPERATIONAL', 'MANAGER'])

class IsStaffOperationalOrLapangan(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['STAFF_OPERATIONAL', 'STAFF_LAPANGAN'])
