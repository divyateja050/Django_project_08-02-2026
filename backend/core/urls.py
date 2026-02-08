from django.urls import path
from .views import FileUploadView, HistoryListView, UploadDataView, PDFReportView, UserDetailsView, ChangePasswordView

urlpatterns = [
    path('upload/', FileUploadView.as_view(), name='file-upload'),
    path('history/', HistoryListView.as_view(), name='history-list'),
    path('data/<int:upload_id>/', UploadDataView.as_view(), name='upload-data'),
    path('report/<int:upload_id>/', PDFReportView.as_view(), name='pdf-report'),
    path('user/details/', UserDetailsView.as_view(), name='user-details'),
    path('user/password/', ChangePasswordView.as_view(), name='change-password'),
]
