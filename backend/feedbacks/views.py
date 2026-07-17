from rest_framework import viewsets, permissions
from rest_framework.permissions import IsAuthenticated
from .models import Feedback, FeedbackCategory, FeedbackQuestion
from .serializers import FeedbackSerializer, FeedbackCategorySerializer, FeedbackQuestionSerializer
from users.permissions import IsAdmin


class FeedbackViewSet(viewsets.ModelViewSet):
    serializer_class = FeedbackSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'BENEFICIARY':
            return Feedback.objects.filter(user=user).order_by('-created_at')
        return Feedback.objects.all().order_by('-created_at')

    def get_permissions(self):
        if self.action == 'create':
            # Only Penerima Manfaat can create feedback
            class CanCreateFeedback(permissions.BasePermission):
                def has_permission(self, request, view):
                    return request.user.role == 'BENEFICIARY'
            return [IsAuthenticated(), CanCreateFeedback()]
        
        if self.action in ['update', 'partial_update']:
            class CanUpdateFeedback(permissions.BasePermission):
                def has_permission(self, request, view):
                    return request.user.role in ['MANAGER', 'OPERATIONAL_STAFF']
            return [IsAuthenticated(), CanUpdateFeedback()]

        if self.action == 'destroy':
            class CanDestroyFeedback(permissions.BasePermission):
                def has_permission(self, request, view):
                    return request.user.role == 'OPERATIONAL_STAFF'
            return [IsAuthenticated(), CanDestroyFeedback()]

        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class FeedbackCategoryViewSet(viewsets.ModelViewSet):
    queryset = FeedbackCategory.objects.all().order_by('-created_at')
    serializer_class = FeedbackCategorySerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAdmin()]

class FeedbackQuestionViewSet(viewsets.ModelViewSet):
    queryset = FeedbackQuestion.objects.all().order_by('order', 'id')
    serializer_class = FeedbackQuestionSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAdmin()]
