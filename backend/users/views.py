from django.conf import settings
from datetime import datetime, timedelta
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status, viewsets
from drf_spectacular.utils import extend_schema
from .serializers import UserSerializer, RegisterSerializer, BeneficiaryDataSerializer, ActivityLogSerializer
from .models import User, ActivityLog
from .permissions import IsStaffOperationalOrReadOnly, IsAdmin

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
            
            # Log login action
            try:
                user = User.objects.get(username=request.data.get('username'))
                ActivityLog.objects.create(
                    user=user,
                    action=ActivityLog.Action.LOGIN,
                    description=f"{user.username} logged in"
                )
            except User.DoesNotExist:
                pass
                
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

from rest_framework.decorators import action
from .models import BeneficiaryReplacement

class BeneficiaryDataViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(role='PENERIMA_MANFAAT').order_by('-id')
    serializer_class = BeneficiaryDataSerializer
    permission_classes = [IsStaffOperationalOrReadOnly]

    def perform_create(self, serializer):
        user = serializer.save(updated_by=self.request.user)
        ActivityLog.objects.create(
            user=self.request.user,
            action=ActivityLog.Action.CREATE,
            description=f"Created beneficiary {user.username}"
        )

    def perform_update(self, serializer):
        user = serializer.save(updated_by=self.request.user)
        ActivityLog.objects.create(
            user=self.request.user,
            action=ActivityLog.Action.UPDATE,
            description=f"Updated beneficiary {user.username}"
        )

    def perform_destroy(self, instance):
        username = instance.username
        instance.delete()
        ActivityLog.objects.create(
            user=self.request.user,
            action=ActivityLog.Action.DELETE,
            description=f"Deleted beneficiary {username}"
        )

    @action(detail=True, methods=['post'])
    def add_replacement(self, request, pk=None):
        user = self.get_object()
        program_id = request.data.get('program')
        date_replaced = request.data.get('date_replaced')
        if not date_replaced:
            return Response({'error': 'date_replaced is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        replacement = BeneficiaryReplacement.objects.create(
            user=user,
            program_id=program_id,
            date_replaced=date_replaced,
            created_by=request.user
        )
        # Update user's updated_by
        user.updated_by = request.user
        user.save()
        ActivityLog.objects.create(
            user=request.user,
            action=ActivityLog.Action.UPDATE,
            description=f"Added replacement for beneficiary {user.username}"
        )
        return Response({'message': 'Replacement added successfully'}, status=status.HTTP_201_CREATED)

class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ActivityLog.objects.all().order_by('-created_at')
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAdmin]

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
