import json
import uuid
import boto3
import os

dynamodb = boto3.resource('dynamodb')
sqs = boto3.client('sqs')

BOOKING_TABLE = os.environ['BOOKING_TABLE_NAME']
QUEUE_URL = os.environ['SQS_QUEUE_URL']

def get_cors_headers():
    """Return CORS headers for API responses"""
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Content-Type': 'application/json'
    }

def handler(event, context):
    # Handle CORS preflight
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps({'message': 'CORS preflight successful'})
        }
    
    try:
        # Parse request body
        body = json.loads(event['body'])
        booking_id = str(uuid.uuid4())

        # Create booking item
        booking_item = {
            'bookingId': booking_id,
            'userId': body['userId'],
            'bikeId': body['bikeId'],
            'startTime': body['startTime'],
            'endTime': body['endTime'],
            'accessCode': '',
            'price': body['price'],
            'isUsed': False
        }

        # Save to DynamoDB
        table = dynamodb.Table(BOOKING_TABLE)
        table.put_item(Item=booking_item)

        # Send to SQS
        sqs.send_message(
            QueueUrl=QUEUE_URL,
            MessageBody=json.dumps({'bookingId': booking_id})
        )

        # Return success response
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'message': 'Booking created and pushed to approval queue.',
                'bookingId': booking_id
            })
        }

    except Exception as e:
        # Return error response
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({'error': 'Booking request failed.'})
        }
