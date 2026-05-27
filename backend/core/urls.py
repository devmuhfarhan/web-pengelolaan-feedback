from django.contrib import admin
from django.urls import path, include, re_path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from django.conf import settings
from django.views.static import serve

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/programs/', include('programs.urls')),
    path('api/feedbacks/', include('feedbacks.urls')),
    
    # Swagger API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]

# Serve documentations upload folder
urlpatterns += [
    re_path(r'^documentations/(?P<path>.*)$', serve, {
        'document_root': settings.BASE_DIR / 'documentations',
    }),
]
