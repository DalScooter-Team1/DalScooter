import json
import boto3
import os
import datetime
import time
import base64

# save the data in the DynamoDB table
# DynamoDB setup
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['DYNAMODB_TABLE'])

def decode_jwt_payload(token):
    """Simple JWT payload decoder without signature verification"""
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

# I am only decoding without verifying - As this request is meant to pass authorizer
# We assume that the token is valid. We only need the information inside the token.
def lambda_handler(event, context):
    try:
        # Step 1: Extract token
        auth_header = event['headers'].get('Authorization') or event['headers'].get('authorization')
        if not auth_header or not auth_header.startswith("Bearer "):
            return _response(401, {'error': 'Missing or invalid Authorization header'})

        token = auth_header.split(" ")[1]

        # Step 2: Decode token.
        decoded = decode_jwt_payload(token)
        if not decoded:
            return _response(401, {'error': 'Invalid JWT token'})

        sub =  decoded.get("sub")  # fallback to user ID if email missing
        if not sub:
            return _response(400, {'error': 'Cognito Sub or user identifier not found in token'})

        # Step 3: Prepare item
        now_iso = datetime.datetime.utcnow().isoformat()
        ttl_seconds = 1 * 60  # expires in 1 minutes
        ttl_unix = int(time.time()) + ttl_seconds

        item = {
            'sub': sub,
            'last_seen': now_iso,
            'expires_at': ttl_unix  # used for DynamoDB TTL
        }

        # Step 4: Save to DynamoDB
        table.put_item(Item=item)

        return _response(200, {'message': 'Heartbeat recorded', 'email': email, 'last_seen': now_iso})

    except Exception as e:
        print("Error:", e)
        return _response(500, {'error': 'Internal server error'})


def _response(status, body):
    return {
        'statusCode': status,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',  # Optional: CORS
        },
        'body': json.dumps(body)
    }
