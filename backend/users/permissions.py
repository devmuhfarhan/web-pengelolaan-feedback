from rest_framework import permissions

class IsStaffOperational(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'OPERATIONAL_STAFF')

class IsManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'MANAGER')

class IsStaffLapangan(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'FIELD_STAFF')

class IsPenerimaManfaat(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'BENEFICIARY')

class IsStaffOperationalOrManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['OPERATIONAL_STAFF', 'MANAGER'])

class IsStaffOperationalOrLapangan(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['OPERATIONAL_STAFF', 'FIELD_STAFF'])

class IsStaffOperationalOrLapanganOrManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['OPERATIONAL_STAFF', 'FIELD_STAFF', 'MANAGER'])



class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'ADMIN')

class IsStaffOperationalOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.method == 'POST' and request.user and request.user.is_authenticated and request.user.role == 'FIELD_STAFF':
            return True
        return bool(request.user and request.user.is_authenticated and request.user.role in ['OPERATIONAL_STAFF', 'MANAGER', 'ADMIN'])

class IsAdminOrManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['ADMIN', 'MANAGER'])

class IsAdminOrManagerOrStaffOperational(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['ADMIN', 'MANAGER', 'OPERATIONAL_STAFF'])

