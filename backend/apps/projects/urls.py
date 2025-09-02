from django.urls import path, include
from .views import reset_test_database

urlpatterns = [
    path('test-utils/reset_db/', reset_test_database, name='reset_test_database'),
] 