from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Program, Documentation
from .serializers import ProgramSerializer, DocumentationSerializer
from users.permissions import IsStaffOperational, IsStaffOperationalOrLapangan, IsManager
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
    queryset = Documentation.objects.all().order_by('-uploaded_at')
    serializer_class = DocumentationSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsStaffOperationalOrLapangan()]
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

        data = {
            'total_programs': Program.objects.count(),
            'total_feedbacks': Feedback.objects.count(),
            'average_rating': Feedback.objects.aggregate(Avg('rating'))['rating__avg'] or 0,
            'recent_feedbacks': Feedback.objects.order_by('-created_at')[:5].values('id', 'content', 'rating', 'status', 'created_at'),
            'monthly_trend': formatted_trend,
            'status_distribution': formatted_status,
        }

        if user.role == 'PENERIMA_MANFAAT':
            data['my_feedbacks_count'] = Feedback.objects.filter(user=user).count()

        return Response(data)
