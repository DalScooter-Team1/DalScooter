import os
import boto3
import json
import logging
from datetime import datetime
from decimal import Decimal

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# AWS clients
dynamodb = boto3.resource('dynamodb')

# Environment variables
FEEDBACK_TABLE = os.environ.get('FEEDBACK_TABLE')

def get_cors_headers():
    """Return CORS headers for API responses"""
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    }

def decimal_default(obj):
    """JSON serializer for objects not serializable by default json code"""
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

def lambda_handler(event, context):
    """
    Lambda function to retrieve feedbacks based on bike_id
    Supports: GET /feedback/{bike_id}
    """
    logger.info(f"Event: {json.dumps(event, indent=2)}")
    
    # Handle CORS preflight
    if event['httpMethod'] == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': ''
        }
    
    try:
        # Check if FEEDBACK_TABLE environment variable is set
        if not FEEDBACK_TABLE:
            logger.error("FEEDBACK_TABLE environment variable is not set")
            return {
                'statusCode': 500,
                'headers': get_cors_headers(),
                'body': json.dumps({
                    'success': False,
                    'message': 'Server configuration error: FEEDBACK_TABLE environment variable is not set'
                })
            }
        
        # Initialize DynamoDB table
        feedback_table = dynamodb.Table(FEEDBACK_TABLE)
        
        # Get bike_id from path parameters
        path_params = event.get('pathParameters') or {}
        bike_id = path_params.get('bike_id')
        
        if not bike_id:
            return {
                'statusCode': 400,
                'headers': get_cors_headers(),
                'body': json.dumps({
                    'success': False,
                    'message': 'Missing bike_id in path parameters'
                })
            }
        
        logger.info(f"Retrieving feedbacks for bike_id: {bike_id}")
        
        # Query feedbacks by bike_id
        try:
            response = feedback_table.scan(
                FilterExpression='bike_id = :bike_id',
                ExpressionAttributeValues={
                    ':bike_id': bike_id
                }
            )
            
            feedbacks = response.get('Items', [])
            
            # Sort feedbacks by timestamp (newest first)
            feedbacks.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
            
            # Process feedbacks to include sentiment analysis if available
            processed_feedbacks = []
            for feedback in feedbacks:
                processed_feedback = {
                    'uuid': feedback.get('uuid'),
                    'email': feedback.get('email'),
                    'first_name': feedback.get('first_name'),
                    'last_name': feedback.get('last_name'),
                    'feedback_text': feedback.get('feedback_text'),
                    'bike_type': feedback.get('bike_type'),
                    'bike_id': feedback.get('bike_id'),
                    'booking_reference': feedback.get('booking_reference'),
                    'timestamp': feedback.get('timestamp'),
                    'polarity': feedback.get('polarity', 'unknown'),  # Sentiment analysis result
                    'analyzed_at': feedback.get('analyzed_at')
                }
                processed_feedbacks.append(processed_feedback)
            
            logger.info(f"Found {len(processed_feedbacks)} feedbacks for bike_id: {bike_id}")
            
            return {
                'statusCode': 200,
                'headers': get_cors_headers(),
                'body': json.dumps({
                    'success': True,
                    'message': f'Retrieved {len(processed_feedbacks)} feedbacks for bike {bike_id}',
                    'bike_id': bike_id,
                    'feedbacks': processed_feedbacks,
                    'count': len(processed_feedbacks)
                }, default=decimal_default)
            }
            
        except Exception as e:
            logger.error(f"Error querying feedbacks: {str(e)}")
            return {
                'statusCode': 500,
                'headers': get_cors_headers(),
                'body': json.dumps({
                    'success': False,
                    'message': f'Error retrieving feedbacks: {str(e)}'
                })
            }
            
    except Exception as e:
        logger.error(f"Error in get_feedback handler: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': False,
                'message': f'Internal server error: {str(e)}'
            })
        }

def get_feedback_by_bike_id(bike_id, limit=None, offset=None):
    """
    Helper function to get feedbacks by bike_id with optional pagination
    """
    try:
        feedback_table = dynamodb.Table(FEEDBACK_TABLE)
        
        # Build scan parameters
        scan_params = {
            'FilterExpression': 'bike_id = :bike_id',
            'ExpressionAttributeValues': {
                ':bike_id': bike_id
            }
        }
        
        # Add pagination if specified
        if limit:
            scan_params['Limit'] = limit
        if offset:
            scan_params['ExclusiveStartKey'] = offset
        
        response = feedback_table.scan(**scan_params)
        
        feedbacks = response.get('Items', [])
        
        # Sort by timestamp (newest first)
        feedbacks.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        
        return {
            'feedbacks': feedbacks,
            'count': len(feedbacks),
            'last_evaluated_key': response.get('LastEvaluatedKey')
        }
        
    except Exception as e:
        logger.error(f"Error in get_feedback_by_bike_id: {str(e)}")
        raise e
