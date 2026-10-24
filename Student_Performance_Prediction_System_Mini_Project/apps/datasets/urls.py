from django.urls import path
from . import views

urlpatterns = [
    path('', views.dataset_upload_view, name='dataset_upload'),
    path('delete/<int:dataset_id>/', views.dataset_delete_view, name='dataset_delete'),
]
