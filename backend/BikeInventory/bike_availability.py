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
    Shows available bikes and their tariffs without requiring authentication
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
        
        # Query available bikes
        if bike_type:
            response = bikes_table.query(
                IndexName='bikeType-index',
                KeyConditionExpression='bikeType = :bikeType',
                FilterExpression='#status = :status AND isActive = :isActive',
                ExpressionAttributeNames={'#status': 'status'},
                ExpressionAttributeValues={
                    ':bikeType': bike_type,
                    ':status': 'available',
                    ':isActive': True
                }
            )
        else:
            response = bikes_table.scan(
                FilterExpression='#status = :status AND isActive = :isActive',
                ExpressionAttributeNames={'#status': 'status'},
                ExpressionAttributeValues={
                    ':status': 'available',
                    ':isActive': True
                }
            )
        
        bikes = response.get('Items', [])
        
        # Group bikes by type for better display
        bike_types = {}
        for bike in bikes:
            bike_type_name = bike['bikeType']
            if bike_type_name not in bike_types:
                bike_types[bike_type_name] = {
                    'type': bike_type_name,
                    'count': 0,
                    'minRate': float('inf'),
                    'maxRate': 0,
                    'avgRate': 0,
                    'bikes': []
                }
            
            bike_types[bike_type_name]['count'] += 1
            bike_types[bike_type_name]['bikes'].append(bike)
            
            rate = float(bike['hourlyRate'])
            bike_types[bike_type_name]['minRate'] = min(bike_types[bike_type_name]['minRate'], rate)
            bike_types[bike_type_name]['maxRate'] = max(bike_types[bike_type_name]['maxRate'], rate)
        
        # Calculate average rates
        for bike_type_data in bike_types.values():
            if bike_type_data['count'] > 0:
                total_rate = sum(float(bike['hourlyRate']) for bike in bike_type_data['bikes'])
                bike_type_data['avgRate'] = round(total_rate / bike_type_data['count'], 2)
                if bike_type_data['minRate'] == float('inf'):
                    bike_type_data['minRate'] = 0
        
        # Prepare summary for each bike type (Gyroscooter, eBikes, Segway)
        standard_types = ['Gyroscooter', 'eBikes', 'Segway']
        bike_availability = []
        
        for bike_type_name in standard_types:
            if bike_type_name in bike_types:
                bike_data = bike_types[bike_type_name]
            else:
                bike_data = {
                    'type': bike_type_name,
                    'count': 0,
                    'minRate': 0,
                    'maxRate': 0,
                    'avgRate': 0,
                    'bikes': []
                }
            
            bike_availability.append({
                'bikeType': bike_type_name,
                'availableCount': bike_data['count'],
                'status': 'available' if bike_data['count'] > 0 else 'unavailable',
                'pricing': {
                    'minHourlyRate': bike_data['minRate'] if bike_data['minRate'] != float('inf') else 0,
                    'maxHourlyRate': bike_data['maxRate'],
                    'avgHourlyRate': bike_data['avgRate']
                },
                'features': get_bike_type_features(bike_type_name),
                'sampleBikes': bike_data['bikes'][:3] if bike_data['bikes'] else []  # Show up to 3 sample bikes
            })
        
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': True,
                'bikeAvailability': bike_availability,
                'totalAvailable': len(bikes),
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

def get_bike_type_features(bike_type):
    """Return standard features for each bike type"""
    features = {
        'Gyroscooter': {
            'maxSpeed': '25 km/h',
            'batteryLife': '4-6 hours',
            'weightCapacity': '100 kg',
            'specialFeatures': ['Self-balancing', 'LED lights', 'Mobile app control']
        },
        'eBikes': {
            'maxSpeed': '32 km/h',
            'batteryLife': '6-8 hours',
            'weightCapacity': '120 kg',
            'specialFeatures': ['Pedal assist', 'Height adjustable', 'Cargo basket']
        },
        'Segway': {
            'maxSpeed': '20 km/h',
            'batteryLife': '3-5 hours',
            'weightCapacity': '90 kg',
            'specialFeatures': ['Self-balancing', 'Steering bar', 'Anti-theft alarm']
        }
    }
    
    return features.get(bike_type, {
        'maxSpeed': 'Variable',
        'batteryLife': '4-6 hours',
        'weightCapacity': '100 kg',
        'specialFeatures': ['Standard features']
    })
