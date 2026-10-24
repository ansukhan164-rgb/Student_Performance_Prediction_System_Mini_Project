from django.urls import path
from . import views

urlpatterns = [
    path('', views.prediction_form_view, name='prediction_form'),
    path('<int:record_id>/', views.prediction_detail_view, name='prediction_detail'),
    path('<int:record_id>/download-pdf/', views.download_pdf_view, name='download_pdf'),
]
