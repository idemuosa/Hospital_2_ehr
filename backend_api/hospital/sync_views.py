from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Branch, Patient, Appointment
from .permissions import IsAdmin

class RemoteSyncView(APIView):
    """
    Endpoint for cross-branch data synchronization.
    Allows a remote branch to pull recent updates.
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        branch_id = request.query_params.get('branch_id')
        if not branch_id:
            return Response({"error": "branch_id required"}, status=400)

        # In a real scenario, you'd filter by 'updated_at' since last sync
        patients = Patient.objects.filter(branch_id=branch_id)
        appointments = Appointment.objects.filter(patient__branch_id=branch_id)

        return Response({
            "patients_count": patients.count(),
            "appointments_count": appointments.count(),
            "status": "Ready for export",
            "sync_payload_url": "/api/interop/export/full/" # Mock link
        })
