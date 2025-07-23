import json
import boto3
import os
import uuid
from datetime import datetime

dynamodb = boto3.resource('dynamodb')

MESSAGES_TABLE = os.environ['MESSAGES_TABLE_NAME']

def lambda_handler(event, context):
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        content = body.get('content')

        # Get user ID from Cognito token (try different locations for debugging)
        user_id = 'debug-user'  # Default for testing
        try:
            # Try to get from authorizer context first
            if 'requestContext' in event and 'authorizer' in event['requestContext']:
                if 'claims' in event['requestContext']['authorizer']:
                    user_id = event['requestContext']['authorizer']['claims']['sub']
                elif 'userId' in event['requestContext']['authorizer']:
                    user_id = event['requestContext']['authorizer']['userId']
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

        # Store concern in DynamoDB
        message_id = str(uuid.uuid4())
        timestamp = int(datetime.utcnow().timestamp())
        messages_table = dynamodb.Table(MESSAGES_TABLE)
        messages_table.put_item(Item={
            'messageId': message_id,
            'timestamp': timestamp,
            'userId': user_id,
            'content': content,
            'messageType': 'concern',
            'status': 'pending'
        })

        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'message': 'Concern submitted successfully',
                'messageId': message_id,
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