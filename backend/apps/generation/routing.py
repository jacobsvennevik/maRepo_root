"""
WebSocket routing configuration for real-time updates.
"""
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/study-progress/$', consumers.StudyProgressConsumer.as_asgi()),
    re_path(r'ws/project-updates/$', consumers.ProjectUpdatesConsumer.as_asgi()),
]
