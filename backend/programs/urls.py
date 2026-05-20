from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProgramViewSet, DocumentationViewSet, DashboardAPIView

router = DefaultRouter()
router.register(r'programs', ProgramViewSet)
router.register(r'documentations', DocumentationViewSet)

urlpatterns = [
    path('dashboard/', DashboardAPIView.as_view(), name='dashboard_stats'),
    path('', include(router.urls)),
]
