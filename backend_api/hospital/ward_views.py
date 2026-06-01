from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Ward, Bed, Patient
from .serializers import WardSerializer, BedSerializer
from .permissions import IsNurse, IsAdmin, IsReceptionist

class WardMapView(APIView):
    permission_classes = [IsAuthenticated, IsNurse | IsAdmin | IsReceptionist]

    def get(self, request):
        wards = Ward.objects.all()
        data = []
        for ward in wards:
            beds = Bed.objects.filter(ward=ward).order_by('number')
            bed_data = []
            for bed in beds:
                bed_info = {
                    "id": bed.id,
                    "number": bed.number,
                    "status": bed.status,
                    "patient": {
                        "id": bed.patient.id,
                        "name": bed.patient.name
                    } if bed.patient else None
                }
                bed_data.append(bed_info)

            data.append({
                "id": ward.id,
                "name": ward.name,
                "type": ward.type,
                "capacity": ward.capacity,
                "occupied": beds.filter(status='occupied').count(),
                "beds": bed_data
            })
        return Response(data)
