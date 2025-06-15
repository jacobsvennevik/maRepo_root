from django.urls import path
from . import views
from .views import upload_course_files, upload_test_files, upload_learning_materials

urlpatterns = [
    path('', views.index, name='learningtips-index'),
    path('upload/course-files/', upload_course_files, name='upload_course_files'),
    path('upload/test-files/', upload_test_files, name='upload_test_files'),
    path('upload/learning-materials/', upload_learning_materials, name='upload_learning_materials'),
]
