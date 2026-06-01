import hl7
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Patient
from datetime import datetime

class HL7IngestView(APIView):
    """
    Simple HL7 v2 ADT^A01 (Admit Patient) message ingest
    """
    def post(self, request):
        raw_hl7 = request.data.get('message', '')
        if not raw_hl7:
            return Response({"error": "No HL7 message provided"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Replace literal \n with actual newlines if sent as a string
            raw_hl7 = raw_hl7.replace('\\r', '\r').replace('\\n', '\n')
            h = hl7.parse(raw_hl7)

            # Extract PID segment
            pid = h.segment('PID')

            # PID-5: Patient Name (Family^Given)
            full_name_parts = str(pid[5]).split('^')
            last_name = full_name_parts[0]
            first_name = full_name_parts[1] if len(full_name_parts) > 1 else ''
            combined_name = f"{first_name} {last_name}".strip()

            # PID-7: Date/Time of Birth (YYYYMMDD)
            dob_str = str(pid[7])
            dob = datetime.strptime(dob_str[:8], '%Y%m%d')

            # PID-8: Administrative Sex
            gender_hl7 = str(pid[8])
            gender = 'Other'
            if gender_hl7 == 'M': gender = 'Male'
            elif gender_hl7 == 'F': gender = 'Female'

            # Simple check/create patient
            patient, created = Patient.objects.get_or_create(
                name=combined_name,
                dob=dob,
                defaults={
                    'gender': gender,
                    'address': 'Imported via HL7',
                    'status': 'registered',
                    'workflow_status': 'registered'
                }
            )

            return Response({
                "status": "success",
                "message": "HL7 message processed",
                "patient_id": patient.id,
                "created": created
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": f"Failed to parse HL7: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
