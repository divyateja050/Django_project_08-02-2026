import pandas as pd
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from django.db import transaction, models
from django.http import HttpResponse
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

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_RIGHT

class PDFReportView(APIView):
    def get(self, request, upload_id):
        try:
            try:
                upload = UploadHistory.objects.get(id=upload_id)
            except UploadHistory.DoesNotExist:
                return Response({"error": "Upload not found"}, status=status.HTTP_404_NOT_FOUND)

            data = upload.equipment_data.all()
            
            response = HttpResponse(content_type='application/pdf')
            filename = f"Report_{upload.filename}_{upload.uploaded_at.strftime('%Y%m%d')}.pdf"
            response['Content-Disposition'] = f'attachment; filename="{filename}"'

            doc = SimpleDocTemplate(response, pagesize=letter)
            elements = []
            styles = getSampleStyleSheet()
            
            # --- Styles ---
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=24,
                leading=28,
                spaceAfter=10,
                textColor=colors.HexColor('#0f766e'), # Teal-700
                alignment=TA_CENTER
            )
            subtitle_style = ParagraphStyle(
                'CustomSubtitle',
                parent=styles['Normal'],
                fontSize=12,
                textColor=colors.HexColor('#64748b'), # Slate-500
                alignment=TA_CENTER,
                spaceAfter=30
            )
            
            # --- Header ---
            elements.append(Paragraph("Chem.Viz Analytics Report", title_style))
            elements.append(Paragraph(f"File: {upload.filename} | Generated: {upload.uploaded_at.strftime('%Y-%m-%d %H:%M')}", subtitle_style))
            elements.append(Spacer(1, 0.2 * inch))

            # --- Summary Section ---
            total_count = data.count()
            avg_flow = data.aggregate(models.Avg('flowrate'))['flowrate__avg'] or 0
            avg_press = data.aggregate(models.Avg('pressure'))['pressure__avg'] or 0
            avg_temp = data.aggregate(models.Avg('temperature'))['temperature__avg'] or 0
            
            summary_data = [
                ['Total Records', 'Avg Flowrate', 'Avg Pressure', 'Avg Temp'],
                [str(total_count), f"{avg_flow:.2f}", f"{avg_press:.2f}", f"{avg_temp:.2f}"]
            ]
            
            # FIT TO PAGE: 8.5 width - 2 inch margins = 6.5 inch max
            # Summary: 1.5 * 4 = 6.0 inches
            t_summary = Table(summary_data, colWidths=[1.5*inch, 1.5*inch, 1.5*inch, 1.5*inch])
            t_summary.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f0fdfa')), # Teal-50
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#0f766e')), # Teal-700
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
                ('TOPPADDING', (0, 0), (-1, 0), 8),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#ccfbf1')), # Teal-100
                ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#0d9488')), # Teal-600
                ('ROUNDEDCORNERS', [10, 10, 10, 10])
            ]))
            elements.append(t_summary)
            elements.append(Spacer(1, 0.5 * inch))

            # --- Main Data Table ---
            table_data = [['Equipment Name', 'Type', 'Flowrate', 'Pressure', 'Temp']]
            
            # Limit rows for PDF performance if needed, or implement pagination (SimpleDocTemplate handles pagination automatically)
            for item in data:
                table_data.append([
                    str(item.equipment_name)[:30], # Truncate long names
                    str(item.equipment_type),
                    f"{item.flowrate:.2f}",
                    f"{item.pressure:.2f}",
                    f"{item.temperature:.2f}"
                ])

            # FIT TO PAGE: 2.0 + 1.2 + 1.0 + 1.0 + 1.0 = 6.2 inches
            t = Table(table_data, colWidths=[2.0*inch, 1.2*inch, 1*inch, 1*inch, 1*inch], repeatRows=1)
            t.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f766e')), # Teal-700 Header
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('ALIGN', (0, 1), (0, -1), 'LEFT'), # Left align names
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
                ('TOPPADDING', (0, 0), (-1, 0), 10),
                ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')), # Slate-200
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]) # Zebra striping (Slate-50)
            ]))
            
            elements.append(t)
            
            # Build PDF
            def add_footer(canvas, doc):
                canvas.saveState()
                canvas.setFont('Helvetica', 9)
                canvas.drawString(inch, 0.75 * inch, f"Page {doc.page}")
                canvas.drawRightString(7.5 * inch, 0.75 * inch, "Chem.Viz Automated Report")
                canvas.restoreState()

            doc.build(elements, onFirstPage=add_footer, onLaterPages=add_footer)
            return response

        except Exception as e:
            import traceback
            tb = traceback.format_exc()
            print(f"PDF GENERATION ERROR: {tb}")
            return Response({"error": f"PDF Generation Error: {str(e)}", "traceback": tb}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
