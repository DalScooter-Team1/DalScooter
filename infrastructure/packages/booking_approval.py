import json
import boto3
import os
import secrets

dynamodb = boto3.resource('dynamodb')
BOOKING_TABLE = os.environ['BOOKING_TABLE_NAME']

def handler(event, context):
    table = dynamodb.Table(BOOKING_TABLE)

    for record in event['Records']:
        try:
            body = json.loads(record['body'])
            booking_id = body['bookingId']

            # Lookup booking
            result = table.get_item(Key={'bookingId': booking_id})
            booking = result.get('Item')

            if not booking:
                print(f"Booking ID {booking_id} not found.")
                continue

            # Generate 6-char access code
            access_code = secrets.token_hex(3).upper()

            # Update booking with access code
            table.update_item(
                Key={'bookingId': booking_id},
                UpdateExpression='SET accessCode = :ac, isUsed = :used',
                ExpressionAttributeValues={
                    ':ac': access_code,
                    ':used': False
                }
            )

            print(f"Access code assigned to booking {booking_id}: {access_code}")

        except Exception as e:
            print(f"Failed to process booking {booking_id}: {e}")

    return {
        'statusCode': 200,
        'body': json.dumps({'message': 'Processed all booking approvals.'})
    }
