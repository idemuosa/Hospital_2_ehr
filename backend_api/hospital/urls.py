from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PatientViewSet,
    DoctorViewSet,
    AppointmentViewSet,
    AuditLogViewSet,
    WardViewSet,
    BedViewSet,
    VitalSignViewSet,
    InvestigationViewSet,
    PrescriptionViewSet,
    ClinicalNoteViewSet,
    InventoryViewSet,
    BillViewSet,
    BillItemViewSet
)
from .fhir_views import FHIRPatientView, FHIRObservationView
from .hl7_views import HL7IngestView
from .dashboard_views import DashboardStatsView
from .profile_views import ProfileView
from .pharmacy_views import DispenseMedicationView
from .ward_views import WardMapView
from .interoperability_views import FHIRPatientExportView, HL7PatientExportView
from .sync_views import RemoteSyncView

router = DefaultRouter()
router.register(r'patients', PatientViewSet)
router.register(r'doctors', DoctorViewSet)
router.register(r'appointments', AppointmentViewSet)
router.register(r'audit', AuditLogViewSet, basename='audit')
router.register(r'wards', WardViewSet)
router.register(r'beds', BedViewSet)
router.register(r'vitals', VitalSignViewSet)
router.register(r'investigations', InvestigationViewSet)
router.register(r'prescriptions', PrescriptionViewSet)
router.register(r'notes', ClinicalNoteViewSet)
router.register(r'inventory', InventoryViewSet)
router.register(r'bills', BillViewSet)
router.register(r'bill-items', BillItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('pharmacy/dispense/<uuid:pk>/', DispenseMedicationView.as_view(), name='dispense-medication'),
    path('wards/map/', WardMapView.as_view(), name='ward-map'),
    path('interop/fhir/Patient/<uuid:pk>/', FHIRPatientExportView.as_view(), name='fhir-export'),
    path('interop/hl7/Patient/<uuid:pk>/', HL7PatientExportView.as_view(), name='hl7-export'),
    path('sync/remote/', RemoteSyncView.as_view(), name='remote-sync'),
    path('fhir/Patient/', FHIRPatientView.as_view(), name='fhir-patient-list'),
    path('fhir/Patient/<int:pk>/', FHIRPatientView.as_view(), name='fhir-patient-detail'),
    path('fhir/Observation/', FHIRObservationView.as_view(), name='fhir-observation-list'),
    path('fhir/Observation/<int:pk>/', FHIRObservationView.as_view(), name='fhir-observation-detail'),
    path('hl7/ingest/', HL7IngestView.as_view(), name='hl7-ingest'),
]
