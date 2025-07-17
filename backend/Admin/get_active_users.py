import json
import boto3
import os
import time
from boto3.dynamodb.conditions import Attr
from decimal import Decimal

# DynamoDB setup
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['DYNAMODB_TABLE'])

# Cognito setup
cognito = boto3.client('cognito-idp')

def decimal_default(obj):
    """JSON serializer for objects not serializable by default json code"""
    if isinstance(obj, Decimal):
        return int(obj)
    raise TypeError

def get_user_details(email):
    """Get user details from Cognito by email"""
    try:
        user_pool_id = os.environ.get('COGNITO_USER_POOL_ID')
        if not user_pool_id:
            return None
            
        response = cognito.admin_get_user(
            UserPoolId=user_pool_id,
            Username=email
        )
        
        # Extract user attributes
        attributes = {attr['Name']: attr['Value'] for attr in response.get('UserAttributes', [])}
        
        # Get user groups
        try:
            groups_response = cognito.admin_list_groups_for_user(
                UserPoolId=user_pool_id,
                Username=email
            )
            user_groups = [group['GroupName'] for group in groups_response.get('Groups', [])]
        except:
            user_groups = []
        
        return {
            'firstName': attributes.get('given_name', ''),
            'lastName': attributes.get('family_name', ''),
            'userType': 'franchise' if 'franchise' in user_groups else 'customer',
            'email': email,
            'userId': response.get('Username', email),
            'status': 'online'
        }
    except Exception as e:
        print(f"Error getting user details for {email}: {str(e)}")
        return {
            'firstName': email.split('@')[0],
            'lastName': '',
            'userType': 'customer',
            'email': email,
            'userId': email,
            'status': 'online'
        }

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
            email = item.get('email', '')
            last_seen = item.get('last_seen', '')
            expires_at = int(item.get('expires_at', 0))
            
            # Get user details from Cognito
            user_details = get_user_details(email)
            if user_details:
                user_details.update({
                    'last_seen': last_seen,
                    'lastSeen': last_seen,  # For frontend compatibility
                    'expires_at': expires_at
                })
                active_users.append(user_details)
        
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
                'users': active_users,  # Changed from activeUsers to users for consistency
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
