from django.urls import path
from .views import FileUploadView, HistoryListView, UploadDataView, PDFReportView

urlpatterns = [
    path('upload/', FileUploadView.as_view(), name='file-upload'),
    path('history/', HistoryListView.as_view(), name='history-list'),
    path('data/<int:upload_id>/', UploadDataView.as_view(), name='upload-data'),
    path('report/<int:upload_id>/', PDFReportView.as_view(), name='pdf-report'),
]
