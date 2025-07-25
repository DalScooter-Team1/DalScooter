import json
import boto3
import os
import uuid
import secrets
from datetime import datetime, timedelta
from decimal import Decimal

# AWS clients
dynamodb = boto3.resource('dynamodb')
cognito = boto3.client('cognito-idp')

# Environment variables
BIKES_TABLE = os.environ['BIKES_TABLE_NAME']
DISCOUNT_CODES_TABLE = os.environ['DISCOUNT_CODES_TABLE_NAME']
USER_DISCOUNT_USAGE_TABLE = os.environ['USER_DISCOUNT_USAGE_TABLE_NAME']
COGNITO_USER_POOL_ID = os.environ['COGNITO_USER_POOL_ID']

# Initialize DynamoDB tables
bikes_table = dynamodb.Table(BIKES_TABLE)
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
        
        # For now, we'll assume the token is valid if it exists
        # In production, you'd decode and verify the JWT token
        return True, None
        
    except Exception as e:
        return False, f"Authentication error: {str(e)}"

def decimal_default(obj):
    """JSON serializer for objects not serializable by default json code"""
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

def lambda_handler(event, context):
    """
    Main handler for bike inventory management operations
    Supports: GET (list bikes), POST (add bike), PUT (update bike), DELETE (remove bike)
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
        # Verify franchise user permissions
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
            return handle_get_bikes(event)
        elif method == 'POST':
            return handle_add_bike(event)
        elif method == 'PUT':
            return handle_update_bike(event)
        elif method == 'DELETE':
            return handle_delete_bike(event)
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
        print(f"Error in bike inventory handler: {str(e)}")
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': False,
                'message': f'Internal server error: {str(e)}'
            })
        }

def handle_get_bikes(event):
    """Handle GET request to list bikes"""
    try:
        # Get query parameters
        query_params = event.get('queryStringParameters') or {}
        bike_type = query_params.get('bikeType')
        status = query_params.get('status')
        franchise_id = query_params.get('franchiseId')
        
        # Build query based on parameters
        if bike_type:
            response = bikes_table.query(
                IndexName='bikeType-index',
                KeyConditionExpression='bikeType = :bikeType',
                ExpressionAttributeValues={':bikeType': bike_type}
            )
        elif status:
            response = bikes_table.query(
                IndexName='status-index',
                KeyConditionExpression='#status = :status',
                ExpressionAttributeNames={'#status': 'status'},
                ExpressionAttributeValues={':status': status}
            )
        elif franchise_id:
            response = bikes_table.query(
                IndexName='franchiseId-index',
                KeyConditionExpression='franchiseId = :franchiseId',
                ExpressionAttributeValues={':franchiseId': franchise_id}
            )
        else:
            response = bikes_table.scan()
        
        bikes = response.get('Items', [])
        
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': True,
                'bikes': bikes,
                'count': len(bikes)
            }, default=decimal_default)
        }
        
    except Exception as e:
        print(f"Error getting bikes: {str(e)}")
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': False,
                'message': f'Error retrieving bikes: {str(e)}'
            })
        }

def handle_add_bike(event):
    """Handle POST request to add a new bike"""
    try:
        body = json.loads(event['body'])
        
        # Validate required fields
        required_fields = ['bikeType', 'accessCode', 'hourlyRate']
        for field in required_fields:
            if not body.get(field):
                return {
                    'statusCode': 400,
                    'headers': get_cors_headers(),
                    'body': json.dumps({
                        'success': False,
                        'message': f'Missing required field: {field}'
                    })
                }
        
        # Validate bike type
        valid_bike_types = ['Gyroscooter', 'eBikes', 'Segway']
        if body['bikeType'] not in valid_bike_types:
            return {
                'statusCode': 400,
                'headers': get_cors_headers(),
                'body': json.dumps({
                    'success': False,
                    'message': f'Invalid bike type. Must be one of: {", ".join(valid_bike_types)}'
                })
            }
        
        # Generate unique bike ID
        bike_id = f"{body['bikeType'][:3].upper()}-{str(uuid.uuid4())[:8].upper()}"
        
        # Create bike item
        bike_item = {
            'bikeId': bike_id,
            'bikeType': body['bikeType'],
            'accessCode': body['accessCode'],
            'hourlyRate': Decimal(str(body['hourlyRate'])),
            'status': 'available',
            'franchiseId': body.get('franchiseId', 'default'),
            'features': {
                'heightAdjustment': body.get('heightAdjustment', False),
                'batteryLife': body.get('batteryLife', 100),
                'maxSpeed': body.get('maxSpeed', 25),
                'weight': body.get('weight', 15)
            },
            'location': {
                'latitude': body.get('latitude', 44.6360),  # Default to Halifax
                'longitude': body.get('longitude', -63.5909),
                'address': body.get('address', 'Dalhousie University, Halifax, NS')
            },
            'createdAt': datetime.utcnow().isoformat(),
            'updatedAt': datetime.utcnow().isoformat(),
            'isActive': True
        }
        
        # Save to DynamoDB
        bikes_table.put_item(Item=bike_item)
        
        return {
            'statusCode': 201,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': True,
                'message': 'Bike added successfully',
                'bike': bike_item
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
        print(f"Error adding bike: {str(e)}")
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': False,
                'message': f'Error adding bike: {str(e)}'
            })
        }

def handle_update_bike(event):
    """Handle PUT request to update bike information"""
    try:
        # Get bike ID from path parameters
        path_params = event.get('pathParameters') or {}
        bike_id = path_params.get('bikeId')
        
        if not bike_id:
            return {
                'statusCode': 400,
                'headers': get_cors_headers(),
                'body': json.dumps({
                    'success': False,
                    'message': 'Missing bike ID in path'
                })
            }
        
        body = json.loads(event['body'])
        
        # Build update expression
        update_expression = "SET updatedAt = :updatedAt"
        expression_values = {':updatedAt': datetime.utcnow().isoformat()}
        
        # Add updateable fields
        updateable_fields = ['accessCode', 'hourlyRate', 'status', 'features', 'location']
        for field in updateable_fields:
            if field in body:
                if field == 'hourlyRate':
                    update_expression += f", {field} = :{field}"
                    expression_values[f':{field}'] = Decimal(str(body[field]))
                else:
                    update_expression += f", {field} = :{field}"
                    expression_values[f':{field}'] = body[field]
        
        # Update the bike
        response = bikes_table.update_item(
            Key={'bikeId': bike_id},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_values,
            ReturnValues='ALL_NEW'
        )
        
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': True,
                'message': 'Bike updated successfully',
                'bike': response['Attributes']
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
        print(f"Error updating bike: {str(e)}")
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': False,
                'message': f'Error updating bike: {str(e)}'
            })
        }

def handle_delete_bike(event):
    """Handle DELETE request to remove a bike"""
    try:
        # Get bike ID from path parameters
        path_params = event.get('pathParameters') or {}
        bike_id = path_params.get('bikeId')
        
        if not bike_id:
            return {
                'statusCode': 400,
                'headers': get_cors_headers(),
                'body': json.dumps({
                    'success': False,
                    'message': 'Missing bike ID in path'
                })
            }
        
        # Check if bike exists before deleting
        response = bikes_table.get_item(Key={'bikeId': bike_id})
        if 'Item' not in response:
            return {
                'statusCode': 404,
                'headers': get_cors_headers(),
                'body': json.dumps({
                    'success': False,
                    'message': 'Bike not found'
                })
            }
        
        # Soft delete by setting isActive to False
        bikes_table.update_item(
            Key={'bikeId': bike_id},
            UpdateExpression='SET isActive = :isActive, updatedAt = :updatedAt',
            ExpressionAttributeValues={
                ':isActive': False,
                ':updatedAt': datetime.utcnow().isoformat()
            }
        )
        
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': True,
                'message': 'Bike deleted successfully'
            })
        }
        
    except Exception as e:
        print(f"Error deleting bike: {str(e)}")
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': False,
                'message': f'Error deleting bike: {str(e)}'
            })
        }
