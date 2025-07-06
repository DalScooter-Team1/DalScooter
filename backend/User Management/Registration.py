import json
import boto3
import hashlib
import os
from datetime import datetime

cognito = boto3.client('cognito-idp')
dynamodb = boto3.resource('dynamodb')
sns = boto3.client("sns")

# Define welcome email template as a string directly in the code
WELCOME_EMAIL_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to DalScooter</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #002D72; /* Dalhousie blue */
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background-color: #f9f9f9;
            padding: 20px;
            border-left: 1px solid #ddd;
            border-right: 1px solid #ddd;
        }
        .footer {
            background-color: #002D72; /* Dalhousie blue */
            color: white;
            padding: 15px;
            text-align: center;
            font-size: 12px;
            border-radius: 0 0 5px 5px;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #FFCC00; /* Dalhousie gold */
            color: #002D72;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Welcome to DalScooter!</h1>
    </div>
    <div class="content">
        <h2>Hi {first_name},</h2>
        <p>Thank you for registering with DalScooter - the most convenient way to get around Dalhousie University campus!</p>
        <p>Your account has been successfully created and is now ready to use. You can start booking scooters right away.</p>
        <p>Here's what you can do with your new account:</p>
        <ul>
            <li>Book scooters for campus travel</li>
            <li>Track your rides and history</li>
            <li>Manage your profile and payment methods</li>
        </ul>
        <div style="text-align: center;">
            <a href="#" class="button">Get Started Now</a>
        </div>
        <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
        <p>Happy scooting!</p>
        <p>Best regards,<br>The DalScooter Team</p>
    </div>
    <div class="footer">
        &copy; 2025 DalScooter. All rights reserved.
    </div>
</body>
</html>"""

def get_email_template(**kwargs):
    """
    Return the email template with placeholders replaced with provided values
    """
    template = WELCOME_EMAIL_TEMPLATE
    
    # Replace placeholders with actual values
    for key, value in kwargs.items():
        template = template.replace(f"{{{key}}}", value)
        
    return template

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

        # Use the HTML email template
        email_body = get_email_template(first_name=first_name)
        
        sns.publish(
            TopicArn = os.environ['SIGNUP_LOGIN_TOPIC_ARN'],
            Message  = json.dumps({
                "toEmail":  email,
                "subject":  "Welcome to DalScooter!",
                "bodyText": f"Hi {first_name}, thanks for signing up with DalScooter!",
                "bodyHtml": email_body
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