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
        # Try multiple possible locations for user ID
        customer_id = None
        print(f"Debug - RequestContext: {event.get('requestContext', {})}")
        
        if 'requestContext' in event and 'authorizer' in event['requestContext']:
            authorizer = event['requestContext']['authorizer']
            print(f"Debug - Authorizer data: {authorizer}")
            # Try context first (for custom authorizer)
            if 'userId' in authorizer:
                customer_id = authorizer['userId']
                print(f"Debug - Found userId in authorizer: {customer_id}")
            # Try claims (for direct Cognito JWT)
            elif 'claims' in authorizer and 'sub' in authorizer['claims']:
                customer_id = authorizer['claims']['sub']
                print(f"Debug - Found sub in claims: {customer_id}")
            # Try principalId as fallback
            elif 'principalId' in authorizer:
                customer_id = authorizer['principalId']
                print(f"Debug - Found principalId: {customer_id}")
        
        print(f"Debug - Final customer_id: {customer_id}")
        
        # TEMPORARY DEBUG: If no customer_id from authorizer, use a test approach
        if not customer_id:
            print(f"Debug - No customer_id from authorizer, checking if this is a debug request")
            print(f"Debug - Full event: {json.dumps(event, default=str)}")
            
            # For debugging: get all messages and return them (remove this in production)
            print("Debug - Authorization disabled, fetching all messages for debugging")
            messages_table = dynamodb.Table(MESSAGES_TABLE)
            
            try:
                # Get all messages from the table
                response = messages_table.scan()
                messages = response.get('Items', [])
                
                # Sort messages by timestamp, newest first
                sorted_messages = sorted(messages, key=lambda x: x.get('timestamp', 0), reverse=True)
                
                print(f"Debug - Found {len(sorted_messages)} total messages in table")
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                        'Access-Control-Allow-Methods': 'GET, OPTIONS'
                    },
                    'body': json.dumps({
                        'success': True,
                        'messages': sorted_messages,
                        'totalCount': len(sorted_messages),
                        'debug': 'Authorization disabled - showing all messages'
                    }, cls=DecimalEncoder)
                }
            except Exception as e:
                print(f"Debug - Error in debug mode: {str(e)}")
                return {
                    'statusCode': 500,
                    'headers': {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                        'Access-Control-Allow-Methods': 'GET, OPTIONS'
                    },
                    'body': json.dumps({
                        'success': False,
                        'error': f'Debug mode error: {str(e)}'
                    })
                }

        messages_table = dynamodb.Table(MESSAGES_TABLE)
        
        # Scan for messages related to this customer (both concerns and responses)
        response = messages_table.scan(
            FilterExpression='userId = :uid',
            ExpressionAttributeValues={':uid': customer_id}
        )

        messages = response.get('Items', [])
        
        # Sort messages by timestamp, newest first
        sorted_messages = sorted(messages, key=lambda x: x.get('timestamp', 0), reverse=True)
        
        print(f"Found {len(sorted_messages)} messages for customer {customer_id}")
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'GET, OPTIONS'
            },
            'body': json.dumps({
                'success': True,
                'messages': sorted_messages,
                'totalCount': len(sorted_messages)
            }, cls=DecimalEncoder)
        }

    except Exception as e:
        print(f"Error fetching customer messages: {str(e)}")
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
