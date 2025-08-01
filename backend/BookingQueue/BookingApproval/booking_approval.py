import json
import boto3
import os
import secrets

dynamodb = boto3.resource('dynamodb')
BOOKING_TABLE = os.environ['BOOKING_TABLE_NAME']
BIKE_TABLE = os.environ['BIKE_TABLE_NAME']
def handler(event, context):
    booking_table = dynamodb.Table(BOOKING_TABLE)
    bike_table = dynamodb.Table(BIKE_TABLE)

    for record in event['Records']:
        booking_id = None
        try:
            # Extract booking ID from SQS message body
            body = json.loads(record['body'])
            booking_id = body['bookingId']
            print(f"Processing booking approval for: {booking_id}")

            # Step 1: Get booking from booking table
            booking_result = booking_table.get_item(Key={'bookingId': booking_id})
            print(f"Booking lookup result: {booking_result}")
            
            if 'Item' not in booking_result:
                print(f"Booking ID {booking_id} not found in booking table.")
                continue
            
            booking = booking_result['Item']
            print(f"Found booking: {booking}")

            # Step 2: Get bike ID from the booking
            bike_id = booking.get('bikeId')
            print(f"Retrieved bike_id: {bike_id} from booking: {booking_id}")
            
            if not bike_id:
                print(f"No bikeId found in booking {booking_id}")
                continue

            # Step 3: Generate access code
            access_code = secrets.token_hex(3).upper()
            print(f"Generated access code: {access_code}")

            # Step 4: Update booking with access code
            booking_table.update_item(
                Key={'bookingId': booking_id},
                UpdateExpression='SET accessCode = :ac, isUsed = :used',
                ExpressionAttributeValues={
                    ':ac': access_code,
                    ':used': False
                }
            )
            print(f"Updated booking {booking_id} with access code: {access_code}")

            # Step 5: Update bike table - make bike unavailable and assign access code
            bike_table.update_item(
                Key={'bikeId': bike_id},
                UpdateExpression='SET isActive = :inactive, accessCode = :ac',
                ExpressionAttributeValues={
                    ':inactive': False,
                    ':ac': access_code
                }
            )
            print(f"Updated bike {bike_id} - set inactive and assigned access code: {access_code}")

        except Exception as e:
            booking_id_str = booking_id if booking_id else "unknown"
            print(f"Failed to process booking {booking_id_str}: {e}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Processed all booking approvals.'})
        }

# To do: Add the email feature to send access code to user