from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.utils import timezone
from .models import Prescription, Inventory, Bill, BillItem, PharmacySale, PharmacySaleItem
from .permissions import IsPharmacist, IsAdmin

class DispenseMedicationView(APIView):
    permission_classes = [IsAuthenticated, IsPharmacist | IsAdmin]

    @transaction.atomic
    def post(self, request, pk):
        try:
            prescription = Prescription.objects.get(pk=pk)
            if prescription.status == 'dispensed':
                return Response({"error": "Already dispensed"}, status=status.HTTP_400_BAD_REQUEST)

            # Find matching inventory item
            inventory_item = Inventory.objects.filter(name__icontains=prescription.medication).first()
            if not inventory_item:
                return Response({"error": f"Medication {prescription.medication} not found in inventory"}, status=status.HTTP_404_NOT_FOUND)

            # Check stock
            # Assuming quantity 1 for demo purposes; in real app, parse from prescription
            quantity = 1
            if inventory_item.stock_level < quantity:
                return Response({"error": "Insufficient stock"}, status=status.HTTP_400_BAD_REQUEST)

            # 1. Update Inventory
            inventory_item.stock_level -= quantity
            inventory_item.save()

            # 2. Update Prescription Status
            prescription.status = 'dispensed'
            prescription.save()

            # 3. Add to Patient's Bill
            # Find or create a pending bill for the patient
            bill, _ = Bill.objects.get_or_create(
                patient=prescription.patient,
                status='pending',
                defaults={'invoice_number': f"INV-{timezone.now().strftime('%Y%m%d%H%M%S')}"}
            )

            item_total = inventory_item.price * quantity
            BillItem.objects.create(
                bill=bill,
                description=f"Medication: {prescription.medication}",
                amount=item_total,
                type='medication'
            )

            bill.total_amount += item_total
            bill.save()

            if prescription.patient.phone:
                send_notification.delay(prescription.patient.name, prescription.patient.phone, 'dispense', prescription.medication)

            return Response({"status": "Success", "message": f"Dispensed {prescription.medication}"})

        except Prescription.DoesNotExist:
            return Response({"error": "Prescription not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
