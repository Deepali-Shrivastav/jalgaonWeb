from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate

User = get_user_model()

class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['phone_number', 'password']
        extra_kwargs = {'password': {'write_only': True}}
    
    def create(self, validated_data):
        user = User.objects.create_user(
            phone_number=validated_data['phone_number'],
            password=validated_data['password']
        )
        return user

class UserLoginSerializer(serializers.Serializer):
    phone_number = serializers.CharField()
    password = serializers.CharField(write_only=True)
    user = serializers.SerializerMethodField()

    def validate(self, data):
        user = authenticate(phone_number=data['phone_number'], password=data['password'])
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        return {'user': user}

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'phone_number']

    def validate_phone_number(self, value):
        if len(value) > 13:
            raise serializers.ValidationError("Ensure this field has no more than 13 characters.")
        return value
