from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .forms import SignUpForm, LoginForm
from .models import User

def landing_view(request):
    return render(request, 'landing.html')

def login_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
        
    if request.method == 'POST':
        form = LoginForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            messages.success(request, f"Welcome back, {user.get_full_name()}!")
            return redirect('dashboard')
        else:
            messages.error(request, "Invalid University UID or Password.")
    else:
        form = LoginForm()
    return render(request, 'login.html', {'form': form})

def signup_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')

    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, f"Account registered successfully as {user.role.capitalize()}!")
            return redirect('dashboard')
        else:
            messages.error(request, "Registration failed. Please review form inputs.")
    else:
        form = SignUpForm()
    return render(request, 'signup.html', {'form': form})

def logout_view(request):
    logout(request)
    messages.info(request, "Successfully logged out.")
    return redirect('landing')

@login_required
def dashboard_view(request):
    if request.user.role == 'teacher':
        return render(request, 'teacher_dashboard.html')
    else:
        return render(request, 'student_dashboard.html')

@login_required
def profile_view(request):
    return render(request, 'profile.html')

@login_required
def students_roster_view(request):
    if request.user.role != 'teacher':
        messages.error(request, "Access restricted to Teacher workspace.")
        return redirect('dashboard')
    students = User.objects.filter(role='student')
    return render(request, 'students_list.html', {'students': students})
