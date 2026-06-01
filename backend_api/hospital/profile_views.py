from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        role = 'admin'
        if hasattr(user, 'hospital_profile'):
            role = user.hospital_profile.role
        elif user.is_superuser:
            role = 'admin'

        patient_id = None
        if hasattr(user, 'patient_record'):
            patient_id = user.patient_record.id

        return Response({
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": role,
            "patient_id": patient_id
        })
