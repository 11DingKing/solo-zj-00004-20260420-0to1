from django.contrib import admin
from .models import Comment


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['author', 'article', 'content_preview', 'parent', 'created_at']
    list_filter = ['created_at', 'article']
    search_fields = ['content', 'author__username', 'article__title']
    raw_id_fields = ['author', 'article', 'parent']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']

    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = '内容预览'
