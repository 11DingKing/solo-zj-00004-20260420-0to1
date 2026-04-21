from django.contrib import admin
from .models import Category, Tag, Article


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'description', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['name']
    readonly_fields = ['created_at']


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'category', 'status', 'views', 'created_at', 'published_at']
    list_filter = ['status', 'category', 'created_at', 'published_at']
    search_fields = ['title', 'content']
    filter_horizontal = ['tags']
    raw_id_fields = ['author', 'category']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    readonly_fields = ['views', 'created_at', 'updated_at', 'published_at']
    fieldsets = (
        ('基本信息', {'fields': ('title', 'content', 'cover')}),
        ('分类与标签', {'fields': ('category', 'tags')}),
        ('发布设置', {'fields': ('status', 'author')}),
        ('统计信息', {'fields': ('views', 'created_at', 'updated_at', 'published_at')}),
    )
