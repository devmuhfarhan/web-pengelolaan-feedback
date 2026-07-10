from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FeedbackViewSet, FeedbackCategoryViewSet

router = DefaultRouter()
router.register(r'feedbacks', FeedbackViewSet, basename='feedback')
router.register(r'feedback-categories', FeedbackCategoryViewSet, basename='feedback-category')

urlpatterns = [
    path('', include(router.urls)),
]
