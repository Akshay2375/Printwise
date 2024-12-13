 
from django.contrib import admin
 
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from .views import *


urlpatterns = [
    path('', home),
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
