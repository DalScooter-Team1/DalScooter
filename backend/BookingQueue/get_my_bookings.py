import json
import boto3
import os
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
BOOKING_TABLE = os.environ['BOOKING_TABLE_NAME']

def decimal_default(obj):
    """JSON serializer for objects not serializable by default json code"""
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

def get_cors_headers():
    """Return CORS headers for API responses"""
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
        'Content-Type': 'application/json'
    }

def lambda_handler(event, context):
    # Handle CORS preflight
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps({'message': 'CORS preflight successful'}, default=decimal_default)
        }
    
    try:
        # Extract userId from request parameters
        user_id = None
        
        # Check path parameters first
        if event.get('pathParameters') and event['pathParameters'].get('userId'):
            user_id = event['pathParameters']['userId']
        # Check query string parameters
        elif event.get('queryStringParameters') and event['queryStringParameters'].get('userId'):
            user_id = event['queryStringParameters']['userId']
        # Check request context for sub (from JWT token)
        elif event.get('requestContext') and event['requestContext'].get('authorizer') and event['requestContext']['authorizer'].get('claims') and event['requestContext']['authorizer']['claims'].get('sub'):
            user_id = event['requestContext']['authorizer']['claims']['sub']
        
        if not user_id:
            return {
                'statusCode': 400,
                'headers': get_cors_headers(),
                'body': json.dumps({'error': 'userId parameter is required'}, default=decimal_default)
            }

        # Initialize DynamoDB table
        table = dynamodb.Table(BOOKING_TABLE)
        
        # Scan the table to find bookings for the specific user
        response = table.scan(
            FilterExpression=boto3.dynamodb.conditions.Attr('userId').eq(user_id)
        )
        
        bookings = response.get('Items', [])
        
        # Handle pagination if needed
        while 'LastEvaluatedKey' in response:
            response = table.scan(
                FilterExpression=boto3.dynamodb.conditions.Attr('userId').eq(user_id),
                ExclusiveStartKey=response['LastEvaluatedKey']
            )
            bookings.extend(response.get('Items', []))
        
        # Sort bookings by startTime (most recent first)
        bookings.sort(key=lambda x: x.get('startTime', ''), reverse=True)
        
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': True,
                'bookings': bookings,
                'count': len(bookings)
            }, default=decimal_default)
        }
        
    except Exception as e:
        print(f"Error fetching bookings: {str(e)}")
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': False,
                'error': 'Failed to fetch bookings'
            }, default=decimal_default)
        }
