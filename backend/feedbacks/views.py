from rest_framework import viewsets, permissions
from rest_framework.permissions import IsAuthenticated
from .models import Feedback
from .serializers import FeedbackSerializer

class FeedbackViewSet(viewsets.ModelViewSet):
    serializer_class = FeedbackSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'PENERIMA_MANFAAT':
            return Feedback.objects.filter(user=user).order_by('-created_at')
        return Feedback.objects.all().order_by('-created_at')

    def get_permissions(self):
        if self.action == 'create':
            # Penerima Manfaat and Staff Lapangan can create
            class CanCreateFeedback(permissions.BasePermission):
                def has_permission(self, request, view):
                    return request.user.role in ['PENERIMA_MANFAAT', 'STAFF_LAPANGAN']
            return [IsAuthenticated(), CanCreateFeedback()]
        
        if self.action in ['update', 'partial_update']:
            class CanUpdateFeedback(permissions.BasePermission):
                def has_permission(self, request, view):
                    return request.user.role in ['MANAGER', 'STAFF_OPERATIONAL']
            return [IsAuthenticated(), CanUpdateFeedback()]

        if self.action == 'destroy':
            class CanDestroyFeedback(permissions.BasePermission):
                def has_permission(self, request, view):
                    return request.user.role == 'STAFF_OPERATIONAL'
            return [IsAuthenticated(), CanDestroyFeedback()]

        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
