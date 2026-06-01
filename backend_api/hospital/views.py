from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .medication_ai import check_medication_interactions
from .models import (
    Patient, Doctor, Appointment, AuditLog, Ward, Bed,
    VitalSign, Investigation, Prescription, ClinicalNote, Inventory,
    Bill, BillItem
)
from .serializers import (
    PatientSerializer, DoctorSerializer, AppointmentSerializer,
    AuditLogSerializer, WardSerializer, BedSerializer,
    VitalSignSerializer, InvestigationSerializer, PrescriptionSerializer,
    ClinicalNoteSerializer, InventorySerializer,
    BillSerializer, BillItemSerializer
)
from .permissions import IsAdmin, IsDoctor, IsNurse, IsPharmacist, IsReceptionist
from .utils import log_action
from .tasks import send_notification
from .clinical_ai import analyze_vitals

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [IsAdmin | IsDoctor | IsNurse | IsReceptionist]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'gender', 'ward', 'workflow_status']
    search_fields = ['name', 'email', 'phone']
    ordering_fields = ['created_at', 'name']

    def perform_create(self, serializer):
        patient = serializer.save()
        log_action(self.request.user, f"Created Patient: {patient.name}", patient.id, "Patient")
        if patient.phone:
            send_notification.delay(patient.name, patient.phone, 'welcome', 'registration completed')

    def perform_update(self, serializer):
        patient = serializer.save()
        log_action(self.request.user, f"Updated Patient: {patient.name}", patient.id, "Patient")

class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [IsAdmin | IsDoctor | IsReceptionist]
    filter_backends = [filters.SearchFilter]
    search_fields = ['specialization', 'user__first_name', 'user__last_name']

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsAdmin | IsDoctor | IsNurse | IsReceptionist]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['patient', 'status', 'date_time']

class AuditLogViewSet(viewsets.ModelViewSet):
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['user_id', 'action', 'resource_type']

class VitalSignViewSet(viewsets.ModelViewSet):
    queryset = VitalSign.objects.all()
    serializer_class = VitalSignSerializer
    permission_classes = [IsAdmin | IsDoctor | IsNurse]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['patient']

class InvestigationViewSet(viewsets.ModelViewSet):
    queryset = Investigation.objects.all()
    serializer_class = InvestigationSerializer
    permission_classes = [IsAdmin | IsDoctor | IsNurse]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['patient', 'status', 'category']

    @action(detail=True, methods=['post'])
    def analyze_image(self, request, pk=None):
        investigation = self.get_object()
        if not investigation.file:
            return Response({"error": "No file attached to this investigation"}, status=status.HTTP_400_BAD_REQUEST)

        # Simulated AI Image Analysis (e.g., Chest X-Ray detection)
        # In production, this would call a model like PyTorch or a cloud vision API
        file_name = investigation.file.name.lower()
        analysis_result = "General observation: Normal"

        if "chest" in file_name or "xray" in file_name:
            analysis_result = "AI Insight: No acute pulmonary findings. Heart size is normal. Lungs are clear."
        elif "fracture" in file_name or "bone" in file_name:
            analysis_result = "AI Insight: Possible hairline fracture detected in the distal region. Clinical correlation recommended."

        investigation.result = f"{investigation.result or ''}\n\n[AI ANALYSIS]: {analysis_result}"
        investigation.save()

        return Response({
            "status": "Analysis completed",
            "insight": analysis_result
        })

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .medication_ai import check_medication_interactions
# ... (existing imports)

class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer
    permission_classes = [IsAdmin | IsDoctor | IsPharmacist]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['patient', 'status']

    @action(detail=False, methods=['post'])
    def check_interaction(self, request):
        patient_id = request.data.get('patient_id')
        new_medication = request.data.get('medication')

        if not patient_id or not new_medication:
            return Response({"error": "patient_id and medication are required"}, status=status.HTTP_400_BAD_REQUEST)

        # Get existing active medications for the patient
        existing_meds = Prescription.objects.filter(
            patient_id=patient_id,
            status='active'
        ).values_list('medication', flat=True)

        interactions = check_medication_interactions(new_medication, list(existing_meds))

        return Response({
            "medication": new_medication,
            "interactions": interactions,
            "safe": len(interactions) == 0
        })

class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer
    permission_classes = [IsAdmin | IsPharmacist]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['name', 'category']
    filterset_fields = ['category']

class WardViewSet(viewsets.ModelViewSet):
    queryset = Ward.objects.all()
    serializer_class = WardSerializer
    permission_classes = [IsAdmin | IsNurse | IsReceptionist]

class BedViewSet(viewsets.ModelViewSet):
    queryset = Bed.objects.all()
    serializer_class = BedSerializer
    permission_classes = [IsAdmin | IsNurse | IsReceptionist]

class ClinicalNoteViewSet(viewsets.ModelViewSet):
    queryset = ClinicalNote.objects.all()
    serializer_class = ClinicalNoteSerializer
    permission_classes = [IsAdmin | IsDoctor]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['patient']

class BillViewSet(viewsets.ModelViewSet):
    queryset = Bill.objects.all()
    serializer_class = BillSerializer
    permission_classes = [IsAdmin | IsReceptionist]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status', 'patient']
    search_fields = ['invoice_number']

    def perform_create(self, serializer):
        bill = serializer.save()
        # Medical Billing Automation: Apply Insurance
        patient = bill.patient
        if patient.insurance_coverage_percent > 0:
            coverage = (bill.total_amount * patient.insurance_coverage_percent) / 100
            bill.insurance_covered_amount = coverage
            bill.patient_payable_amount = bill.total_amount - coverage
        else:
            bill.patient_payable_amount = bill.total_amount
        bill.save()
        log_action(self.request.user, f"Automated billing for {patient.name}: Insurance covered {bill.insurance_covered_amount}", bill.id, "Bill")

class BillItemViewSet(viewsets.M