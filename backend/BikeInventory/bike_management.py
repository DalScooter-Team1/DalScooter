import json
import boto3
import os
import uuid
import secrets
import base64
import traceback
from datetime import datetime, timedelta
from decimal import Decimal
import logging

# Configure logging - disabled for debugging
# logger = logging.getLogger()
# logger.setLevel(logging.INFO)

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
        # Verify franchise user authentication for admin operations
        is_authorized, auth_error = verify_franchise_user(event)
        if not is_authorized:
            print(f"Authorization failed: {auth_error}")
            return {
                'statusCode': 401,
                'headers': get_cors_headers(),
                'body': json.dumps({
                    'success': False,
                    'message': auth_error or 'Unauthorized'
                })
            }
        
        method = event['httpMethod']
        print(f"Processing {method} request")
        
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
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
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
        
        # Build query based on parameters with active filter
        if bike_type:
            response = bikes_table.query(
                IndexName='bikeType-index',
                KeyConditionExpression='bikeType = :bikeType',
                FilterExpression='isActive = :isActive',
                ExpressionAttributeValues={
                    ':bikeType': bike_type,
                    ':isActive': True
                }
            )
        elif status:
            response = bikes_table.query(
                IndexName='status-index',
                KeyConditionExpression='#status = :status',
                FilterExpression='isActive = :isActive',
                ExpressionAttributeNames={'#status': 'status'},
                ExpressionAttributeValues={
                    ':status': status,
                    ':isActive': True
                }
            )
        elif franchise_id:
            response = bikes_table.query(
                IndexName='franchiseId-index',
                KeyConditionExpression='franchiseId = :franchiseId',
                FilterExpression='isActive = :isActive',
                ExpressionAttributeValues={
                    ':franchiseId': franchise_id,
                    ':isActive': True
                }
            )
        else:
            response = bikes_table.scan(
                FilterExpression='isActive = :isActive',
                ExpressionAttributeValues={':isActive': True}
            )
        
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
                'batteryLife': Decimal(str(body.get('batteryLife', 100))),
                'maxSpeed': Decimal(str(body.get('maxSpeed', 25))),
                'weight': Decimal(str(body.get('weight', 15)))
            },
            'location': {
                'latitude': Decimal(str(body.get('latitude', 44.6360))),  # Default to Halifax
                'longitude': Decimal(str(body.get('longitude', -63.5909))),
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
        
        print(f"Update request for bike ID: {bike_id}")
        
        if not bike_id:
            return {
                'statusCode': 400,
                'headers': get_cors_headers(),
                'body': json.dumps({
                    'success': False,
                    'message': 'Missing bike ID in path'
                })
            }

        # Parse and validate request body
        try:
            body = json.loads(event['body'])
            print(f"Update request body: {json.dumps(body, indent=2)}")
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {str(e)}")
            return {
                'statusCode': 400,
                'headers': get_cors_headers(),
                'body': json.dumps({
                    'success': False,
                    'message': f'Invalid JSON in request body: {str(e)}'
                })
            }
        
        # Check if bike exists and is active before updating
        try:
            existing_bike_response = bikes_table.get_item(Key={'bikeId': bike_id})
            print(f"DynamoDB get_item response: {existing_bike_response}")
        except Exception as e:
            print(f"Error fetching bike from DynamoDB: {str(e)}")
            return {
                'statusCode': 500,
                'headers': get_cors_headers(),
                'body': json.dumps({
                    'success': False,
                    'message': f'Database error: {str(e)}'
                })
            }
            
        if 'Item' not in existing_bike_response:
            return {
                'statusCode': 404,
                'headers': get_cors_headers(),
                'body': json.dumps({
                    'success': False,
                    'message': 'Bike not found'
                })
            }
            
        existing_bike = existing_bike_response['Item']
        if not existing_bike.get('isActive', True):
            return {
                'statusCode': 404,
                'headers': get_cors_headers(),
                'body': json.dumps({
                    'success': False,
                    'message': 'Bike not found or has been deleted'
                })
            }
        
        # Build update expression step by step
        update_parts = []
        expression_values = {}
        
        # Always update the timestamp
        update_parts.append("updatedAt = :updatedAt")
        expression_values[':updatedAt'] = datetime.utcnow().isoformat()
        
        # Process each field individually with validation
        if 'accessCode' in body:
            access_code = str(body['accessCode']).strip()
            if not access_code:
                return {
                    'statusCode': 400,
                    'headers': get_cors_headers(),
                    'body': json.dumps({
                        'success': False,
                        'message': 'Access code cannot be empty'
                    })
                }
            update_parts.append("accessCode = :accessCode")
            expression_values[':accessCode'] = access_code
            
        if 'hourlyRate' in body:
            try:
                rate = float(body['hourlyRate'])
                if rate <= 0:
                    return {
                        'statusCode': 400,
                        'headers': get_cors_headers(),
                        'body': json.dumps({
                            'success': False,
                            'message': 'Hourly rate must be greater than 0'
                        })
                    }
                update_parts.append("hourlyRate = :hourlyRate")
                expression_values[':hourlyRate'] = Decimal(str(rate))
            except (ValueError, TypeError) as e:
                return {
                    'statusCode': 400,
                    'headers': get_cors_headers(),
                    'body': json.dumps({
                        'success': False,
                        'message': f'Invalid hourly rate: {str(e)}'
                    })
                }
                
        if 'status' in body:
            valid_statuses = ['available', 'rented', 'maintenance', 'out_of_service']
            if body['status'] not in valid_statuses:
                return {
                    'statusCode': 400,
                    'headers': get_cors_headers(),
                    'body': json.dumps({
                        'success': False,
                        'message': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'
                    })
                }
            update_parts.append("#status = :status")
            expression_values[':status'] = body['status']
            
        if 'features' in body:
            try:
                features_data = body['features']
                if isinstance(features_data, dict):
                    features = {}
                    # Handle each feature field
                    if 'heightAdjustment' in features_data:
                        features['heightAdjustment'] = bool(features_data['heightAdjustment'])
                    if 'batteryLife' in features_data:
                        features['batteryLife'] = Decimal(str(features_data['batteryLife']))
                    if 'maxSpeed' in features_data:
                        features['maxSpeed'] = Decimal(str(features_data['maxSpeed']))
                    if 'weight' in features_data:
                        features['weight'] = Decimal(str(features_data['weight']))
                else:
                    features = features_data
                    
                update_parts.append("features = :features")
                expression_values[':features'] = features
            except (ValueError, TypeError) as e:
                return {
                    'statusCode': 400,
                    'headers': get_cors_headers(),
                    'body': json.dumps({
                        'success': False,
                        'message': f'Invalid features data: {str(e)}'
                    })
                }
                
        if 'location' in body:
            try:
                location_data = body['location']
                if isinstance(location_data, dict):
                    location = {}
                    
                    # Start with existing location data
                    existing_location = existing_bike.get('location', {})
                    if existing_location:
                        location.update(existing_location)
                    
                    # Update with new data
                    if 'address' in location_data:
                        location['address'] = str(location_data['address'])
                    if 'latitude' in location_data:
                        location['latitude'] = Decimal(str(location_data['latitude']))
                    if 'longitude' in location_data:
                        location['longitude'] = Decimal(str(location_data['longitude']))
                        
                    # Ensure we have required fields
                    if 'latitude' not in location:
                        location['latitude'] = Decimal('44.6360')  # Default Halifax latitude
                    if 'longitude' not in location:
                        location['longitude'] = Decimal('-63.5909')  # Default Halifax longitude
                    if 'address' not in location:
                        location['address'] = 'Dalhousie University, Halifax, NS'
                else:
                    location = location_data
                    
                update_parts.append("#location = :location")
                expression_values[':location'] = location
            except (ValueError, TypeError) as e:
                return {
                    'statusCode': 400,
                    'headers': get_cors_headers(),
                    'body': json.dumps({
                        'success': False,
                        'message': f'Invalid location data: {str(e)}'
                    })
                }
        
        # Validate that we have something to update besides timestamp
        if len(update_parts) == 1:  # Only updatedAt
            return {
                'statusCode': 400,
                'headers': get_cors_headers(),
                'body': json.dumps({
                    'success': False,
                    'message': 'No valid fields provided for update'
                })
            }
        
        # Build the final update expression
        update_expression = "SET " + ", ".join(update_parts)
        
        # Handle reserved keywords
        expression_attribute_names = {}
        if '#status' in update_expression:
            expression_attribute_names['#status'] = 'status'
        if '#location' in update_expression:
            expression_attribute_names['#location'] = 'location'
        
        print(f"Update expression: {update_expression}")
        print(f"Expression values: {json.dumps(expression_values, default=str)}")
        print(f"Expression attribute names: {expression_attribute_names}")
        
        # Update the bike in DynamoDB
        try:
            update_params = {
                'Key': {'bikeId': bike_id},
                'UpdateExpression': update_expression,
                'ExpressionAttributeValues': expression_values,
                'ReturnValues': 'ALL_NEW'
            }
            
            if expression_attribute_names:
                update_params['ExpressionAttributeNames'] = expression_attribute_names
                
            response = bikes_table.update_item(**update_params)
            print(f"DynamoDB update successful")
            
        except Exception as dynamo_error:
            print(f"DynamoDB error: {str(dynamo_error)}")
            print(f"DynamoDB error traceback: {traceback.format_exc()}")
            return {
                'statusCode': 500,
                'headers': get_cors_headers(),
                'body': json.dumps({
                    'success': False,
                    'message': f'Database update failed: {str(dynamo_error)}'
                })
            }
        
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': True,
                'message': 'Bike updated successfully',
                'bike': response['Attributes']
            }, default=decimal_default)
        }
        
    except Exception as e:
        print(f"Error updating bike: {str(e)}")
        print(f"Error traceback: {traceback.format_exc()}")
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
        
        print(f"Delete request for bike ID: {bike_id}")
        
        if not bike_id:
            return {
                'statusCode': 400,
                'headers': get_cors_headers(),
                'body': json.dumps({
                    'success': False,
                    'message': 'Missing bike ID in path'
                })
            }

        # Check if bike exists and is active before deleting
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
            
        bike = response['Item']
        print(f"Found bike: {json.dumps(bike, default=str)}")
        
        if not bike.get('isActive', True):
            return {
                'statusCode': 404,
                'headers': get_cors_headers(),
                'body': json.dumps({
                    'success': False,
                    'message': 'Bike not found or already deleted'
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
