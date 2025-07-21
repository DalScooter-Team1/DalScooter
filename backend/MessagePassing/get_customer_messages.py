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
        
        print(f"Debug - Final customer_id: {customer_id}")
        
        if not customer_id:
            print(f"Debug - Unable to extract customer_id from event")
            print(f"Debug - Full event: {json.dumps(event, default=str)}")
            return {
                'statusCode': 400,
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
