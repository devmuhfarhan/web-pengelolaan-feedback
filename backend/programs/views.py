from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Program, Documentation
from .serializers import ProgramSerializer, DocumentationSerializer
from users.permissions import IsStaffOperational, IsStaffOperationalOrLapangan, IsManager, IsStaffOperationalOrLapanganOrManager, IsStaffLapangan
from django.db.models import Count, Avg
from feedbacks.models import Feedback

class ProgramViewSet(viewsets.ModelViewSet):
    queryset = Program.objects.all().order_by('-created_at')
    serializer_class = ProgramSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsStaffOperational()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(manager=self.request.user)

class DocumentationViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentationSerializer

    def get_queryset(self):
        # General documentation gallery only displays files NOT tied to any specific program
        return Documentation.objects.filter(program__isnull=True).order_by('-uploaded_at')

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsStaffLapangan()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

class DashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        from django.db.models.functions import TruncMonth
        from django.utils import timezone
        from datetime import timedelta

        # 6 months ago from now
        six_months_ago = timezone.now() - timedelta(days=180)

        # Monthly Trend
        monthly_trend = list(Feedback.objects.filter(
            created_at__gte=six_months_ago
        ).annotate(
            month=TruncMonth('created_at')
        ).values('month').annotate(
            feedbacks=Count('id')
        ).order_by('month'))

        # Format month names for the frontend
        formatted_trend = []
        for item in monthly_trend:
            formatted_trend.append({
                'name': item['month'].strftime('%b'),
                'feedbacks': item['feedbacks']
            })

        # Status Distribution
        status_dist = list(Feedback.objects.values('status').annotate(value=Count('id')))
        formatted_status = []
        for item in status_dist:
            name = item['status'].title()
            formatted_status.append({'name': name, 'value': item['value']})

        # Fetch and serialize recent feedbacks based on role
        if user.role == 'BENEFICIARY':
            recent_qs = Feedback.objects.filter(user=user).order_by('-created_at')[:5]
        else:
            recent_qs = Feedback.objects.order_by('-created_at')[:5]

        from feedbacks.serializers import FeedbackSerializer
        recent_serialized = FeedbackSerializer(recent_qs, many=True).data

        data = {
            'total_programs': Program.objects.count(),
            'total_feedbacks': Feedback.objects.count(),
            'average_rating': Feedback.objects.aggregate(Avg('rating'))['rating__avg'] or 0,
            'recent_feedbacks': recent_serialized,
            'monthly_trend': formatted_trend,
            'status_distribution': formatted_status,
        }

        if user.role == 'BENEFICIARY':
            data['my_feedbacks_count'] = Feedback.objects.filter(user=user).count()

        return Response(data)
