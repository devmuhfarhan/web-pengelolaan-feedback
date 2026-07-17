from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CookieTokenObtainPairView, CookieTokenRefreshView, LogoutView, CurrentUserView, RegisterView, BeneficiaryDataViewSet, UserViewSet, ActivityLogViewSet, ForgotPasswordView

router = DefaultRouter()
router.register(r'beneficiaries', BeneficiaryDataViewSet, basename='beneficiary')
router.register(r'users', UserViewSet, basename='user')
router.register(r'activity-logs', ActivityLogViewSet, basename='activity-log')

urlpatterns = [
    path('login/', CookieTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('register/', RegisterView.as_view(), name='register'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('', include(router.urls)),
]

