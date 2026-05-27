from rest_framework import serializers
from .models import Program, Documentation
from users.serializers import UserSerializer

class MiniProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = ('id', 'title')

class DocumentationSerializer(serializers.ModelSerializer):
    uploaded_by_detail = UserSerializer(source='uploaded_by', read_only=True)
    program_detail = MiniProgramSerializer(source='program', read_only=True)

    class Meta:
        model = Documentation
        fields = '__all__'
        read_only_fields = ('uploaded_by', 'uploaded_at')

class ProgramSerializer(serializers.ModelSerializer):
    manager_detail = UserSerializer(source='manager', read_only=True)
    documentations = DocumentationSerializer(many=True, read_only=True)

    class Meta:
        model = Program
        fields = '__all__'
        read_only_fields = ('manager', 'created_at', 'updated_at')
