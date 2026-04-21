from rest_framework import serializers
from users.serializers import UserSerializer
from .models import Comment


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    parent_author = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id', 'article', 'author', 'content', 'parent',
            'parent_author', 'replies', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_replies(self, obj):
        if obj.parent is None:
            replies = obj.replies.all()
            return CommentSerializer(
                replies,
                many=True,
                context=self.context
            ).data
        return []

    def get_parent_author(self, obj):
        if obj.parent and obj.parent.author:
            return {
                'id': obj.parent.author.id,
                'username': obj.parent.author.username,
                'display_name': obj.parent.author.display_name
            }
        return None


class CommentCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['article', 'content', 'parent']
        extra_kwargs = {
            'article': {'required': True},
            'content': {'required': True},
            'parent': {'required': False}
        }

    def validate_parent(self, value):
        if value:
            if value.parent is not None:
                raise serializers.ValidationError(
                    '不支持二级回复，只能回复一级评论'
                )
        return value

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)
