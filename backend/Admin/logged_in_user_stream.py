import os
import boto3
import csv
import io
import base64
from datetime import datetime

def lambda_handler(event, context):
    s3 = boto3.client('s3')
    records = event.get('Records', [])
    bucket = os.environ['S3_BUCKET']
    folder = os.environ.get('S3_FOLDER', 'logged_in_user_directory/')
    csv_rows = []
    headers = set()

    # Collect all fields for CSV header
    for record in records:
        ddb = record.get('dynamodb', {})
        new_image = ddb.get('NewImage', {})
        if new_image:
            headers.update(new_image.keys())
    headers = sorted(headers)

    # Prepare CSV rows
    for record in records:
        ddb = record.get('dynamodb', {})
        new_image = ddb.get('NewImage', {})
        if new_image:
            row = []
            for h in headers:
                val = new_image.get(h, {}).get('S') or new_image.get(h, {}).get('N') or ''
                row.append(val)
            csv_rows.append(row)

    if not csv_rows:
        return {'statusCode': 200, 'body': 'No new records.'}

    # Prepare CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(headers)
    writer.writerows(csv_rows)
    csv_data = output.getvalue()

    # Save to S3 with timestamped filename
    now = datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')
    key = f"{folder}logged_in_users_{now}.csv"
    s3.put_object(Bucket=bucket, Key=key, Body=csv_data.encode('utf-8'))

    return {'statusCode': 200, 'body': f'Saved {len(csv_rows)} records to {key}'}
