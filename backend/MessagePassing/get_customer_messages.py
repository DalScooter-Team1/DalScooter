import json
import boto3
import os
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')

MESSAGES_TABLE = os.environ['MESSAGES_TABLE_NAME']

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def lambda_handler(event, context):
    try:
        print(f"Debug - Customer messages event: {json.dumps(event, default=str)}")
        
        # Get customer ID from Cognito token via custom authorizer context
        customer_id = None
        print(f"Debug - RequestContext: {event.get('requestContext', {})}")
        
        if 'requestContext' in event and 'authorizer' in event['requestContext']:
            authorizer = event['requestContext']['authorizer']
            print(f"Debug - Authorizer data: {authorizer}")
            
            # The customer authorizer should pass userId in the context
            if 'userId' in authorizer:
                customer_id = authorizer['userId']
                print(f"Debug - Found userId in authorizer: {customer_id}")
            # Fallback to principalId if userId not found
            elif 'principalId' in authorizer:
                customer_id = authorizer['principalId']
                print(f"Debug - Found principalId: {customer_id}")
        else:
            print("Debug - No requestContext.authorizer found in event")
        
        # For testing without authorization, use a default customer ID
        if not customer_id:
            customer_id = 'debug-user'  # This matches the userId used in submit_concern
            print(f"Debug - Using default customer_id for testing: {customer_id}")
        
        print(f"Debug - Final customer_id: {customer_id}")

        print(f"Fetching messages for customer: {customer_id}")
        
        messages_table = dynamodb.Table(MESSAGES_TABLE)
        
        # Get all messages related to this customer (both concerns they submitted and responses they received)
        response = messages_table.scan(
            FilterExpression='userId = :uid',
            ExpressionAttributeValues={':uid': customer_id}
        )

        messages = response.get('Items', [])
        
        # Group messages by conversation threads
        conversations = {}
        for message in messages:
            if message.get('messageType') == 'concern':
                # This is an original concern
                conv_key = f"{message['messageId']}_{message['timestamp']}"
                conversations[conv_key] = {
                    'concern': message,
                    'responses': []
                }
            elif message.get('messageType') == 'response':
                # This is a response to a concern
                original_msg_id = message.get('originalMessageId')
                original_timestamp = message.get('originalTimestamp')
                if original_msg_id and original_timestamp:
                    conv_key = f"{original_msg_id}_{original_timestamp}"
                    if conv_key not in conversations:
                        conversations[conv_key] = {
                            'concern': None,
                            'responses': []
                        }
                    conversations[conv_key]['responses'].append(message)
        
        # Convert to a list and sort by latest activity
        conversation_list = []
        for conv_key, conversation in conversations.items():
            if conversation['concern']:  # Only include conversations with a valid concern
                # Find the latest timestamp in this conversation
                latest_timestamp = conversation['concern']['timestamp']
                for response in conversation['responses']:
                    if response['timestamp'] > latest_timestamp:
                        latest_timestamp = response['timestamp']
                
                conversation_list.append({
                    'conversationId': conv_key,
                    'concern': conversation['concern'],
                    'responses': sorted(conversation['responses'], key=lambda x: x['timestamp']),
                    'latestActivity': latest_timestamp,
                    'hasResponse': len(conversation['responses']) > 0,
                    'status': conversation['concern'].get('status', 'pending')
                })
        
        # Sort conversations by latest activity, newest first
        sorted_conversations = sorted(conversation_list, key=lambda x: x['latestActivity'], reverse=True)
        
        print(f"Found {len(sorted_conversations)} conversations for customer {customer_id}")
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'GET, OPTIONS'
            },
            'body': json.dumps({
                'success': True,
                'conversations': sorted_conversations,
                'totalCount': len(sorted_conversations)
            }, cls=DecimalEncoder)
        }

    except Exception as e:
        print(f"Error fetching customer messages: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'GET, OPTIONS'
            },
            'body': json.dumps({
                'success': False,
                'error': 'Failed to fetch customer messages'
            })
        }
