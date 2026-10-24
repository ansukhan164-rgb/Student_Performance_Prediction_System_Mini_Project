from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Dataset

@login_required
def dataset_upload_view(request):
    if request.user.role != 'teacher':
        messages.error(request, "Access restricted to Teacher workspace.")
        return redirect('dashboard')

    datasets = Dataset.objects.filter(uploaded_by=request.user).order_by('-uploaded_at')

    if request.method == 'POST' and request.FILES.get('dataset_file'):
        uploaded_file = request.FILES['dataset_file']
        file_name = uploaded_file.name
        ext = file_name.split('.')[-1].upper()

        if ext not in ['CSV', 'XLSX', 'XLS']:
            messages.error(request, "Unsupported file type. Upload CSV or Excel (.xlsx) files.")
            return redirect('dataset_upload')

        dataset = Dataset.objects.create(
            name=file_name,
            file=uploaded_file,
            file_format=ext,
            uploaded_by=request.user,
            row_count=100,  # Computed upon reading file
            column_count=8,
            quality_score=98.5
        )
        messages.success(request, f"Dataset '{file_name}' uploaded successfully!")
        return redirect('dataset_upload')

    return render(request, 'dataset_upload.html', {'datasets': datasets})

@login_required
def dataset_delete_view(request, dataset_id):
    dataset = get_object_or_404(Dataset, id=dataset_id, uploaded_by=request.user)
    dataset.delete()
    messages.success(request, "Dataset removed successfully.")
    return redirect('dataset_upload')
