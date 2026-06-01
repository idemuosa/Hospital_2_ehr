from rest_framework import serializers
from .models import (
    Patient, Doctor, Appointment, AuditLog, Ward, Bed, Bill, BillItem,
    TreatmentPlan, Review, VitalSign, Investigation, ClinicalNote,
    Prescription, Inventory, PharmacySale, PharmacySaleItem, ServicePricing
)
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'

class DoctorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Doctor
        fields = '__all__'

class AppointmentSerializer(serializers.ModelSerializer):
    patient_name_display = serializers.CharField(source='patient.name', read_only=True)
    class Meta:
        model = Appointment
        fields = '__all__'

class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = '__all__'

class WardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ward
        fields = '__all__'

class BedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bed
        fields = '__all__'

from .clinical_ai import analyze_vitals

class VitalSignSerializer(serializers.ModelSerializer):
    ai_alerts = serializers.SerializerMethodField()

    class Meta:
        model = VitalSign
        fields = '__all__'

    def get_ai_alerts(self, obj):
        return analyze_vitals(obj)

class InvestigationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Investigation
        fields = '__all__'

class PrescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prescription
        fields = '__all__'

class ClinicalNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClinicalNote
        fields = '__all__'

class InventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventory
        fields = '__all__'

class BillSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.name', read_only=True)
    class Meta:
        model = Bill
        fields = '__all__'

class BillItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = BillItem
        fields = '__all__'
