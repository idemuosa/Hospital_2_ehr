from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import connections
from django.db.utils import OperationalError
from django_redis import get_redis_connection

class HealthCheckView(APIView):
    permission_classes = [] # Public endpoint

    def get(self, request):
        health_status = {
            "status": "healthy",
            "database": "connected",
            "redis": "connected",
            "version": "2.1.0"
        }

        # Check DB
        db_conn = connections['default']
        try:
            db_conn.cursor()
        except OperationalError:
            health_status["database"] = "disconnected"
            health_status["status"] = "degraded"

        # Check Redis
        try:
            get_redis_connection("default").ping()
        except Exception:
            health_status["redis"] = "disconnected"
            health_status["status"] = "degraded"

        return Response(health_status)
