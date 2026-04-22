from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
from django.db.models import Count
from .models import Category, Tag, Article
from .serializers import (
    CategorySerializer,
    TagSerializer,
    ArticleListSerializer,
    ArticleDetailSerializer,
    ArticleCreateUpdateSerializer
)
from .permissions import IsAuthorOrReadOnly
from .filters import ArticleFilter


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'


class TagViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'


class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.select_related(
        'author', 'category'
    ).prefetch_related(
        'tags'
    ).all()
    serializer_class = ArticleListSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]
    filterset_class = ArticleFilter
    search_fields = ['title', 'content']
    ordering_fields = ['created_at', 'published_at', 'views']
    ordering = ['-published_at', '-created_at']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, IsAuthorOrReadOnly]
        else:
            permission_classes = [AllowAny]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        if self.action == 'list':
            return ArticleListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ArticleCreateUpdateSerializer
        return ArticleDetailSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action == 'list' and not self.request.user.is_staff:
            queryset = queryset.filter(status='published')
        return queryset

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['get'], url_path='view')
    def view_article(self, request, slug=None, pk=None):
        article = self.get_object()
        article.views += 1
        article.save(update_fields=['views'])
        serializer = ArticleDetailSerializer(article, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='my-articles')
    def my_articles(self, request):
        if not request.user.is_authenticated:
            return Response(
                {'detail': '请先登录'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        articles = self.queryset.filter(author=request.user)
        page = self.paginate_queryset(articles)
        if page is not None:
            serializer = ArticleListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        serializer = ArticleListSerializer(articles, many=True, context={'request': request})
        return Response(serializer.data)
