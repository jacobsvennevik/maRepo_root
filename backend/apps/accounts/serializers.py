# backend/apps/accounts/serializers.py
from rest_framework import serializers
from .models import CustomUser


class CustomUserSerializer(serializers.ModelSerializer):
    """
    A serializer for the CustomUser model.

    This serializer is used to convert CustomUser instances into
    JSON data, and vice versa. It also provides a way to create and
    update users.

    The "password" field is write-only, meaning it is not included
    in the output of a GET request. The "date_joined" field is
    read-only, meaning it can't be changed in a PUT or PATCH request.
    """
    # Add a write-only field for password
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = CustomUser
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'subscription_status',
            'date_joined',
            'password',  # Important: This is not read in GET requests
        ]
        read_only_fields = ['date_joined']

    def create(self, validated_data):
        """
        Create a new user instance.

        This method is used when creating a new user with a POST request.

        :param validated_data: The validated data from the request.
        :return: A new CustomUser instance.
        """
        password = validated_data.pop('password', None)
        user = CustomUser(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        """
        Update an existing user instance.

        This method is used when updating an existing user with a PUT or PATCH request.

        :param instance: The existing user instance.
        :param validated_data: The validated data from the request.
        :return: The updated user instance.
        """
        # If updating user details (optional, if you want to allow password change in the same serializer)
        password = validated_data.pop('password', None)
        password2 = validated_data.pop('password2', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
