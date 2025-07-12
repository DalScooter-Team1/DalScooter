import json
import time
import os
import base64
import urllib.request
from urllib.parse import urlparse

# Cognito settings
USER_POOL_ID = os.environ.get('COGNITO_USER_POOL_ID')
APP_CLIENT_ID = os.environ.get('COGNITO_CLIENT_ID')
REGION = os.environ.get('REGION', 'us-east-1')

def generate_policy(principal_id, effect, resource, context=None):
    """Generate IAM policy document for API Gateway authorizer results"""
    policy = {
        'principalId': principal_id,
        'policyDocument': {
            'Version': '2012-10-17',
            'Statement': [
                {
                    'Action': 'execute-api:Invoke',
                    'Effect': effect,
                    'Resource': resource
                }
            ]
        }
    }
    
    # Add context info if provided (can pass user info to API)
    if context:
        policy['context'] = context
        
    return policy

def decode_jwt_payload(token):
    """Simple JWT payload decoder without signature verification (for demo purposes)"""
    try:
        # Split the token into parts
        parts = token.split('.')
        if len(parts) != 3:
            return None
            
        # Decode the payload (second part)
        payload = parts[1]
        # Add padding if needed
        padding = len(payload) % 4
        if padding:
            payload += '=' * (4 - padding)
            
        # Decode from base64
        decoded_bytes = base64.urlsafe_b64decode(payload)
        payload_json = json.loads(decoded_bytes.decode('utf-8'))
        
        return payload_json
    except Exception as e:
        print(f"Error decoding JWT payload: {str(e)}")
        return None

def lambda_handler(event, context):
    """Lambda function for API Gateway authorizer - Franchise/Admin access"""
    try:
        # Extract token from the Authorization header
        auth_header = event.get('authorizationToken', '')
        if not auth_header.startswith('Bearer '):
            print("Authorization header must start with Bearer")
            return generate_policy('user', 'Deny', event['methodArn'])
        
        token = auth_header.split(' ')[1]
        
        # Decode JWT payload (simple version for demo)
        claims = decode_jwt_payload(token)
        if not claims:
            print("Failed to decode JWT token")
            return generate_policy('user', 'Deny', event['methodArn'])
        
        # Basic token validation
        # Verify token is not expired
        if 'exp' in claims and claims['exp'] < time.time():
            print("Token is expired")
            return generate_policy('user', 'Deny', event['methodArn'])
            
        # Verify audience (client ID)
        if 'client_id' in claims and claims['client_id'] != APP_CLIENT_ID:
            if 'aud' in claims and claims['aud'] != APP_CLIENT_ID:
                print("Token was not issued for this audience")
                return generate_policy('user', 'Deny', event['methodArn'])
        
        # Check for the 'cognito:groups' claim which contains user groups
        cognito_groups = claims.get('cognito:groups', [])
        
        # Verify admin role (franchise group)
        if 'franchise' not in cognito_groups:
            print("User is not in the franchise group")
            return generate_policy(claims.get('sub', 'user'), 'Deny', event['methodArn'])
            
        # Admin role verified, allow access with context
        context_data = {
            'userId': claims.get('sub', ''),
            'email': claims.get('email', ''),
            'groups': ','.join(cognito_groups)
        }
        
        return generate_policy(claims.get('sub', 'user'), 'Allow', event['methodArn'], context_data)
        
    except Exception as e:
        print(f"Error validating token: {str(e)}")
        return generate_policy('user', 'Deny', event['methodArn'])
