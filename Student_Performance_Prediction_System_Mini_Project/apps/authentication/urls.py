from django.urls import path
from . import views

urlpatterns = [
    path('', views.landing_view, name='landing'),
    path('auth/login/', views.login_view, name='login'),
    path('auth/signup/', views.signup_view, name='signup'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('dashboard/', views.dashboard_view, name='dashboard'),
    path('profile/', views.profile_view, name='profile'),
    path('students/', views.students_roster_view, name='students_roster'),
]
