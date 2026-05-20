from rest_framework import serializers
from .models import Feedback
from users.serializers import UserSerializer
from programs.serializers import ProgramSerializer

class FeedbackSerializer(serializers.ModelSerializer):
    user_detail = UserSerializer(source='user', read_only=True)
    program_detail = ProgramSerializer(source='program', read_only=True)

    class Meta:
        model = Feedback
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')
