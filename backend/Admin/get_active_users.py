import json
import boto3
import os
import time
from boto3.dynamodb.conditions import Attr
from decimal import Decimal

# DynamoDB setup
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['DYNAMODB_TABLE'])

def decimal_default(obj):
    """JSON serializer for objects not serializable by default json code"""
    if isinstance(obj, Decimal):
        return int(obj)
    raise TypeError

def lambda_handler(event, context):
    """
    Lambda function to get list of currently active (non-expired) users
    Only accessible by admin users
    """
    try:
        # Get current timestamp
        current_time = int(time.time())
        
        # Query DynamoDB table for non-expired entries
        # Using scan with filter expression to get all non-expired entries
        response = table.scan(
            FilterExpression=Attr('expires_at').gt(current_time)
        )
        
        # Process the results
        active_users = []
        for item in response.get('Items', []):
            user_data = {
                'email': item.get('email', ''),
                'last_seen': item.get('last_seen', ''),
                'expires_at': int(item.get('expires_at', 0))  # Convert Decimal to int
            }
            active_users.append(user_data)
        
        # Sort by last_seen timestamp (most recent first)
        active_users.sort(key=lambda x: x['last_seen'], reverse=True)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'GET,OPTIONS'
            },
            'body': json.dumps({
                'success': True,
                'activeUsers': active_users,
                'totalCount': len(active_users),
                'timestamp': current_time
            }, default=decimal_default)
        }
        
    except Exception as e:
        print(f"Error retrieving active users: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': False,
                'error': 'Failed to retrieve active users'
            })
        }
