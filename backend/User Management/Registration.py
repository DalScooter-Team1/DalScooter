import json
import boto3
import hashlib
import os
from datetime import datetime

cognito = boto3.client('cognito-idp')
dynamodb = boto3.resource('dynamodb')
sns = boto3.client("sns")

def lambda_handler(event, context):
    print(f"Registration request: {json.dumps(event, indent=2)}")
    
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    }
    
    # Handle CORS preflight
    if event['httpMethod'] == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}
    
    try:
        # Parse request body
        body = json.loads(event['body'])
        email = body['email']
        password = body['password']
        first_name = body['firstName']
        last_name = body['lastName']
        user_type = body.get('userType', 'customer')
        security_questions = body['securityQuestions']
        
        # Validation
        if not all([email, password, first_name, last_name, security_questions]):
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({
                    'success': False,
                    'error': 'Missing required fields'
                })
            }
        
        if len(security_questions) != 3:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({
                    'success': False,
                    'error': 'Must provide exactly 3 security questions'
                })
            }
        
        # Step 1: Create user in Cognito
        response = cognito.sign_up(
            ClientId=os.environ['COGNITO_CLIENT_ID'],
            Username=email,
            Password=password,
            UserAttributes=[
                {'Name': 'email', 'Value': email},
                {'Name': 'given_name', 'Value': first_name},
                {'Name': 'family_name', 'Value': last_name}
            ]
        )
        
        user_id = response['UserSub']
        print(f"User created: {user_id}")
        
        # Step 2: Confirm user sign-up
        cognito.admin_confirm_sign_up(
            UserPoolId=os.environ['COGNITO_USER_POOL_ID'],
            Username=email
        )
        
        # Step 3: Add to user group
        group_name = 'franchise' if user_type == 'franchise' else 'customers'
        cognito.admin_add_user_to_group(
            UserPoolId=os.environ['COGNITO_USER_POOL_ID'],
            Username=email,
            GroupName=group_name
        )
        
        print(f"User added to group: {group_name}")
        
        # Step 4: Store security questions
        table = dynamodb.Table(os.environ['SECURITY_QUESTIONS_TABLE'])
        
        for i, sq in enumerate(security_questions):
            hashed_answer = hashlib.sha256(
                sq['answer'].lower().strip().encode()
            ).hexdigest()
            
            table.put_item(
                Item={
                    'userId': user_id,
                    'questionId': f'q{i+1}',
                    'question': sq['question'],
                    'answer': hashed_answer,
                    'createdAt': int(datetime.now().timestamp() * 1000),
                    'isActive': True
                }
            )
        
        print("Security questions stored")

        sns.publish(
            TopicArn = os.environ['SIGNUP_LOGIN_TOPIC_ARN'],
            Message  = json.dumps({
                "toEmail":  email,
                "subject":  "Sign-up Successful",
                "bodyText": f"Hi {first_name}, thanks for signing up."
            })
        )
        print(f"Email notification sent to: {first_name}")

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'message': 'Registration successful! Check your email for verification.',
                'userId': user_id
            })
        }
        
    except Exception as e:
        print(f"Registration error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'success': False,
                'error': str(e)
            })
        }