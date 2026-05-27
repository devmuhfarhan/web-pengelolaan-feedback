from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import BeneficiaryData

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone_number')
        read_only_fields = ('id', 'role')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    fullName = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=User.Role.choices)

    class Meta:
        model = User
        fields = ('email', 'password', 'fullName', 'role')

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

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'phone_number', 'role', 'password')
        read_only_fields = ('id', 'role')

    def create(self, validated_data):
        password = validated_data.pop('password', 'Password123!')
        validated_data['role'] = 'PENERIMA_MANFAAT'
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user

