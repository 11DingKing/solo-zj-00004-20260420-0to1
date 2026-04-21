import django_filters
from .models import Article


class ArticleFilter(django_filters.FilterSet):
    category = django_filters.NumberFilter(field_name='category__id')
    category_slug = django_filters.CharFilter(field_name='category__slug', lookup_expr='iexact')
    tag = django_filters.NumberFilter(field_name='tags__id')
    tag_slug = django_filters.CharFilter(field_name='tags__slug', lookup_expr='iexact')
    author = django_filters.NumberFilter(field_name='author__id')
    status = django_filters.CharFilter(field_name='status', lookup_expr='iexact')

    class Meta:
        model = Article
        fields = ['category', 'category_slug', 'tag', 'tag_slug', 'author', 'status']
