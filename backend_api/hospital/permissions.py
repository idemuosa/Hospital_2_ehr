from rest_framework import permissions

class IsDoctor(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request.user, 'hospital_profile') and request.user.hospital_profile.role == 'doctor'

class IsNurse(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request.user, 'hospital_profile') and request.user.hospital_profile.role == 'nurse'

class IsPharmacist(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request.user, 'hospital_profile') and request.user.hospital_profile.role == 'pharmacist'

class IsReceptionist(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request.user, 'hospital_profile') and request.user.hospital_profile.role == 'receptionist'

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.is_superuser or (hasattr(request.user, 'hospital_profile') and request.user.hospital_profile.role == 'admin'))
