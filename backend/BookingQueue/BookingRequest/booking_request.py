import json
import uuid
import boto3
import os

dynamodb = boto3.resource('dynamodb')
sqs = boto3.client('sqs')

BOOKING_TABLE = os.environ['BOOKING_TABLE_NAME']
QUEUE_URL = os.environ['SQS_QUEUE_URL']

def handler(event, context):
    try:
        body = json.loads(event['body'])
        booking_id = str(uuid.uuid4())

        booking_item = {
            'bookingId': booking_id,
            'userId': body['userId'],
            'bikeId': body['bikeId'],
            'startTime': body['startTime'],
            'endTime': body['endTime'],
            'accessCode': '',
            'isUsed': False
        }

        # Save booking to DynamoDB
        table = dynamodb.Table(BOOKING_TABLE)
        table.put_item(Item=booking_item)

        # Push bookingId to SQS
        sqs.send_message(
            QueueUrl=QUEUE_URL,
            MessageBody=json.dumps({'bookingId': booking_id})
        )

        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Booking created and pushed to approval queue.',
                'bookingId': booking_id
            })
        }

    except Exception as e:
        print(f"Booking request error: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Booking request failed.'})
        }
