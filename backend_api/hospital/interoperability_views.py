from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Patient
import json

class FHIRPatientExportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            patient = Patient.objects.get(pk=pk)

            # Basic FHIR R4 Patient Resource mapping
            fhir_resource = {
                "resourceType": "Patient",
                "id": str(patient.id),
                "active": True,
                "name": [
                    {
                        "use": "official",
                        "text": patient.name,
                    }
                ],
                "gender": patient.gender.lower() if patient.gender else "unknown",
                "birthDate": patient.dob.strftime("%Y-%m-%d") if patient.dob else None,
                "telecom": [
                    {
                        "system": "phone",
                        "value": patient.phone,
                        "use": "mobile"
                    }
                ] if patient.phone else [],
                "address": [
                    {
                        "text": patient.address,
                        "use": "home"
                    }
                ] if patient.address else []
            }

            return Response(fhir_resource)
        except Patient.DoesNotExist:
            return Response({"error": "Patient not found"}, status=404)

class HL7PatientExportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            patient = Patient.objects.get(pk=pk)

            # Basic HL7 v2.3 PID (Patient Identification) segment
            # Format: PID|1||PatientID||Name||DOB|Gender
            pid_segment = f"PID|1||{patient.id}||{patient.name.replace(' ', '^')}||{patient.dob.strftime('%Y%m%d') if patient.dob else ''}|{patient.gender[0] if patient.gender else 'U'}"

            # Minimal HL7 Message (MSH + PID)
            hl7_message = f"MSH|^~\\&|MY_EHR|HOSPITAL|||{timezone.now().strftime('%Y%m%d%H%M')}||ADT^A08|{patient.id}|P|2.3\r{pid_segment}"

            return Response({"hl7_message": hl7_message})
        except Patient.DoesNotExist:
            return Response({"error": "Patient not found"}, status=404)

from django.utils import timezone
