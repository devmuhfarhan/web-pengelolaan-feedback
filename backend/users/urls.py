from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CookieTokenObtainPairView, CookieTokenRefreshView, LogoutView, CurrentUserView, RegisterView, BeneficiaryDataViewSet

router = DefaultRouter()
router.register(r'beneficiaries', BeneficiaryDataViewSet, basename='beneficiary')

urlpatterns = [
    path('login/', CookieTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('register/', RegisterView.as_view(), name='register'),
    path('', include(router.urls)),
]

