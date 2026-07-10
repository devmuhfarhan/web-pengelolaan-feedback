from rest_framework import serializers
from .models import Feedback, FeedbackCategory
from users.serializers import UserSerializer
from programs.serializers import ProgramSerializer

class FeedbackCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = FeedbackCategory
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')


class FeedbackSerializer(serializers.ModelSerializer):
    user_detail = UserSerializer(source='user', read_only=True)
    program_detail = ProgramSerializer(source='program', read_only=True)

    class Meta:
        model = Feedback
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')
