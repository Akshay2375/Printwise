# in your project's urls.py
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include

urlpatterns = [
    path('api/', include('printwise.urls')),  # Include the app's API URLs
    path('', include('printwise.urls')),  # Include the app's URLs for root and upload
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)  # Serve media files during development
