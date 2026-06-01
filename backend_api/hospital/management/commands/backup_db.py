import os
import subprocess
from datetime import datetime
from django.core.management.base import BaseCommand
from django.conf import settings
import boto3
from botocore.exceptions import NoCredentialsError

class Command(BaseCommand):
    help = 'Backs up the database and uploads to S3'

    def add_arguments(self, parser):
        parser.add_argument('--local-only', action='store_true', help='Only save backup locally')

    def handle(self, *args, **options):
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_filename = f"hospital_backup_{timestamp}.sql"
        backup_path = os.path.join(settings.BASE_DIR, 'backups', backup_filename)

        if not os.path.exists(os.path.join(settings.BASE_DIR, 'backups')):
            os.makedirs(os.path.join(settings.BASE_DIR, 'backups'))

        db_conf = settings.DATABASES['default']

        # Construct pg_dump command
        # Note: This assumes pg_dump is available in the environment (e.g., in the Docker container)
        env = os.environ.copy()
        env['PGPASSWORD'] = db_conf['PASSWORD']

        cmd = [
            'pg_dump',
            '-h', db_conf['HOST'],
            '-U', db_conf['USER'],
            '-d', db_conf['NAME'],
            '-f', backup_path
        ]

        try:
            self.stdout.write(f"Starting backup to {backup_path}...")
            subprocess.run(cmd, env=env, check=True)
            self.stdout.write(self.style.SUCCESS(f"Successfully created local backup: {backup_filename}"))

            if not options['local-only']:
                self.upload_to_s3(backup_path, backup_filename)

        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Backup failed: {str(e)}"))

    def upload_to_s3(self, file_path, file_name):
        bucket_name = os.getenv('AWS_STORAGE_BUCKET_NAME')
        s3_access_key = os.getenv('AWS_ACCESS_KEY_ID')
        s3_secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')

        if not all([bucket_name, s3_access_key, s3_secret_key]):
            self.stdout.write(self.style.WARNING("AWS credentials not found. Skipping S3 upload."))
            return

        s3 = boto3.client('s3', aws_access_key_id=s3_access_key, aws_secret_access_key=s3_secret_key)

        try:
            self.stdout.write(f"Uploading {file_name} to S3 bucket {bucket_name}...")
            s3.upload_file(file_path, bucket_name, f"backups/{file_name}")
            self.stdout.write(self.style.SUCCESS("Successfully uploaded to S3"))
        except NoCredentialsError:
            self.stderr.write(self.style.ERROR("Credentials not available"))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"S3 Upload failed: {str(e)}"))
