import json
import boto3
import os
from typing import Dict, List, Any

# Initialize Cognito client
cognito = boto3.client('cognito-idp')

def lambda_handler(event, context):
    """
    Lambda function to get list of customers from Cognito User Pool
    Only accessible by admin users
    """
    try:
        # Get environment variables
        user_pool_id = os.environ.get('COGNITO_USER_POOL_ID')
        
        if not user_pool_id:
            return {
                'statusCode': 500,
                'headers': get_cors_headers(),
                'body': json.dumps({
                    'success': False,
                    'message': 'Configuration error: User Pool ID not found'
                })
            }

        # Get query parameters for pagination
        query_params = event.get('queryStringParameters') or {}
        limit = int(query_params.get('limit', 60))  # Default limit of 60 users
        pagination_token = query_params.get('paginationToken')
        
        # Get filter parameters
        group_filter = query_params.get('group', 'customers')  # Default to customers group
        
        # Build the request parameters
        list_users_params = {
            'UserPoolId': user_pool_id,
            'Limit': min(limit, 60)  # AWS maximum is 60
        }
        
        if pagination_token:
            list_users_params['PaginationToken'] = pagination_token
            
        # Get users from Cognito
        response = cognito.list_users(**list_users_params)
        
        # Filter users and format response
        filtered_users = []
        
        for user in response.get('Users', []):
            user_data = format_user_data(user)
            
            # If group filter is specified, check user groups
            if group_filter:
                user_groups = get_user_groups(user_pool_id, user['Username'])
                user_data['groups'] = user_groups
                
                # Filter by group if specified
                if group_filter.lower() != 'all' and group_filter not in user_groups:
                    continue
            
            filtered_users.append(user_data)
        
        # Prepare response
        response_data = {
            'success': True,
            'users': filtered_users,
            'totalCount': len(filtered_users),
            'limit': limit
        }
        
        # Add pagination token if more results available
        if 'PaginationToken' in response:
            response_data['nextPaginationToken'] = response['PaginationToken']
            
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps(response_data)
        }
        
    except cognito.exceptions.TooManyRequestsException:
        return {
            'statusCode': 429,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': False,
                'message': 'Too many requests. Please try again later.'
            })
        }
    except cognito.exceptions.InternalErrorException:
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': False,
                'message': 'Internal server error. Please try again later.'
            })
        }
    except Exception as e:
        print(f"Error retrieving users: {str(e)}")
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': False,
                'message': 'Failed to retrieve users'
            })
        }

def format_user_data(user: Dict[str, Any]) -> Dict[str, Any]:
    """
    Format user data from Cognito response into a clean structure
    """
    # Extract user attributes
    attributes = {}
    for attr in user.get('Attributes', []):
        attributes[attr['Name']] = attr['Value']
    
    # Build formatted user data
    user_data = {
        'userId': attributes.get('sub', ''),
        'username': user.get('Username', ''),
        'email': attributes.get('email', ''),
        'firstName': attributes.get('given_name', ''),
        'lastName': attributes.get('family_name', ''),
        'userStatus': user.get('UserStatus', ''),
        'enabled': user.get('Enabled', True),
        'userCreateDate': user.get('UserCreateDate').isoformat() if user.get('UserCreateDate') else None,
        'userLastModifiedDate': user.get('UserLastModifiedDate').isoformat() if user.get('UserLastModifiedDate') else None,
        'emailVerified': attributes.get('email_verified', 'false') == 'true'
    }
    
    return user_data

def get_user_groups(user_pool_id: str, username: str) -> List[str]:
    """
    Get the groups that a user belongs to
    """
    try:
        response = cognito.admin_list_groups_for_user(
            UserPoolId=user_pool_id,
            Username=username
        )
        return [group['GroupName'] for group in response.get('Groups', [])]
    except Exception as e:
        print(f"Error getting user groups for {username}: {str(e)}")
        return []

def get_cors_headers():
    """
    Return CORS headers for API responses
    """
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,OPTIONS'
    }
