import json
import boto3
import os
from decimal import Decimal

# AWS clients
dynamodb = boto3.resource('dynamodb')

# Environment variables
BIKES_TABLE = os.environ['BIKES_TABLE_NAME']

# Initialize DynamoDB table
bikes_table = dynamodb.Table(BIKES_TABLE)

def get_cors_headers():
    """Return CORS headers for API responses"""
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,OPTIONS'
    }

def decimal_default(obj):
    """JSON serializer for objects not serializable by default json code"""
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

def lambda_handler(event, context):
    """
    Public endpoint for bike availability display
    Shows available bikes without requiring authentication
    Supports filtering by bike type and location
    """
    print(f"Event: {json.dumps(event, indent=2)}")
    
    # Handle CORS preflight
    if event['httpMethod'] == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': ''
        }
    
    try:
        # Get query parameters
        query_params = event.get('queryStringParameters') or {}
        bike_type = query_params.get('bikeType')
        location = query_params.get('location')
        
        # Get all bikes from the table
        response = bikes_table.scan()
        
        bikes = response.get('Items', [])
        
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': True,
                'bikes': bikes,
                'totalBikes': len(bikes),
                'lastUpdated': bikes[0]['updatedAt'] if bikes else None
            }, default=decimal_default)
        }
        
    except Exception as e:
        print(f"Error getting bike availability: {str(e)}")
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': False,
                'message': f'Error retrieving bike availability: {str(e)}'
            })
        }
