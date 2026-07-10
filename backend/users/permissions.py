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

class IsStaffOperationalOrLapanganOrManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['STAFF_OPERATIONAL', 'STAFF_LAPANGAN', 'MANAGER'])



class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'ADMIN')

class IsStaffOperationalOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and request.user.role in ['STAFF_OPERATIONAL', 'MANAGER', 'ADMIN'])

class IsAdminOrManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['ADMIN', 'MANAGER'])

class IsAdminOrManagerOrStaffOperational(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['ADMIN', 'MANAGER', 'STAFF_OPERATIONAL'])

