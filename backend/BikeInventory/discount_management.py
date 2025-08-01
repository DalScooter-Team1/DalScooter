import json
import boto3
import os
import uuid
import secrets
import string
import base64
from datetime import datetime, timedelta
from decimal import Decimal

# AWS clients
dynamodb = boto3.resource('dynamodb')

# Environment variables
DISCOUNT_CODES_TABLE = os.environ['DISCOUNT_CODES_TABLE_NAME']
USER_DISCOUNT_USAGE_TABLE = os.environ['USER_DISCOUNT_USAGE_TABLE_NAME']

# Initialize DynamoDB tables
discount_codes_table = dynamodb.Table(DISCOUNT_CODES_TABLE)
user_discount_usage_table = dynamodb.Table(USER_DISCOUNT_USAGE_TABLE)

def get_cors_headers():
    """Return CORS headers for API responses"""
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    }

def verify_franchise_user(event):
    """Verify that the user is in the franchise group"""
    try:
        auth_header = event.get('headers', {}).get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return False, "Missing or invalid authorization header"
        
        token = auth_header.split(' ')[1]
        
        # Decode JWT payload (simple version - for production, use proper JWT verification)
        try:
            # Split the token into parts
            parts = token.split('.')
            if len(parts) != 3:
                return False, "Invalid JWT token format"
                
            # Decode the payload (second part)
            payload = parts[1]
            # Add padding if needed
            padding = len(payload) % 4
            if padding:
                payload += '=' * (4 - padding)
                
            # Decode from base64
            decoded_bytes = base64.urlsafe_b64decode(payload)
            payload_json = json.loads(decoded_bytes.decode('utf-8'))
            
        except Exception as e:
            return False, f"Error decoding JWT token: {str(e)}"
        
        # Check for the 'cognito:groups' claim which contains user groups
        cognito_groups = payload_json.get('cognito:groups', [])
        
        # Verify admin role (franchise group)
        if 'franchise' not in cognito_groups:
            return False, f"User is not in the franchise group. Available groups: {cognito_groups}"
            
        return True, None
        
    except Exception as e:
        return False, f"Authentication error: {str(e)}"

def decimal_default(obj):
    """JSON serializer for objects not serializable by default json code"""
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

def generate_discount_code(length=8):
    """Generate a random discount code"""
    characters = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))

def lambda_handler(event, context):
    """
    Main handler for discount code management operations
    Supports: GET (list codes), POST (create code), PUT (update code), DELETE (deactivate code)
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
        # Verify franchise user authentication for admin operations
        is_authorized, auth_error = verify_franchise_user(event)
        if not is_authorized:
            return {
                'statusCode': 401,
                'headers': get_cors_headers(),
                'body': json.dumps({
                    'success': False,
                    'message': auth_error or 'Unauthorized'
                })
            }
        
        method = event['httpMethod']
        
        if method == 'GET':
            return handle_get_discount_codes(event)
        elif method == 'POST':
            return handle_create_discount_code(event)
        elif method == 'PUT':
            return handle_update_discount_code(event)
        elif method == 'DELETE':
            return handle_delete_discount_code(event)
        else:
            return {
                'statusCode': 405,
                'headers': get_cors_headers(),
                'body': json.dumps({
                    'success': False,
                    'message': 'Method not allowed'
                })
            }
            
    except Exception as e:
        print(f"Error in discount code handler: {str(e)}")
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': False,
                'message': f'Internal server error: {str(e)}'
            })
        }

def handle_get_discount_codes(event):
    """Handle GET request to list discount codes"""
    try:
        # Get query parameters
        query_params = event.get('queryStringParameters') or {}
        status = query_params.get('status', 'active')
        
        if status:
            response = discount_codes_table.query(
                IndexName='status-index',
                KeyConditionExpression='#status = :status',
                ExpressionAttributeNames={'#status': 'status'},
                ExpressionAttributeValues={':status': status}
            )
        else:
            response = discount_codes_table.scan()
        
        codes = response.get('Items', [])
        
        # Filter out expired codes
        current_time = datetime.utcnow()
        active_codes = []
        
        for code in codes:
            expiry_date = datetime.fromisoformat(code['expiry_date'])
            if expiry_date > current_time:
                active_codes.append(code)
            elif code['status'] == 'active':
                # Automatically deactivate expired codes
                discount_codes_table.update_item(
                    Key={'codeId': code['codeId']},
                    UpdateExpression='SET #status = :status',
                    ExpressionAttributeNames={'#status': 'status'},
                    ExpressionAttributeValues={':status': 'expired'}
                )
        
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': True,
                'discount_codes': active_codes,  # Changed from 'discountCodes' to 'discount_codes'
                'count': len(active_codes)
            }, default=decimal_default)
        }
        
    except Exception as e:
        print(f"Error getting discount codes: {str(e)}")
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': False,
                'message': f'Error retrieving discount codes: {str(e)}'
            })
        }

def handle_create_discount_code(event):
    """Handle POST request to create a new discount code"""
    try:
        body = json.loads(event['body'])
        
        # Validate required fields
        required_fields = ['discountPercentage', 'expiryHours']
        for field in required_fields:
            if field not in body:
                return {
                    'statusCode': 400,
                    'headers': get_cors_headers(),
                    'body': json.dumps({
                        'success': False,
                        'message': f'Missing required field: {field}'
                    })
                }
        
        # Validate discount percentage (5% to 15%)
        discount_percentage = body['discountPercentage']
        if not (5 <= discount_percentage <= 15):
            return {
                'statusCode': 400,
                'headers': get_cors_headers(),
                'body': json.dumps({
                    'success': False,
                    'message': 'Discount percentage must be between 5% and 15%'
                })
            }
        
        # Validate expiry hours (0-48 hours, 0-2 days)
        expiry_hours = body['expiryHours']
        if not (0 <= expiry_hours <= 48):
            return {
                'statusCode': 400,
                'headers': get_cors_headers(),
                'body': json.dumps({
                    'success': False,
                    'message': 'Expiry time must be between 0 and 48 hours (0-2 days)'
                })
            }
        
        # Generate unique code and ID
        code_id = str(uuid.uuid4())
        discount_code = generate_discount_code()
        
        # Calculate expiry date
        expiry_date = datetime.utcnow() + timedelta(hours=expiry_hours)
        expiry_timestamp = int(expiry_date.timestamp())
        
        # Create discount code item
        code_item = {
            'codeId': code_id,
            'code': discount_code,
            'discount_percentage': Decimal(str(discount_percentage)),  # Changed from discountPercentage
            'status': 'active',
            'expiry_date': expiry_date.isoformat(),  # Changed from expiryDate
            'expiryTimestamp': expiry_timestamp,  # For TTL
            'usageLimit': body.get('usageLimit', 100),  # Default limit
            'usageCount': 0,
            'description': body.get('description', f'{discount_percentage}% off DalScooter rental'),
            'created_at': datetime.utcnow().isoformat(),  # Changed from createdAt
            'createdBy': body.get('createdBy', 'franchise-operator'),
            'is_active': True,  # Changed from isActive
            'franchise_id': body.get('franchiseId', 'default'),  # Added franchise_id
            'updated_at': datetime.utcnow().isoformat()  # Added updated_at
        }
        
        # Check if code already exists
        existing_code = discount_codes_table.query(
            IndexName='code-index',
            KeyConditionExpression='code = :code',
            ExpressionAttributeValues={':code': discount_code}
        )
        
        if existing_code['Items']:
            # Generate a new code if conflict
            discount_code = generate_discount_code()
            code_item['code'] = discount_code
        
        # Save to DynamoDB
        discount_codes_table.put_item(Item=code_item)
        
        return {
            'statusCode': 201,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': True,
                'message': 'Discount code created successfully',
                'discountCode': code_item
            }, default=decimal_default)
        }
        
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': False,
                'message': 'Invalid JSON in request body'
            })
        }
    except Exception as e:
        print(f"Error creating discount code: {str(e)}")
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': False,
                'message': f'Error creating discount code: {str(e)}'
            })
        }

def handle_update_discount_code(event):
    """Handle PUT request to update discount code"""
    try:
        # Get code ID from path parameters
        path_params = event.get('pathParameters') or {}
        code_id = path_params.get('codeId')
        
        if not code_id:
            return {
                'statusCode': 400,
                'headers': get_cors_headers(),
                'body': json.dumps({
                    'success': False,
                    'message': 'Missing code ID in path'
                })
            }
        
        body = json.loads(event['body'])
        
        # Check if discount code exists
        existing_response = discount_codes_table.get_item(Key={'codeId': code_id})
        if 'Item' not in existing_response:
            return {
                'statusCode': 404,
                'headers': get_cors_headers(),
                'body': json.dumps({
                    'success': False,
                    'message': 'Discount code not found'
                })
            }
        
        existing_discount = existing_response['Item']
        
        # Build update expression
        update_expression = "SET updatedAt = :updatedAt"
        expression_values = {':updatedAt': datetime.utcnow().isoformat()}
        
        # Handle discountPercentage update
        if 'discountPercentage' in body:
            discount_percentage = body['discountPercentage']
            # Validate discount percentage (5-15%)
            if not isinstance(discount_percentage, (int, float)) or discount_percentage < 5 or discount_percentage > 15:
                return {
                    'statusCode': 400,
                    'headers': get_cors_headers(),
                    'body': json.dumps({
                        'success': False,
                        'message': 'Discount percentage must be between 5% and 15%'
                    })
                }
            update_expression += ", discount_percentage = :discount_percentage"
            expression_values[':discount_percentage'] = Decimal(str(discount_percentage))
        
        # Handle expiryHours update
        if 'expiryHours' in body:
            expiry_hours = body['expiryHours']
            # Validate expiry hours (0-48)
            if not isinstance(expiry_hours, (int, float)) or expiry_hours < 0 or expiry_hours > 48:
                return {
                    'statusCode': 400,
                    'headers': get_cors_headers(),
                    'body': json.dumps({
                        'success': False,
                        'message': 'Expiry time must be between 0 and 48 hours (0-2 days)'
                    })
                }
            
            # Calculate new expiry date from current time
            new_expiry_date = datetime.utcnow() + timedelta(hours=expiry_hours)
            update_expression += ", expiry_date = :expiry_date"
            expression_values[':expiry_date'] = new_expiry_date.isoformat()
        
        # Handle isActive update (convert to status)
        if 'isActive' in body:
            is_active = body['isActive']
            status = 'active' if is_active else 'deactivated'
            update_expression += ", #status = :status"
            expression_values[':status'] = status
            
        # Handle other fields that might be sent
        other_updateable_fields = ['description', 'usageLimit']
        for field in other_updateable_fields:
            if field in body:
                update_expression += f", {field} = :{field}"
                expression_values[f':{field}'] = body[field]
        
        # Use ExpressionAttributeNames for reserved keywords
        expression_attribute_names = {}
        if '#status' in update_expression:
            expression_attribute_names['#status'] = 'status'
        
        # Update the discount code
        update_params = {
            'Key': {'codeId': code_id},
            'UpdateExpression': update_expression,
            'ExpressionAttributeValues': expression_values,
            'ReturnValues': 'ALL_NEW'
        }
        
        if expression_attribute_names:
            update_params['ExpressionAttributeNames'] = expression_attribute_names
        
        response = discount_codes_table.update_item(**update_params)
        
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': True,
                'message': 'Discount code updated successfully',
                'discountCode': response['Attributes']
            }, default=decimal_default)
        }
        
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': False,
                'message': 'Invalid JSON in request body'
            })
        }
    except Exception as e:
        print(f"Error updating discount code: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': False,
                'message': f'Error updating discount code: {str(e)}'
            })
        }

def handle_delete_discount_code(event):
    """Handle DELETE request to deactivate a discount code"""
    try:
        # Get code ID from path parameters
        path_params = event.get('pathParameters') or {}
        code_id = path_params.get('codeId')
        
        if not code_id:
            return {
                'statusCode': 400,
                'headers': get_cors_headers(),
                'body': json.dumps({
                    'success': False,
                    'message': 'Missing code ID in path'
                })
            }
        
        # Check if code exists before deactivating
        response = discount_codes_table.get_item(Key={'codeId': code_id})
        if 'Item' not in response:
            return {
                'statusCode': 404,
                'headers': get_cors_headers(),
                'body': json.dumps({
                    'success': False,
                    'message': 'Discount code not found'
                })
            }
        
        # Check if already deactivated
        existing_discount = response['Item']
        if existing_discount.get('status') == 'deactivated':
            return {
                'statusCode': 200,
                'headers': get_cors_headers(),
                'body': json.dumps({
                    'success': True,
                    'message': 'Discount code is already deactivated'
                })
            }
        
        # Deactivate the discount code
        discount_codes_table.update_item(
            Key={'codeId': code_id},
            UpdateExpression='SET #status = :status, updatedAt = :updatedAt',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':status': 'deactivated',
                ':updatedAt': datetime.utcnow().isoformat()
            }
        )
        
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': True,
                'message': 'Discount code deactivated successfully'
            })
        }
        
    except Exception as e:
        print(f"Error deactivating discount code: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': False,
                'message': f'Error deactivating discount code: {str(e)}'
            })
        }
