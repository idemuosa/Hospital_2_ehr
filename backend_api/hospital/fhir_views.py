from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Patient
from fhir.resources.patient import Patient as FHIRPatient
from fhir.resources.humanname import HumanName
from fhir.resources.contactpoint import ContactPoint
from fhir.resources.observation import Observation as FHIRObservation
from fhir.resources.quantity import Quantity
from .models import Patient, VitalSign

class FHIRPatientView(APIView):
    # ... (existing code)
    def get(self, request, pk=None):
        if pk:
            try:
                patient = Patient.objects.get(pk=pk)
                fhir_data = self.map_to_fhir(patient)
                return Response(fhir_data.dict(), status=status.HTTP_200_OK)
            except Patient.DoesNotExist:
                return Response({"error": "Patient not found"}, status=status.HTTP_404_NOT_FOUND)

        patients = Patient.objects.all()
        bundle = {
            "resourceType": "Bundle",
            "type": "searchset",
            "total": patients.count(),
            "entry": [{"resource": self.map_to_fhir(p).dict()} for p in patients]
        }
        return Response(bundle, status=status.HTTP_200_OK)

    def map_to_fhir(self, patient):
        # ... (rest of map_to_fhir)
        fhir_patient = FHIRPatient()
        fhir_patient.id = str(patient.id)

        name = HumanName()
        name.text = patient.name
        parts = patient.name.split(' ')
        if len(parts) > 1:
            name.family = parts[-1]
            name.given = parts[:-1]
        else:
            name.family = patient.name
        fhir_patient.name = [name]

        gender_map = {
            'Male': 'male',
            'Female': 'female',
            'Other': 'other'
        }
        fhir_patient.gender = gender_map.get(patient.gender, 'unknown')
        fhir_patient.birthDate = patient.dob.date().isoformat()

        if patient.next_of_kin_phone:
            telecom = ContactPoint()
            telecom.system = "phone"
            telecom.value = patient.next_of_kin_phone
            fhir_patient.telecom = [telecom]

        return fhir_patient

class FHIRObservationView(APIView):
    """
    Minimal FHIR R4 Observation Resource implementation for Vital Signs
    """
    def get(self, request, pk=None):
        if pk:
            try:
                vitals = VitalSign.objects.get(pk=pk)
                return Response(self.map_to_fhir(vitals).dict(), status=status.HTTP_200_OK)
            except VitalSign.DoesNotExist:
                return Response({"error": "Observation not found"}, status=status.HTTP_404_NOT_FOUND)

        vitals_list = VitalSign.objects.all()
        bundle = {
            "resourceType": "Bundle",
            "type": "searchset",
            "total": vitals_list.count(),
            "entry": [{"resource": self.map_to_fhir(v).dict()} for v in vitals_list]
        }
        return Response(bundle, status=status.HTTP_200_OK)

    def map_to_fhir(self, vitals):
        obs = FHIRObservation()
        obs.id = str(vitals.id)
        obs.status = "final"
        obs.subject = {"reference": f"Patient/{vitals.patient.id}"}
        obs.effectiveDateTime = vitals.created_at.isoformat()

        # Mapping Temperature as an example component
        if vitals.temp:
            val = Quantity()
            val.value = vitals.temp
            val.unit = "C"
            val.system = "http://unitsofmeasure.org"
            val.code = "Cel"
            obs.valueQuantity = val

        return obs
