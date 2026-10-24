from django.urls import path
from . import views

urlpatterns = [
    path('', views.model_training_view, name='model_training'),
    path('activate/<int:model_id>/', views.set_active_model_view, name='set_active_model'),
]
