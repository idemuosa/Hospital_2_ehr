from celery import shared_task
from .models import Patient, AuditLog
from django.utils import timezone

@shared_task
def send_notification(patient_name, phone, message_type, details):
    """
    Mock task to send SMS/Email notifications
    """
    message = f"Hello {patient_name}, "
    if message_type == 'appointment':
        message += f"your appointment is scheduled for {details}."
    elif message_type == 'bill':
        message += f"a new bill of {details} has been generated."
    elif message_type == 'dispense':
        message += f"your medication {details} is ready for pickup."

    # In production, you would use Twilio or SendGrid here
    print(f"--- NOTIFICATION SENT TO {phone} ---")
    print(f"Message: {message}")
    print("------------------------------------")

    return f"Notification sent to {patient_name}"

@shared_task
def generate_daily_report():
    """
    Example task that runs daily to count active patients.
    """
    patient_count = Patient.objects.filter(status='inpatient').count()
    AuditLog.objects.create(
        user_id='system',
        user_name='System Task',
        action=f'Daily Report: {patient_count} inpatients currently admitted',
        resource_type='System'
    )
    return f"Report generated: {patient_count} patients."

@shared_task
def process_patient_admission(patient_id):
    """
    Example task to perform async processing after admission.
    """
    try:
        patient = Patient.objects.get(id=patient_id)
        # Simulate some heavy processing
        print(f"Processing admission for {patient.name}")
        return f"Successfully processed admission for {patient.name}"
    except Patient.DoesNotExist:
        return "Patient not found"
