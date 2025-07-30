''' 
This is a CloudWatch cron Lambda for scanning the bookings table 
for the past endTime and de-activate the accessCode of the current booking
'''

import boto3
from datetime import datetime, timezone
import os
import json

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
BOOKING_TABLE = os.environ['BOOKING_TABLE_NAME']
table = dynamodb.Table(BOOKING_TABLE)

def lambda_handler(event, context):
    now = datetime.utcnow().replace(tzinfo=timezone.utc)
    expired_count = 0
    errors = []

    # Scan all bookings (pagination)
    response = table.scan()
    bookings = response.get('Items', [])

    while 'LastEvaluatedKey' in response:
        response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
        bookings.extend(response.get('Items', []))

    # Process bookings
    for booking in bookings:
        try:
            end_time_str = booking.get('endTime')
            if not end_time_str:
                continue

            end_time = datetime.fromisoformat(end_time_str).replace(tzinfo=timezone.utc)
            is_used = booking.get('isUsed', False)

            if end_time < now and not is_used:
                table.update_item(
                    Key={'bookingId': booking['bookingId']},
                    UpdateExpression='SET isUsed = :used, accessCode = :code',
                    ExpressionAttributeValues={
                        ':used': True,
                        ':code': ''
                    }
                )
                expired_count += 1
        except Exception as e:
            errors.append(f"Failed for {booking.get('bookingId')}: {str(e)}")

    return {
        'statusCode': 200,
        'body': json.dumps({
            'message': f'Processed bookings. Expired updated: {expired_count}',
            'errors': errors
        })
    }
