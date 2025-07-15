import json
import boto3
import os
import random

dynamodb = boto3.resource('dynamodb')
cognito = boto3.client('cognito-idp')
ses = boto3.client('ses', region_name=os.environ['SES_REGION'])

MESSAGES_TABLE = os.environ['MESSAGES_TABLE_NAME']
USER_POOL_ID = os.environ['USER_POOL_ID']
SES_FROM_ADDRESS = os.environ['SES_FROM_ADDRESS']

def lambda_handler(event, context):
    try:
        for record in event['Records']:
            message = json.loads(record['body'])
            message_id = message['messageId']
            user_id = message['userId']
            booking_id = message['bookingId']
            content = message['content']
            timestamp = message['timestamp']

            # Get franchise operators
            response = cognito.list_users(
                UserPoolId=USER_POOL_ID,
                Filter='cognito:groups = "franchise"'
            )
            franchise_users = response.get('Users', [])
            if not franchise_users:
                print("No franchise users found")
                continue

            # Assign to a random franchise operator
            franchise = random.choice(franchise_users)
            franchise_id = franchise['Username']
            franchise_email = next(
                attr['Value'] for attr in franchise['Attributes'] if attr['Name'] == 'email'
            )

            # Update DynamoDB with franchise assignment
            messages_table = dynamodb.Table(MESSAGES_TABLE)
            messages_table.update_item(
                Key={
                    'messageId': message_id,
                    'timestamp': timestamp
                },
                UpdateExpression='SET franchiseId = :fid, #status = :s',
                ExpressionAttributeNames={'#status': 'status'},
                ExpressionAttributeValues={
                    ':fid': franchise_id,
                    ':s': 'assigned'
                }
            )

            # Send email to franchise
            ses.send_email(
                Source=SES_FROM_ADDRESS,
                Destination={'ToAddresses': [franchise_email]},
                Message={
                    'Subject': {'Data': 'New Customer Concern'},
                    'Body': {
                        'Text': {
                            'Data': f"Concern ID: {message_id}\nBooking ID: {booking_id}\nCustomer ID: {user_id}\nContent: {content}"
                        }
                    }
                }
            )

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Concerns processed successfully'})
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Failed to process concern'})
        }