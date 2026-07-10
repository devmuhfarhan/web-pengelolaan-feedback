from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import BeneficiaryData, BeneficiaryReplacement, ActivityLog
from programs.models import Program
import uuid

User = get_user_model()

class ActivityLogSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = ActivityLog
        fields = ('id', 'user', 'username', 'action', 'description', 'created_at')
        read_only_fields = ('id', 'created_at')


class ProgramInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = ('id', 'title')

class BeneficiaryReplacementSerializer(serializers.ModelSerializer):
    program_detail = ProgramInfoSerializer(source='program', read_only=True)
    class Meta:
        model = BeneficiaryReplacement
        fields = ('id', 'program', 'program_detail', 'date_replaced', 'created_at', 'created_by')
        read_only_fields = ('id', 'created_at', 'created_by')

class UserSerializer(serializers.ModelSerializer):
    age = serializers.SerializerMethodField()
    program_detail = ProgramInfoSerializer(source='program', read_only=True)
    replacements = BeneficiaryReplacementSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone_number', 'birth_date', 'gender', 'program', 'program_detail', 'date_provided', 'replacements', 'age')
        read_only_fields = ('id', 'role')

    def get_age(self, obj):
        if obj.birth_date:
            from datetime import date
            today = date.today()
            return today.year - obj.birth_date.year - ((today.month, today.day) < (obj.birth_date.month, obj.birth_date.day))
        return None

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    fullName = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=User.Role.choices)

    class Meta:
        model = User
        fields = ('email', 'password', 'fullName', 'role')

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email tidak boleh kosong.")
        # Cek keunikan email secara case-insensitive
        if User.objects.filter(email__iexact=value).exists() or User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Email ini sudah terdaftar.")
        return value


    def create(self, validated_data):
        email = validated_data.get('email')
        username = email # Use email as username
        password = validated_data.get('password')
        role = validated_data.get('role')
        full_name = validated_data.get('fullName', '')
        
        # Simple split for first and last name
        name_parts = full_name.split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ''

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role=role
        )
        return user

class BeneficiaryDataSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, default='Password123!')
    age = serializers.SerializerMethodField()
    program_detail = ProgramInfoSerializer(source='program', read_only=True)
    replacements = BeneficiaryReplacementSerializer(many=True, read_only=True)
    email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)
    username = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'phone_number', 'role', 'password', 'birth_date', 'gender', 'program', 'program_detail', 'date_provided', 'replacements', 'age', 'updated_by')
        read_only_fields = ('id', 'role', 'updated_by')

    def create(self, validated_data):
        password = validated_data.pop('password', 'Password123!')
        validated_data['role'] = 'PENERIMA_MANFAAT'
        if not validated_data.get('username'):
            validated_data['username'] = f"penerima_{uuid.uuid4().hex[:8]}"
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)
        return super().update(instance, validated_data)

    def get_age(self, obj):
        if obj.birth_date:
            from datetime import date
            today = date.today()
            return today.year - obj.birth_date.year - ((today.month, today.day) < (obj.birth_date.month, obj.birth_date.day))
        return None

