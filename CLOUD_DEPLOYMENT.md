# Cloud Deployment Guide

This project is containerized and ready for cloud deployment.

## Option 1: AWS (Amazon Web Services)

### Using AWS Elastic Beanstalk (Multi-container Docker)
1. Install AWS CLI and EB CLI.
2. Initialize EB: `eb init -p multi-container-docker my-hospital-ehr`.
3. Create an RDS PostgreSQL instance.
4. Create an ElastiCache Redis instance.
5. Update `.env` with the AWS DB and Redis endpoints.
6. Deploy: `eb create`.

### Using AWS ECS (Elastic Container Service)
1. Push images to ECR (Elastic Container Registry).
2. Create an ECS Cluster.
3. Define Task Definitions for each service (frontend, backend, chat, nginx).
4. Use an Application Load Balancer to route traffic to Nginx.

---

## Option 2: Google Cloud Platform (GCP)

### Using Google Kubernetes Engine (GKE)
1. Push images to Artifact Registry.
2. Use the provided Kubernetes manifests (need to be created) to deploy to GKE.
3. Use Cloud SQL for PostgreSQL.
4. Use Memorystore for Redis.

### Using Cloud Run
1. Deploy each service as a separate Cloud Run service.
2. Note: Nginx might need adjustments to route to multiple Cloud Run URLs.

---

## Backup System Configuration
The backup system uses `python manage.py backup_db`.
- To automate, add a CRON job in the `backend_api` container:
  `0 2 * * * /usr/local/bin/python /app/manage.py backup_db`
- Ensure AWS/GCP credentials are in the `.env` file for remote storage.
