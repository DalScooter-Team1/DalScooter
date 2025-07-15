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
        message_id = body.get('messageId')
        content = body.get('content')
        original_timestamp = body.get('originalTimestamp')

        # Get franchise ID from Cognito token
        franchise_id = event['requestContext']['authorizer']['claims']['sub']

        if not all([message_id, content, original_timestamp]):
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing required fields'})
            }

        # Verify concern exists
        messages_table = dynamodb.Table(MESSAGES_TABLE)
        concern_response = messages_table.get_item(
            Key={'messageId': message_id, 'timestamp': original_timestamp}
        )
        if 'Item' not in concern_response:
            return {
                'statusCode': 404,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Message not found'})
            }

        # Store response in DynamoDB
        response_message_id = str(uuid.uuid4())
        response_timestamp = int(datetime.utcnow().timestamp())
        messages_table.put_item(Item={
            'messageId': response_message_id,
            'timestamp': response_timestamp,
            'userId': concern_response['Item']['userId'],
            'franchiseId': franchise_id,
            'content': content,
            'messageType': 'response',
            'status': 'resolved'
        })

        # Update original concern status
        messages_table.update_item(
            Key={
                'messageId': message_id,
                'timestamp': original_timestamp
            },
            UpdateExpression='SET #status = :s',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={':s': 'resolved'}
        )

        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'message': 'Response submitted successfully',
                'responseMessageId': response_message_id
            })
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Failed to submit response'})
        }