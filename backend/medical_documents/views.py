from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import PatientDocument, SpecialistReferralPDF
from .serializers import (
    PatientDocumentSerializer, 
    PatientDocumentCreateSerializer,
    SpecialistReferralPDFSerializer
)
from .pdf_generator import generate_referral_pdf
from patients.models import Patient, PatientSpecialist


class PatientDocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing patient documents.
    Patients can upload documents, and doctors can view documents for their patients.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PatientDocumentCreateSerializer
        return PatientDocumentSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        if user.user_type == 'doctor':
            # Doctors can see documents for:
            # 1. Their primary patients
            # 2. Patients they are a specialist for
            # 3. Documents marked as visible to all doctors for any of their patients
            return PatientDocument.objects.filter(
                Q(patient__primary_doctor=user) | 
                Q(patient__specialists__specialist=user) |
                Q(is_visible_to_all_doctors=True, patient__specialists__specialist=user)
            ).distinct()
        
        elif user.user_type == 'patient':
            # Patients see their own documents
            # First, find the patient record linked to this user
            try:
                patient = Patient.objects.get(email=user.email)
                return PatientDocument.objects.filter(patient=patient)
            except Patient.DoesNotExist:
                return PatientDocument.objects.none()
        
        return PatientDocument.objects.none()
    
    def list(self, request, *args, **kwargs):
        """
        Override list to support filtering by patient ID.
        """
        queryset = self.get_queryset()
        
        # Filter by patient if patient query param is provided
        patient_id = request.query_params.get('patient')
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def perform_create(self, serializer):
        # Set uploaded_by to current user if they're a doctor
        if self.request.user.user_type == 'doctor':
            serializer.save(uploaded_by=self.request.user)
        else:
            serializer.save()
    
    @action(detail=False, methods=['get'])
    def my_documents(self, request):
        """
        Get documents for the current patient user.
        """
        if request.user.user_type != 'patient':
            return Response(
                {"error": "Cette action est réservée aux patients."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            patient = Patient.objects.get(email=request.user.email)
            documents = PatientDocument.objects.filter(patient=patient)
            serializer = self.get_serializer(documents, many=True)
            return Response(serializer.data)
        except Patient.DoesNotExist:
            return Response(
                {"error": "Aucun dossier patient trouvé."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'], url_path='patient/(?P<patient_id>[^/.]+)')
    def patient_documents(self, request, patient_id=None):
        """
        Get all documents for a specific patient.
        Only accessible by doctors treating this patient.
        """
        if request.user.user_type != 'doctor':
            return Response(
                {"error": "Cette action est réservée aux médecins."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        patient = get_object_or_404(Patient, id=patient_id)
        
        # Check if doctor has access to this patient
        is_primary_doctor = patient.primary_doctor == request.user
        is_specialist = patient.specialists.filter(specialist=request.user).exists()
        
        if not (is_primary_doctor or is_specialist):
            return Response(
                {"error": "Vous n'avez pas accès aux documents de ce patient."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        documents = PatientDocument.objects.filter(patient=patient)
        serializer = self.get_serializer(documents, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def share_with_doctor(self, request):
        """
        Share specific documents with a specific doctor.
        """
        document_ids = request.data.get('document_ids', [])
        doctor_id = request.data.get('doctor_id')
        
        if not document_ids or not doctor_id:
            return Response(
                {"error": "document_ids et doctor_id sont requis."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify user is patient
        if request.user.user_type != 'patient':
            return Response(
                {"error": "Cette action est réservée aux patients."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            patient = Patient.objects.get(email=request.user.email)
            from accounts.models import User
            doctor = User.objects.get(id=doctor_id, user_type='doctor')
            
            # Update documents to be visible to this doctor
            updated_count = PatientDocument.objects.filter(
                id__in=document_ids,
                patient=patient
            ).update(is_visible_to_all_doctors=True)
            
            return Response({
                "message": f"{updated_count} document(s) partagé(s) avec {doctor.get_full_name()}",
                "updated_count": updated_count
            })
            
        except Patient.DoesNotExist:
            return Response(
                {"error": "Dossier patient non trouvé."},
                status=status.HTTP_404_NOT_FOUND
            )
        except User.DoesNotExist:
            return Response(
                {"error": "Médecin non trouvé."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def download_all(self, request):
        """
        Get all document URLs for batch download.
        """
        if request.user.user_type != 'patient':
            return Response(
                {"error": "Cette action est réservée aux patients."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            patient = Patient.objects.get(email=request.user.email)
            documents = PatientDocument.objects.filter(patient=patient)
            
            document_urls = [
                {
                    'id': doc.id,
                    'title': doc.title,
                    'url': request.build_absolute_uri(doc.file.url),
                    'filename': doc.file.name.split('/')[-1]
                }
                for doc in documents
            ]
            
            return Response({
                'count': len(document_urls),
                'documents': document_urls
            })
            
        except Patient.DoesNotExist:
            return Response(
                {"error": "Dossier patient non trouvé."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """
        Get documents uploaded in the last 30 days.
        """
        if request.user.user_type != 'patient':
            return Response(
                {"error": "Cette action est réservée aux patients."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            from datetime import timedelta
            from django.utils import timezone
            
            patient = Patient.objects.get(email=request.user.email)
            thirty_days_ago = timezone.now() - timedelta(days=30)
            
            documents = PatientDocument.objects.filter(
                patient=patient,
                uploaded_at__gte=thirty_days_ago
            ).order_by('-uploaded_at')
            
            serializer = self.get_serializer(documents, many=True)
            return Response(serializer.data)
            
        except Patient.DoesNotExist:
            return Response(
                {"error": "Dossier patient non trouvé."},
                status=status.HTTP_404_NOT_FOUND
            )


class SpecialistReferralPDFViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing specialist referral PDFs.
    PDFs are automatically generated when a specialist is assigned.
    """
    queryset = SpecialistReferralPDF.objects.all()
    serializer_class = SpecialistReferralPDFSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.user_type == 'doctor':
            # Doctors can see PDFs where they are:
            # 1. The assigning doctor
            # 2. The specialist
            return SpecialistReferralPDF.objects.filter(
                Q(patient_specialist__assigned_by=user) |
                Q(patient_specialist__specialist=user)
            ).distinct()
        
        elif user.user_type == 'patient':
            # Patients can see PDFs for their own referrals
            import logging
            logger = logging.getLogger(__name__)
            logger.info(f"Patient user accessing referral PDFs: {user.email}")
            
            try:
                patient = Patient.objects.get(email=user.email)
                logger.info(f"Found patient record: {patient.id} - {patient.full_name}")
                
                pdfs = SpecialistReferralPDF.objects.filter(
                    patient_specialist__patient=patient
                )
                logger.info(f"Found {pdfs.count()} referral PDFs for patient")
                
                return pdfs
            except Patient.DoesNotExist:
                logger.warning(f"No patient record found for user email: {user.email}")
                return SpecialistReferralPDF.objects.none()
            except Exception as e:
                logger.error(f"Error fetching referral PDFs: {str(e)}")
                return SpecialistReferralPDF.objects.none()
        
        return SpecialistReferralPDF.objects.none()
    
    @action(detail=False, methods=['post'])
    def generate(self, request):
        """
        Generate a referral PDF for a patient specialist assignment.
        """
        if request.user.user_type != 'doctor':
            return Response(
                {"error": "Seuls les médecins peuvent générer des PDFs de référence."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        patient_specialist_id = request.data.get('patient_specialist_id')
        
        if not patient_specialist_id:
            return Response(
                {"error": "patient_specialist_id est requis."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            patient_specialist = PatientSpecialist.objects.get(id=patient_specialist_id)
            
            # Check if user is the assigning doctor
            if patient_specialist.assigned_by != request.user:
                return Response(
                    {"error": "Vous n'êtes pas autorisé à générer ce PDF."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Check if PDF already exists
            if hasattr(patient_specialist, 'referral_pdf'):
                # Return the existing PDF instead of error
                serializer = self.get_serializer(patient_specialist.referral_pdf)
                return Response(
                    {
                        "message": "PDF déjà existant",
                        "data": serializer.data
                    },
                    status=status.HTTP_200_OK
                )
            
            # Generate PDF
            pdf_file = generate_referral_pdf(patient_specialist)
            
            # Create patient summary for the record
            patient = patient_specialist.patient
            patient_summary = f"""
            Patient: {patient.full_name}
            Date de naissance: {patient.date_of_birth}
            Âge: {patient.age} ans
            Sexe: {patient.get_gender_display()}
            """
            
            # Create SpecialistReferralPDF record
            referral_pdf = SpecialistReferralPDF.objects.create(
                patient_specialist=patient_specialist,
                pdf_file=pdf_file,
                patient_summary=patient_summary.strip(),
                referral_reason=patient_specialist.reason or "",
                additional_notes=patient_specialist.notes or ""
            )
            
            serializer = self.get_serializer(referral_pdf)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except PatientSpecialist.DoesNotExist:
            return Response(
                {"error": "Assignation de spécialiste non trouvée."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": f"Erreur lors de la génération du PDF: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
