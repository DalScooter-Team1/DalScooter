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

        # Get user ID from Cognito token via custom authorizer context
        # Try multiple possible locations for user ID
        user_id = None
        if 'requestContext' in event and 'authorizer' in event['requestContext']:
            authorizer = event['requestContext']['authorizer']
            # Try context first (for custom authorizer)
            if 'userId' in authorizer:
                user_id = authorizer['userId']
            # Try claims (for direct Cognito JWT)
            elif 'claims' in authorizer and 'sub' in authorizer['claims']:
                user_id = authorizer['claims']['sub']
            # Try principalId as fallback
            elif 'principalId' in authorizer:
                user_id = authorizer['principalId']
        
        if not user_id:
            print(f"Debug - event: {json.dumps(event)}")
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Unable to identify user'})
            }

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
            'status': 'open'
        })

        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'message': 'Concern submitted successfully',
                'messageId': message_id
            })
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Failed to submit concern'})
        }