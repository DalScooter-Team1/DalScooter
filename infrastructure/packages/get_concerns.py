import json
import boto3
import os

dynamodb = boto3.resource('dynamodb')

MESSAGES_TABLE = os.environ['MESSAGES_TABLE_NAME']

def lambda_handler(event, context):
    try:
        # Get franchise ID from Cognito token via custom authorizer context
        # Try multiple possible locations for user ID
        franchise_id = None
        if 'requestContext' in event and 'authorizer' in event['requestContext']:
            authorizer = event['requestContext']['authorizer']
            # Try context first (for custom authorizer)
            if 'userId' in authorizer:
                franchise_id = authorizer['userId']
            # Try claims (for direct Cognito JWT)
            elif 'claims' in authorizer and 'sub' in authorizer['claims']:
                franchise_id = authorizer['claims']['sub']
            # Try principalId as fallback
            elif 'principalId' in authorizer:
                franchise_id = authorizer['principalId']
        
        if not franchise_id:
            print(f"Debug - event: {json.dumps(event)}")
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Unable to identify user'})
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
                'messages': messages,
                'count': len(messages)
            })
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