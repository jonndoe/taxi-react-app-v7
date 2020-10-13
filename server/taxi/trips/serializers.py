from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Trip

class UserSerializer(serializers.ModelSerializer):
    # We should never need to read the passwords: (write_only=True)
    password1 = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    group = serializers.CharField()

    def validate(self, data):
        if data['password1'] != data['password2']:
            raise serializers.ValidationError('Passwords must match.')
        return data

    def create(self, validated_data):
        group_data = validated_data.pop('group')
        group, _= Group.objects.get_or_create(name=group_data)
        data = {
            key: value for key, value in validated_data.items()
            if key not in ('password1', 'password2')
        }
        data['password'] = validated_data['password1']
        user = self.Meta.model.objects.create_user(**data)
        user.groups.add(group)
        user.save()
        return user

    class Meta:
        model = get_user_model()
        fields = (
            'id', 'username', 'password1', 'password2',
            'first_name', 'last_name', 'group', 'photo',
        )
        read_only_fields = ('id',)



# it serializes User object and adds the data to
# the token payload as PRIVATE CLAIMS.
class LogInSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        user_data = UserSerializer(user).data
        for key, value in user_data.items():
            if key != 'id':
                token[key] = value
        return token


class TripSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = '__all__'
        # this fields will never be updated or created via
        # the serializer
        read_only_fields = ('id', 'created', 'updated',)

# this class serializes all trip data to JSON format
# not only trip.id
class NestedTripSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = '__all__'
        depth = 1

