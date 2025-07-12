import json

def lambda_handler(event, context):
    """
    Simple test endpoint for franchise role access
    """
    try:
        # Get user information from the authorizer context
        user_context = event.get('requestContext', {}).get('authorizer', {})
        
        response_data = {
            'message': 'Franchise endpoint accessed successfully!',
            'user_id': user_context.get('userId', 'unknown'),
            'email': user_context.get('email', 'unknown'),
            'groups': user_context.get('groups', 'unknown'),
            'admin_privileges': True,
            'timestamp': context.aws_request_id
        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            'body': json.dumps(response_data)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Internal server error',
                'message': str(e)
            })
        }
