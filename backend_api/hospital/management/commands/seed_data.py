from django.core.management.base import BaseCommand
from django.contrib.auth.models import User as AuthUser
from hospital.models import Patient, Ward, Bed, Inventory, User as HospitalUser, Appointment
from django.utils import timezone
import random

class Command(BaseCommand):
    help = 'Seeds the database with sample hospital data'

    def handle(self, *args, **options):
        # Create Users with Roles
        roles = ['doctor', 'nurse', 'pharmacist', 'receptionist']
        for role in roles:
            username = f'test_{role}'
            if not AuthUser.objects.filter(username=username).exists():
                auth_user = AuthUser.objects.create_user(
                    username=username,
                    password='password123',
                    first_name=role.capitalize(),
                    last_name='User'
                )
                HospitalUser.objects.create(
                    user=auth_user,
                    name=f'{role.capitalize()} User',
                    role=role
                )
                self.stdout.write(f'Created user: {username} with password: password123')

        # Create Wards
        wards = []
        for ward_name in ['General Ward A', 'ICU', 'Pediatrics', 'Maternity']:
            ward, _ = Ward.objects.get_or_create(
                name=ward_name,
                defaults={'capacity': 10, 'type': 'General' if 'Ward' in ward_name else 'Specialized'}
            )
            wards.append(ward)

        # Create Beds
        for ward in wards:
            for i in range(1, 6):
                Bed.objects.get_or_create(
                    number=i,
                    ward=ward,
                    defaults={'status': 'vacant'}
                )

        # Create Patients
        names = ['John Doe', 'Jane Smith', 'Alice Johnson', 'Bob Brown', 'Charlie Davis']
        for name in names:
            Patient.objects.get_or_create(
                name=name,
                defaults={
                    'gender': random.choice(['Male', 'Female']),
                    'dob': timezone.now() - timezone.timedelta(days=random.randint(7000, 20000)),
                    'status': 'inpatient',
                    'workflow_status': 'admitted',
                    'address': '123 Hospital St',
                }
            )

        # Create Inventory
        items = [
            ('Paracetamol', 'Medication', 100),
            ('Syringe 5ml', 'Supplies', 500),
            ('Amoxicillin', 'Medication', 50),
            ('Bandages', 'Supplies', 200)
        ]
        for name, cat, stock in items:
            Inventory.objects.get_or_create(
                name=name,
                defaults={'category': cat, 'stock_level': stock, 'price': random.uniform(5, 50)}
            )

        # Create Appointments
        patients = Patient.objects.all()
        for i in range(10):
            patient = random.choice(patients)
            date = timezone.now() + timezone.timedelta(days=random.randint(-5, 5), hours=random.randint(0, 8))
            Appointment.objects.create(
                patient=patient,
                date_time=date,
                reason=random.choice(['Routine Checkup', 'Fever', 'Follow up', 'Consultation']),
                status=random.choice(['scheduled', 'completed']),
                type='consultation'
            )

        self.style.SUCCESS('Successfully seeded hospital data')
