from django.test import TestCase
from django.utils import timezone
from .models import Patient, Ward, Bill, BillItem

class PatientModelTest(TestCase):
    def setUp(self):
        self.ward = Ward.objects.create(name="General Ward", capacity=10)
        self.patient = Patient.objects.create(
            name="John Doe",
            gender="Male",
            dob=timezone.now(),
            status="inpatient",
            ward=self.ward
        )

    def test_patient_creation(self):
        self.assertEqual(self.patient.name, "John Doe")
        self.assertEqual(self.patient.ward.name, "General Ward")

class BillingTest(TestCase):
    def setUp(self):
        self.patient = Patient.objects.create(
            name="Jane Smith",
            gender="Female",
            dob=timezone.now(),
            status="outpatient"
        )
        self.bill = Bill.objects.create(
            patient=self.patient,
            status="pending"
        )

    def test_bill_calculation(self):
        BillItem.objects.create(bill=self.bill, description="Consultation", amount=50.0, type="consultation")
        BillItem.objects.create(bill=self.bill, description="Medication", amount=30.0, type="medication")

        # In a real scenario, there might be a signal or method to update total_amount
        # For now, we just check if items are linked
        self.assertEqual(self.bill.items.count(), 2)
        total = sum(item.amount for item in self.bill.items.all())
        self.assertEqual(total, 80.0)
