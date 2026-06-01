import uuid
from django.db import models
from django.utils import timezone

class Branch(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    api_key = models.CharField(max_length=255, unique=True, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class User(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Administrator'),
        ('doctor', 'Doctor'),
        ('nurse', 'Nurse'),
        ('pharmacist', 'Pharmacist'),
        ('receptionist', 'Receptionist'),
        ('patient', 'Patient'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField('auth.User', on_delete=models.CASCADE, related_name='hospital_profile', null=True, blank=True)
    uid = models.CharField(max_length=255, unique=True, null=True, blank=True)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True, null=True, blank=True)
    phone = models.CharField(max_length=20, unique=True, null=True, blank=True)
    password = models.CharField(max_length=255, null=True, blank=True)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES)
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True, blank=True, related_name='staff')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.role})"

class Ward(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=100, default="General")
    capacity = models.IntegerField()

    def __str__(self):
        return self.name

class Patient(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField('auth.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='patient_record')
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True, null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    gender = models.CharField(max_length=20)
    dob = models.DateTimeField()
    age = models.IntegerField(null=True, blank=True)
    blood_group = models.CharField(max_length=10, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    # Insurance Info
    insurance_provider = models.CharField(max_length=255, null=True, blank=True)
    insurance_policy_number = models.CharField(max_length=100, null=True, blank=True)
    insurance_coverage_percent = models.FloatField(default=0) # 0 to 100
    next_of_kin_name = models.CharField(max_length=255, null=True, blank=True)
    next_of_kin_phone = models.CharField(max_length=20, null=True, blank=True)
    next_of_kin_relationship = models.CharField(max_length=100, null=True, blank=True)
    photo_url = models.URLField(max_length=500, null=True, blank=True)
    fingerprint = models.TextField(null=True, blank=True)
    next_visit = models.DateTimeField(null=True, blank=True)
    allergies = models.TextField(null=True, blank=True)
    admission_date = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=50)  # inpatient, outpatient, discharged
    workflow_status = models.CharField(max_length=50, default="registered")
    doctor_id = models.CharField(max_length=255, null=True, blank=True)
    doctor_name = models.CharField(max_length=255, null=True, blank=True)
    ward = models.ForeignKey(Ward, on_delete=models.SET_NULL, null=True, blank=True, related_name='patients')
    bed_id = models.CharField(max_length=255, null=True, blank=True)
    discharge_reason = models.TextField(null=True, blank=True)
    diagnosis = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.name

class Doctor(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField('auth.User', on_delete=models.CASCADE, related_name='doctor_profile', null=True, blank=True)
    specialization = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"Dr. {self.user.get_full_name() if self.user else 'Unknown'}"

class Bed(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    number = models.IntegerField(default=0)
    status = models.CharField(max_length=50)  # vacant, occupied, maintenance
    ward = models.ForeignKey(Ward, on_delete=models.CASCADE, related_name='beds')
    patient = models.OneToOneField(Patient, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_bed')

    def __str__(self):
        return f"Bed {self.number} in {self.ward.name}"

class Appointment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='appointments')
    doctor_id = models.CharField(max_length=255, null=True, blank=True)
    doctor_name = models.CharField(max_length=255, null=True, blank=True)
    date_time = models.DateTimeField()
    reason = models.TextField()
    status = models.CharField(max_length=50)  # scheduled, completed, cancelled
    type = models.CharField(max_length=50)  # consultation, follow-up, investigation
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Bill(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='bills')
    total_amount = models.FloatField(default=0)
    insurance_covered_amount = models.FloatField(default=0)
    patient_payable_amount = models.FloatField(default=0)
    status = models.CharField(max_length=50)  # pending, paid
    invoice_number = models.CharField(max_length=100, unique=True, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class BillItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    bill = models.ForeignKey(Bill, on_delete=models.CASCADE, related_name='items')
    description = models.CharField(max_length=255)
    amount = models.FloatField()
    type = models.CharField(max_length=50)  # medication, investigation, consultation, ward
    created_at = models.DateTimeField(auto_now_add=True)

class TreatmentPlan(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='treatment_plans')
    content = models.TextField()
    author_id = models.CharField(max_length=255)
    author_name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

class Review(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='reviews')
    content = models.TextField()
    author_id = models.CharField(max_length=255)
    author_name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

class VitalSign(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='vitals')
    bp = models.CharField(max_length=20, null=True, blank=True)
    pulse = models.IntegerField(null=True, blank=True)
    temp = models.FloatField(null=True, blank=True)
    resp = models.IntegerField(null=True, blank=True)
    spo2 = models.IntegerField(null=True, blank=True)
    weight = models.FloatField(null=True, blank=True)
    taken_by = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

class Investigation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='investigations')
    type = models.CharField(max_length=100)
    category = models.CharField(max_length=100)
    test_name = models.CharField(max_length=255)
    status = models.CharField(max_length=50)
    priority = models.CharField(max_length=50)
    requested_by = models.CharField(max_length=255)
    result = models.TextField(null=True, blank=True)
    file = models.FileField(upload_to='investigations/%Y/%m/%d/', null=True, blank=True)
    file_url = models.URLField(max_length=500, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class ClinicalNote(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='notes')
    author_id = models.CharField(max_length=255)
    author_name = models.CharField(max_length=255)
    type = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class Prescription(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='prescriptions')
    author_id = models.CharField(max_length=255)
    author_name = models.CharField(max_length=255, default="Unknown")
    medication = models.CharField(max_length=255)
    dosage = models.CharField(max_length=255)
    frequency = models.CharField(max_length=255)
    duration = models.CharField(max_length=255)
    status = models.CharField(max_length=50)  # active, dispensed, discontinued, completed
    created_at = models.DateTimeField(auto_now_add=True)

class AuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.CharField(max_length=255)
    user_name = models.CharField(max_length=255)
    action = models.CharField(max_length=255)
    resource_id = models.CharField(max_length=255, null=True, blank=True)
    resource_type = models.CharField(max_length=255, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

class Inventory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True)
    category = models.CharField(max_length=100, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    stock_level = models.IntegerField(default=0)
    min_stock_level = models.IntegerField(default=10)
    price = models.FloatField(default=0)
    unit = models.CharField(max_length=50, default="pcs")
    expiry_date = models.DateTimeField(null=True, blank=True)
    batch_number = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class PharmacySale(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.SET_NULL, null=True, blank=True, related_name='sales')
    total_amount = models.FloatField()
    status = models.CharField(max_length=50)  # pending, completed, cancelled
    sold_by = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

class PharmacySaleItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sale = models.ForeignKey(PharmacySale, on_delete=models.CASCADE, related_name='items')
    inventory = models.ForeignKey(Inventory, on_delete=models.PROTECT, related_name='sales_items')
    quantity = models.IntegerField()
    unit_price = models.FloatField()
    total_price = models.FloatField()

class ServicePricing(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True)
    category = models.CharField(max_length=100)
    price = models.FloatField(default=0)
    updated_at = models.DateTimeField(auto_now=True)
