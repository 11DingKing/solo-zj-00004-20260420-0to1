from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    avatar = models.ImageField(
        upload_to='avatars/',
        null=True,
        blank=True,
        verbose_name='头像'
    )
    nickname = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        verbose_name='昵称'
    )
    bio = models.TextField(
        max_length=500,
        null=True,
        blank=True,
        verbose_name='简介'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='创建时间'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='更新时间'
    )

    class Meta:
        verbose_name = '用户'
        verbose_name_plural = '用户'
        ordering = ['-created_at']

    def __str__(self):
        return self.username

    @property
    def display_name(self):
        return self.nickname or self.username
