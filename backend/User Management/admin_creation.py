import json
import boto3
import json
import os
 
cognito = boto3.client('cognito-idp')
dynamodb = boto3.resource('dynamodb')

def lambda_handler(event, context):
    #Transfer the user to the franchise group
    email = json.loads(event['body'])['email']

    group_name = os.environ.get('COGNITO_GROUP_NAME')

    print(f"Adding user {email} to group {group_name}")
    cognito.admin_add_user_to_group(
            UserPoolId=os.environ['COGNITO_USER_POOL_ID'],
            Username=email,
            GroupName=group_name
        )
    #Remove the user from the customer group
    try:
        cognito.admin_remove_user_from_group(
            UserPoolId=os.environ['COGNITO_USER_POOL_ID'],
            Username=email,
            GroupName='customers'
        )
    except cognito.exceptions.ResourceNotFoundException:
        print(f"User {email} not found in 'customers' group, skipping removal.")

   
    if (not email or not group_name):
        return {
            'statusCode': 400,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type', 
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': json.dumps({
                'success': False,
                'message': 'Email or group name is missing.'
            })
        }
    #returning success response
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type', 
            'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        'body': json.dumps({
            'success': True,
            'message': f'User {email} added to group {group_name} successfully ✅.'
        })
    }


