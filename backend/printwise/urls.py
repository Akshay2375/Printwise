# in yourapp/urls.py
from django.urls import path
from .views import home

urlpatterns = [
    path('upload/', home, name='file-upload'),  # file upload endpoint
]
