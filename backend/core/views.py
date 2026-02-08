import pandas as pd
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from django.db import transaction, models
from .models import UploadHistory, EquipmentData
from .serializers import UploadHistorySerializer, EquipmentDataSerializer
import os

class FileUploadView(APIView):
    def post(self, request, format=None):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

        # Basic Check
        if not file_obj.name.endswith('.csv'):
             return Response({"error": "File must be a CSV"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Parse CSV
            df = pd.read_csv(file_obj)
            required_cols = ['Equipment Name', 'Type', 'Flowrate', 'Pressure', 'Temperature']
            if not all(col in df.columns for col in required_cols):
                 return Response({"error": f"Missing columns. Required: {required_cols}"}, status=status.HTTP_400_BAD_REQUEST)

            with transaction.atomic():
                # Manage History Limit (Keep last 5)
                history_count = UploadHistory.objects.count()
                if history_count >= 5:
                    # Delete oldest
                    to_delete = UploadHistory.objects.order_by('uploaded_at')[:history_count - 4]
                    for h in to_delete:
                        h.delete()

                # Create History
                history = UploadHistory.objects.create(
                    user=request.user if request.user.is_authenticated else None,
                    filename=file_obj.name,
                    file=file_obj
                )

                # Bulk Create Equipment Data
                equipment_list = []
                for _, row in df.iterrows():
                    equipment_list.append(EquipmentData(
                        upload=history,
                        equipment_name=row['Equipment Name'],
                        equipment_type=row['Type'],
                        flowrate=row['Flowrate'],
                        pressure=row['Pressure'],
                        temperature=row['Temperature']
                    ))
                EquipmentData.objects.bulk_create(equipment_list)

            # Calculate Summary
            summary = {
                "total_count": len(df),
                "averages": {
                    "flowrate": df['Flowrate'].mean(),
                    "pressure": df['Pressure'].mean(),
                    "temperature": df['Temperature'].mean()
                },
                "type_distribution": df['Type'].value_counts().to_dict()
            }
            
            return Response({
                "message": "File processed successfully",
                "upload_id": history.id,
                "summary": summary
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class HistoryListView(generics.ListAPIView):
    queryset = UploadHistory.objects.all().order_by('-uploaded_at')
    serializer_class = UploadHistorySerializer

class UploadDataView(APIView):
    def get(self, request, upload_id):
        try:
            upload = UploadHistory.objects.get(id=upload_id)
            data = upload.equipment_data.all()
            serializer = EquipmentDataSerializer(data, many=True)
            
            # Re-calculate summary for frontend convenience if needed, 
            # effectively we can just aggregate from DB or re-read file if we stored it (we did).
            # But querying DB is safer.
            
            total_count = data.count()
            avg_flow = data.aggregate(models.Avg('flowrate'))['flowrate__avg']
            avg_press = data.aggregate(models.Avg('pressure'))['pressure__avg']
            avg_temp = data.aggregate(models.Avg('temperature'))['temperature__avg']
            
            # Type distribution
            from django.db.models import Count
            type_dist = list(data.values('equipment_type').annotate(count=Count('equipment_type')))
            dist_dict = {item['equipment_type']: item['count'] for item in type_dist}

            summary = {
                "total_count": total_count,
                "averages": {
                    "flowrate": avg_flow,
                    "pressure": avg_press,
                    "temperature": avg_temp
                },
                "type_distribution": dist_dict
            }

            return Response({
                "upload": UploadHistorySerializer(upload).data,
                "data": serializer.data,
                "summary": summary
            })

        except UploadHistory.DoesNotExist:
             return Response({"error": "Upload not found"}, status=status.HTTP_404_NOT_FOUND)

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from django.http import HttpResponse

class PDFReportView(APIView):
    def get(self, request, upload_id):
        try:
            upload = UploadHistory.objects.get(id=upload_id)
            data = upload.equipment_data.all()
            
            response = HttpResponse(content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="report_{upload_id}.pdf"'
            
            p = canvas.Canvas(response, pagesize=letter)
            p.drawString(100, 750, f"Equipment Data Report - {upload.filename}")
            p.drawString(100, 730, f"Uploaded at: {upload.uploaded_at}")
            
            y = 700
            p.drawString(80, y, "Name")
            p.drawString(200, y, "Type")
            p.drawString(300, y, "Flowrate")
            p.drawString(400, y, "Pressure")
            p.drawString(500, y, "Temp")
            y -= 20
            
            for item in data:
                if y < 50:
                    p.showPage()
                    y = 750
                p.drawString(80, y, str(item.equipment_name)[:20])
                p.drawString(200, y, str(item.equipment_type))
                p.drawString(300, y, str(item.flowrate))
                p.drawString(400, y, str(item.pressure))
                p.drawString(500, y, str(item.temperature))
                y -= 15
                
            p.save()
            return response
        except UploadHistory.DoesNotExist:
            return Response({"error": "Upload not found"}, status=status.HTTP_404_NOT_FOUND)

class UserDetailsView(APIView):
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({"error": "Not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
        
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "date_joined": user.date_joined
        })

    def put(self, request):
        if not request.user.is_authenticated:
            return Response({"error": "Not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
        
        user = request.user
        data = request.data
        
        user.first_name = data.get("first_name", user.first_name)
        user.last_name = data.get("last_name", user.last_name)
        user.email = data.get("email", user.email)
        user.save()
        
        return Response({
            "message": "Profile updated successfully",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name
            }
        })

class ChangePasswordView(APIView):
    def post(self, request):
        if not request.user.is_authenticated:
            return Response({"error": "Not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
        
        user = request.user
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")
        
        if not user.check_password(old_password):
            return Response({"error": "Incorrect old password"}, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(new_password)
        user.save()
        
        # Keep user logged in if using session auth, but we use Basic/Token usually.
        # For Basic Auth, the client needs to update the stored credentials.
        
        return Response({"message": "Password changed successfully"})
