from django.conf import settings
from datetime import datetime, timedelta
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from drf_spectacular.utils import extend_schema
from .serializers import UserSerializer, RegisterSerializer

class CookieTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            access_token = response.data.get('access')
            refresh_token = response.data.get('refresh')
            
            remember_me = request.data.get('remember_me', False)
            if remember_me:
                access_max_age = 30 * 24 * 60 * 60 # 30 days
                refresh_max_age = 30 * 24 * 60 * 60
                access_expires = datetime.now() + timedelta(days=30)
                refresh_expires = datetime.now() + timedelta(days=30)
            else:
                access_max_age = None
                refresh_max_age = None
                access_expires = datetime.now() + settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME']
                refresh_expires = datetime.now() + settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME']
            
            response.set_cookie(
                key=settings.SIMPLE_JWT['AUTH_COOKIE'],
                value=access_token,
                expires=access_expires,
                secure=False, # Set True in production
                httponly=True,
                samesite='Lax'
            )
            response.set_cookie(
                key='refresh_token',
                value=refresh_token,
                expires=refresh_expires,
                secure=False,
                httponly=True,
                samesite='Lax'
            )
            # Remove tokens from response body for extra security (optional, but good practice)
            # del response.data['access']
            # del response.data['refresh']
            response.data['message'] = 'Login successful'
        return response

class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh_token')
        
        # Copy data to avoid immutable QueryDict errors
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        
        if refresh_token:
            data['refresh'] = refresh_token
            
        serializer = self.get_serializer(data=data)
        try:
            serializer.is_valid(raise_exception=True)
        except (InvalidToken, TokenError) as e:
            return Response({'detail': str(e)}, status=status.HTTP_401_UNAUTHORIZED)
            
        access_token = serializer.validated_data.get('access')
        response = Response(serializer.validated_data, status=status.HTTP_200_OK)
        
        response.set_cookie(
            key=settings.SIMPLE_JWT['AUTH_COOKIE'],
            value=access_token,
            expires=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
            secure=False,
            httponly=True,
            samesite='Lax'
        )
        return response

class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)
    
    @extend_schema(responses={200: {'description': 'Successfully logged out'}})
    def post(self, request):
        response = Response({'message': 'Logged out successfully'})
        response.delete_cookie(settings.SIMPLE_JWT['AUTH_COOKIE'])
        response.delete_cookie('refresh_token')
        return response

class CurrentUserView(APIView):
    permission_classes = (IsAuthenticated,)
    
    @extend_schema(responses={200: UserSerializer})
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class RegisterView(APIView):
    permission_classes = (AllowAny,)

    @extend_schema(request=RegisterSerializer, responses={201: UserSerializer})
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
