import json
import boto3
import os
import uuid
from datetime import datetime

dynamodb = boto3.resource('dynamodb')

MESSAGES_TABLE = os.environ['MESSAGES_TABLE_NAME']

def lambda_handler(event, context):
    try:
        print(f"Debug - Received event: {json.dumps(event, default=str)}")
        
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        print(f"Debug - Parsed body: {body}")
        
        message_id = body.get('messageId')
        content = body.get('content')
        original_timestamp = body.get('originalTimestamp')
        
        print(f"Debug - messageId: {message_id}, content: {content}, originalTimestamp: {original_timestamp}")

        # Get franchise ID from Cognito token via custom authorizer context
        # Try multiple possible locations for user ID
        franchise_id = None
        print(f"Debug - RequestContext: {event.get('requestContext', {})}")
        
        if 'requestContext' in event and 'authorizer' in event['requestContext']:
            authorizer = event['requestContext']['authorizer']
            print(f"Debug - Authorizer data: {authorizer}")
            # Try context first (for custom authorizer)
            if 'userId' in authorizer:
                franchise_id = authorizer['userId']
                print(f"Debug - Found userId in authorizer: {franchise_id}")
            # Try claims (for direct Cognito JWT)
            elif 'claims' in authorizer and 'sub' in authorizer['claims']:
                franchise_id = authorizer['claims']['sub']
                print(f"Debug - Found sub in claims: {franchise_id}")
            # Try principalId as fallback
            elif 'principalId' in authorizer:
                franchise_id = authorizer['principalId']
                print(f"Debug - Found principalId: {franchise_id}")
        
        print(f"Debug - Final franchise_id: {franchise_id}")
        
        if not franchise_id:
            print(f"Debug - Unable to extract franchise_id from event")
            print(f"Debug - Full event: {json.dumps(event, default=str)}")
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Unable to identify user'})
            }

        if not all([message_id, content, original_timestamp]):
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing required fields'})
            }

        # Verify concern exists
        messages_table = dynamodb.Table(MESSAGES_TABLE)
        
        # Ensure original_timestamp is an integer
        try:
            original_timestamp = int(original_timestamp)
        except (ValueError, TypeError):
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid timestamp format'})
            }
        
        concern_response = messages_table.get_item(
            Key={'messageId': message_id, 'timestamp': original_timestamp}
        )
        print(f"Debug - Concern lookup result: {concern_response}")
        
        if 'Item' not in concern_response:
            print(f"Debug - Message not found for messageId: {message_id}, timestamp: {original_timestamp}")
            return {
                'statusCode': 404,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Message not found'})
            }

        # Store response in DynamoDB
        response_message_id = str(uuid.uuid4())
        response_timestamp = int(datetime.utcnow().timestamp())
        
        response_item = {
            'messageId': response_message_id,
            'timestamp': response_timestamp,
            'userId': concern_response['Item']['userId'],
            'franchiseId': franchise_id,
            'content': content,
            'messageType': 'response',
            'status': 'resolved'
        }
        print(f"Debug - Storing response item: {response_item}")
        
        messages_table.put_item(Item=response_item)

        # Update original concern status
        print(f"Debug - Updating original concern status for messageId: {message_id}, timestamp: {original_timestamp}")
        update_result = messages_table.update_item(
            Key={
                'messageId': message_id,
                'timestamp': original_timestamp
            },
            UpdateExpression='SET #status = :s',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={':s': 'resolved'}
        )
        print(f"Debug - Update result: {update_result}")

        print(f"Debug - Response submitted successfully. ResponseId: {response_message_id}")
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'message': 'Response submitted successfully',
                'responseMessageId': response_message_id
            })
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Failed to submit response'})
        }