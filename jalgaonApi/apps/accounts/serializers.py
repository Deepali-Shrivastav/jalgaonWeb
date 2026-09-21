from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
import re

User = get_user_model()

def validate_phone_number(value):
    """
    Validates Indian phone number format.
    Accepts: 10-digit numbers, optionally prefixed with +91 or 0.
    Normalizes to 10-digit format stored in DB.
    """
    # Strip spaces and dashes
    value = value.strip().replace(' ', '').replace('-', '')

    # Remove country code if present
    if value.startswith('+91'):
        value = value[3:]
    elif value.startswith('91') and len(value) == 12:
        value = value[2:]
    elif value.startswith('0') and len(value) == 11:
        value = value[1:]

    # Must be exactly 10 digits now
    if not re.fullmatch(r'[6-9]\d{9}', value):
        raise serializers.ValidationError(
            "Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9."
        )
    return value


class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['phone_number', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def validate_phone_number(self, value):
        return validate_phone_number(value)

    def validate_password(self, value):
        """Enforce strong password using Django's built-in validators."""
        from django.contrib.auth.password_validation import validate_password as dj_validate
        try:
            dj_validate(value)
        except Exception as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            phone_number=validated_data['phone_number'],
            password=validated_data['password']
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    phone_number = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate_phone_number(self, value):
        return validate_phone_number(value)

    def validate(self, data):
        phone_number = data.get('phone_number')
        password = data.get('password')
        
        if not User.objects.filter(phone_number=phone_number).exists():
            raise serializers.ValidationError("Account with this mobile number not found.")
            
        user = authenticate(phone_number=phone_number, password=password)
        if not user:
            raise serializers.ValidationError("Invalid credentials.")
        if not user.is_active:
            raise serializers.ValidationError("This account has been deactivated.")
        return {'user': user}


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'phone_number', 'first_name', 'last_name', 'profile_pic', 'role', 'email', 'is_verified', 'bio', 'date_of_birth']
        read_only_fields = ['id', 'phone_number', 'role', 'is_verified']

    def validate_phone_number(self, value):
        return validate_phone_number(value)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Extends the default JWT serializer to include user role in the token payload.
    This allows the frontend to read the role from the decoded token without
    an extra API call.
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['role'] = user.role
        token['phone_number'] = user.phone_number
        token['is_verified'] = user.is_verified
        return token


class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Serializer for requesting a password reset.
    Accepts either an email address or a 10-digit phone number.
    """
    email = serializers.EmailField(required=False, allow_blank=True)
    phone_number = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        email = data.get('email', '').strip()
        phone = data.get('phone_number', '').strip()
        if not email and not phone:
            raise serializers.ValidationError("Please provide either an email address or a phone number.")
        return data


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Serializer for confirming password reset with token and new password.
    """
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate_new_password(self, value):
        from django.contrib.auth.password_validation import validate_password as dj_validate
        try:
            dj_validate(value)
        except Exception as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return data

