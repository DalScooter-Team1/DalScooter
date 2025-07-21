import json
import boto3
import os
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')

# Custom JSON encoder to handle Decimal objects from DynamoDB
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

MESSAGES_TABLE = os.environ['MESSAGES_TABLE_NAME']

def lambda_handler(event, context):
    try:
        # Debug: Print the entire event to understand the structure
        print(f"Customer messages request - event: {json.dumps(event, indent=2, default=str)}")
        
        # Get customer user ID from Cognito token via custom authorizer context
        customer_id = None
        if 'requestContext' in event and 'authorizer' in event['requestContext']:
            authorizer = event['requestContext']['authorizer']
            print(f"Authorizer context: {json.dumps(authorizer, indent=2, default=str)}")
            # Try context first (for custom authorizer)
            if 'userId' in authorizer:
                customer_id = authorizer['userId']
            # Try claims (for direct Cognito JWT)
            elif 'claims' in authorizer and 'sub' in authorizer['claims']:
                customer_id = authorizer['claims']['sub']
            # Try principalId as fallback
            elif 'principalId' in authorizer:
                customer_id = authorizer['principalId']
        else:
            print("No requestContext.authorizer found in event")
        
        if not customer_id:
            print(f"Debug - Unable to extract customer_id from event")
            print(f"Debug - Full event: {json.dumps(event, default=str)}")
            return {
                'statusCode': 401,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS'
                },
                'body': json.dumps({
                    'success': False,
                    'error': 'Unable to identify customer'
                })
            }

        print(f"Fetching messages for customer: {customer_id}")
        
        messages_table = dynamodb.Table(MESSAGES_TABLE)
        
        # Get all messages related to this customer (both concerns they submitted and responses they received)
        response = messages_table.scan(
            FilterExpression='userId = :uid',
            ExpressionAttributeValues={':uid': customer_id}
        )

        messages = response.get('Items', [])
        
        # Sort messages by timestamp, newest first
        messages.sort(key=lambda x: x.get('timestamp', 0), reverse=True)
        
        print(f"Found {len(messages)} messages for customer {customer_id}")
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'GET, OPTIONS'
            },
            'body': json.dumps({
                'success': True,
                'messages': messages,
                'totalCount': len(messages)
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
                'error': 'Failed to fetch messages'
            })
        }
