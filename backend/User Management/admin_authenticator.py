import json
import time
import os
import boto3
import jwt
from jwt.exceptions import InvalidTokenError
import urllib.request
from jose import jwk, jwt as jose_jwt
from jose.utils import base64url_decode

# Cognito settings
USER_POOL_ID = os.environ.get('COGNITO_USER_POOL_ID')
APP_CLIENT_ID = os.environ.get('COGNITO_CLIENT_ID')
REGION = os.environ.get('REGION', 'us-east-1')  # Changed from AWS_REGION to REGION

# Get the JSON Web Key Set (JWKS) for token validation
jwks_url = f'https://cognito-idp.{REGION}.amazonaws.com/{USER_POOL_ID}/.well-known/jwks.json'
with urllib.request.urlopen(jwks_url) as f:
    jwks = json.loads(f.read().decode('utf-8'))

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

def lambda_handler(event, context):
    """Lambda function for API Gateway authorizer"""
    try:
        # Extract token from the Authorization header
        auth_header = event.get('authorizationToken', '')
        if not auth_header.startswith('Bearer '):
            print("Authorization header must start with Bearer")
            return generate_policy('user', 'Deny', event['methodArn'])
        
        token = auth_header.split(' ')[1]
        
        # Parse and validate the token
        # Get the kid (Key ID) from the token header
        token_headers = jose_jwt.get_unverified_header(token)
        kid = token_headers['kid']
        
        # Find the matching key in the JWKS
        key = None
        for jwk_key in jwks['keys']:
            if jwk_key['kid'] == kid:
                key = jwk_key
                break
                
        if not key:
            print("Public key not found in JWKS")
            return generate_policy('user', 'Deny', event['methodArn'])
            
        # Verify the token signature
        public_key = jwk.construct(key)
        message = token.rsplit('.', 1)[0].encode('utf-8')  # header and payload
        signature = base64url_decode(token.split('.')[2].encode('utf-8'))
        
        if not public_key.verify(message, signature):
            print("Token signature verification failed")
            return generate_policy('user', 'Deny', event['methodArn'])
            
        # Decode and validate claims
        claims = jose_jwt.get_unverified_claims(token)
        
        # Verify token is not expired
        if 'exp' in claims and claims['exp'] < time.time():
            print("Token is expired")
            return generate_policy('user', 'Deny', event['methodArn'])
            
        # Verify audience (client ID)
        if claims['client_id'] != APP_CLIENT_ID and claims['aud'] != APP_CLIENT_ID:
            print("Token was not issued for this audience")
            return generate_policy('user', 'Deny', event['methodArn'])
            
        # Verify issuer
        issuer = f'https://cognito-idp.{REGION}.amazonaws.com/{USER_POOL_ID}'
        if claims['iss'] != issuer:
            print("Token issuer is invalid")
            return generate_policy('user', 'Deny', event['methodArn'])
            
        # Check for the 'cognito:groups' claim which contains user groups
        cognito_groups = claims.get('cognito:groups', [])
        
        # Verify admin role (franchise group)
        if 'franchise' not in cognito_groups:
            print("User is not in the franchise group")
            return generate_policy(claims.get('sub', 'user'), 'Deny', event['methodArn'])
            
        # Admin role verified, allow access with context
        context = {
            'userId': claims.get('sub', ''),
            'email': claims.get('email', ''),
            'groups': ','.join(cognito_groups)
        }
        
        return generate_policy(claims.get('sub', 'user'), 'Allow', event['methodArn'], context)
        
    except Exception as e:
        print(f"Error validating token: {str(e)}")
        return generate_policy('user', 'Deny', event['methodArn'])
