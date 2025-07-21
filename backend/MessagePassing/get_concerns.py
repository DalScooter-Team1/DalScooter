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
        print(f"Complete event object: {json.dumps(event, indent=2, default=str)}")
        
        # Get franchise ID from Cognito token via custom authorizer context
        # Try multiple possible locations for user ID
        franchise_id = None
        if 'requestContext' in event and 'authorizer' in event['requestContext']:
            authorizer = event['requestContext']['authorizer']
            print(f"Authorizer context: {json.dumps(authorizer, indent=2, default=str)}")
            # Try context first (for custom authorizer)
            if 'userId' in authorizer:
                franchise_id = authorizer['userId']
            # Try claims (for direct Cognito JWT)
            elif 'claims' in authorizer and 'sub' in authorizer['claims']:
                franchise_id = authorizer['claims']['sub']
            # Try principalId as fallback
            elif 'principalId' in authorizer:
                franchise_id = authorizer['principalId']
        else:
            print("No requestContext.authorizer found in event")
        
        if not franchise_id:
            print(f"Debug - Unable to extract franchise_id from event")
            print(f"Debug - Full event: {json.dumps(event, default=str)}")
            # TEMPORARY: Return all messages for debugging
            messages_table = dynamodb.Table(MESSAGES_TABLE)
            response = messages_table.scan()
            messages = response.get('Items', [])
            print(f"Found {len(messages)} total messages in table")
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS'
                },
                'body': json.dumps({
                    'success': True,
                    'messages': messages,
                    'totalCount': len(messages),
                    'debug': 'No franchise_id found - returning all messages'
                }, cls=DecimalEncoder)
            }

        messages_table = dynamodb.Table(MESSAGES_TABLE)
        
        # Scan for open concerns (those without franchiseId) and concerns assigned to this franchise
        response = messages_table.scan(
            FilterExpression='attribute_not_exists(franchiseId) OR franchiseId = :fid',
            ExpressionAttributeValues={':fid': franchise_id}
        )

        messages = response.get('Items', [])
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, OPTIONS'
            },
            'body': json.dumps({
                'success': True,
                'messages': messages,
                'totalCount': len(messages)
            }, cls=DecimalEncoder)
        }

    except Exception as e:
        print(f"Error fetching concerns: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, OPTIONS'
            },
            'body': json.dumps({'error': 'Failed to fetch concerns'})
        }