#----------------------
# Lambda Function to verify the discount code.
#-----------------------
import json
import boto3
import os
from datetime import datetime

# Get the Discount code table ENV.
DISCOUNT_CODES_TABLE = os.environ['DISCOUNT_CODES_TABLE_NAME']
dynamodb = boto3.resource('dynamodb')
discount_codes_table = dynamodb.Table(DISCOUNT_CODES_TABLE)

def get_cors_headers():
    """Return CORS headers for API responses"""
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    }

# Extract the discount code from the request.
def lambda_handler(event, context):
    print(f"Event: {json.dumps(event, indent=2)}")
    
    # Handle CORS preflight
    if event['httpMethod'] == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': ''
        }
    
    try:
        # Get code from path parameters
        path_params = event.get('pathParameters') or {}
        discount_code = path_params.get('code')
        
        if not discount_code:
            return {
                'statusCode': 400,
                'headers': get_cors_headers(),
                'body': json.dumps({
                    'flag': 'error',
                    'message': 'Discount code is required in path.'
                })
            }
        
        # Check if the discount code exists in the database
        response = discount_codes_table.query(
            IndexName='code-index',
            KeyConditionExpression='code = :code',
            ExpressionAttributeValues={':code': discount_code}
        )
        
        if response.get('Items'):
            discount_item = response['Items'][0]
            current_time = datetime.utcnow()
            expiry_date = datetime.fromisoformat(discount_item['expiry_date'])
            
            # Check if code is active and not expired
            is_valid = (
                discount_item.get('status') == 'active' and
                expiry_date > current_time and
                discount_item.get('usageCount', 0) < discount_item.get('usageLimit', 100)
            )
            
            if is_valid:
                return {
                    'statusCode': 200,
                    'headers': get_cors_headers(),
                    'body': json.dumps({
                        'flag': 'success',
                        'message': 'Discount code is valid.',
                        'discount_percentage': float(discount_item.get('discount_percentage', 0))
                    })
                }
            else:
                return {
                    'statusCode': 200,
                    'headers': get_cors_headers(),
                    'body': json.dumps({
                        'flag': 'error',
                        'message': 'Discount code is expired or not active.'
                    })
                }
        else:
            return {
                'statusCode': 200,
                'headers': get_cors_headers(),
                'body': json.dumps({
                    'flag': 'error',
                    'message': 'Discount code is not valid.'
                })
            }
            
    except Exception as e:
        print(f"Error verifying discount code: {str(e)}")
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'flag': 'error',
                'message': f'Internal server error: {str(e)}'
            })
        }