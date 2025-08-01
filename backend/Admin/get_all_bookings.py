import json
import boto3
import os
from datetime import datetime
from decimal import Decimal
from boto3.dynamodb.conditions import Attr

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')

# Environment variables
BOOKING_TABLE = os.environ.get('BOOKING_TABLE_NAME', 'dalscooter-booking-table')
table = dynamodb.Table(BOOKING_TABLE)

def get_cors_headers():
    """Return CORS headers for API responses"""
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
        'Content-Type': 'application/json'
    }

class DecimalEncoder(json.JSONEncoder):
    """Helper class to encode Decimal objects to JSON"""
    def default(self, o):
        if isinstance(o, Decimal):
            return float(o)
        return super(DecimalEncoder, self).default(o)

def handler(event, context):
    """
    Lambda function to get all customer bookings for admin use
    Only accessible by admin users
    """
    # Handle CORS preflight
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps({'message': 'CORS preflight successful'})
        }
    
    try:
        # Verify admin authorization
        # In a real application, you would verify JWT token or admin session
        headers = event.get('headers', {})
        authorization = headers.get('Authorization') or headers.get('authorization')
        
        if not authorization:
            return {
                'statusCode': 401,
                'headers': get_cors_headers(),
                'body': json.dumps({'error': 'Authorization header required'})
            }
        
        # For now, we'll assume any authorization header means admin access
        # In production, verify the JWT token and check for admin role
        
        # Get all bookings from DynamoDB
        table = dynamodb.Table(BOOKING_TABLE)
        
        # Scan all bookings (in production, consider pagination for large datasets)
        response = table.scan()
        bookings = response['Items']
        
        # Continue scanning if there are more items
        while 'LastEvaluatedKey' in response:
            response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
            bookings.extend(response['Items'])
        
        # Sort bookings by creation time (newest first)
        # Assuming startTime is used as a proxy for booking creation time
        bookings.sort(key=lambda x: x.get('startTime', ''), reverse=True)
        
        # Enhance booking data with status information
        enhanced_bookings = []
        for booking in bookings:
            enhanced_booking = dict(booking)
            
            # Add computed status
            if booking.get('accessCode') and booking.get('accessCode') != '':
                if booking.get('isUsed', False):
                    enhanced_booking['status'] = 'Completed'
                else:
                    enhanced_booking['status'] = 'Approved'
            else:
                enhanced_booking['status'] = 'Pending'
            
            # Format dates for display
            if 'startTime' in enhanced_booking:
                try:
                    # Assuming ISO format datetime strings
                    start_dt = datetime.fromisoformat(enhanced_booking['startTime'].replace('Z', '+00:00'))
                    enhanced_booking['startTimeFormatted'] = start_dt.strftime('%Y-%m-%d %H:%M')
                except:
                    enhanced_booking['startTimeFormatted'] = enhanced_booking['startTime']
            
            if 'endTime' in enhanced_booking:
                try:
                    end_dt = datetime.fromisoformat(enhanced_booking['endTime'].replace('Z', '+00:00'))
                    enhanced_booking['endTimeFormatted'] = end_dt.strftime('%Y-%m-%d %H:%M')
                except:
                    enhanced_booking['endTimeFormatted'] = enhanced_booking['endTime']
            
            enhanced_bookings.append(enhanced_booking)
        
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'bookings': enhanced_bookings,
                'total': len(enhanced_bookings)
            }, cls=DecimalEncoder)
        }
        
    except Exception as e:
        print(f"Error getting bookings: {str(e)}")
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({'error': 'Failed to retrieve bookings'})
        }
