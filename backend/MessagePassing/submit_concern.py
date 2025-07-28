import json
import boto3
import os
import uuid
from datetime import datetime

sqs = boto3.client('sqs')

CONCERNS_QUEUE_URL = os.environ['CONCERNS_QUEUE_URL']

def lambda_handler(event, context):
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        content = body.get('content')

        # Get user ID from Cognito token (try different locations for debugging)
        user_id = 'debug-user'  # Default for testing
        customer_franchise_id = None  # Will be populated if user has franchise assignment
        
        try:
            # Try to get from authorizer context first
            if 'requestContext' in event and 'authorizer' in event['requestContext']:
                if 'claims' in event['requestContext']['authorizer']:
                    user_id = event['requestContext']['authorizer']['claims']['sub']
                    # Try to get customer's franchise ID from claims (if available)
                    customer_franchise_id = event['requestContext']['authorizer']['claims'].get('custom:franchise_id')
                elif 'userId' in event['requestContext']['authorizer']:
                    user_id = event['requestContext']['authorizer']['userId']
                    
            # For customers, we might determine franchise based on their location, preference, or assignment
            # For now, we'll leave it as None and let the process_concern function handle assignment
            
        except Exception as e:
            print(f"Warning: Could not extract user_id from authorizer: {e}")
            # For debugging purposes, use a default user_id
            user_id = 'debug-user-' + str(uuid.uuid4())[:8]

        print(f"Processing concern submission for user: {user_id}")

        if not content:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing content'})
            }

        # Generate message details
        message_id = str(uuid.uuid4())
        timestamp = int(datetime.utcnow().timestamp())

        # Prepare message for SQS queue
        message_body = {
            'messageId': message_id,
            'timestamp': timestamp,
            'userId': user_id,
            'content': content,
            'messageType': 'concern',
            'status': 'pending',
            'submittedAt': datetime.utcnow().isoformat()
        }

        # Send message to SQS queue for processing
        response = sqs.send_message(
            QueueUrl=CONCERNS_QUEUE_URL,
            MessageBody=json.dumps(message_body),
            MessageAttributes={
                'messageType': {
                    'StringValue': 'concern',
                    'DataType': 'String'
                },
                'userId': {
                    'StringValue': user_id,
                    'DataType': 'String'
                },
                'priority': {
                    'StringValue': 'normal',
                    'DataType': 'String'
                }
            }
        )

        print(f"Concern queued successfully: {response['MessageId']}")

        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'message': 'Concern submitted successfully and queued for processing',
                'messageId': message_id,
                'queueMessageId': response['MessageId'],
                'timestamp': timestamp
            })
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Failed to submit concern'})
        }