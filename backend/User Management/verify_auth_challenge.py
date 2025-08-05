import json
import hashlib
import os
import boto3
import re
import datetime

sns = boto3.client('sns')

# Login notification HTML template
LOGIN_NOTIFICATION_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Notification - DalScooter</title>
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
        .alert {
            background-color: #ffeeee;
            border-left: 4px solid #ff5555;
            padding: 10px 15px;
            margin: 15px 0;
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
        <h1>Login Notification</h1>
    </div>
    <div class="content">
        <h2>Hello {first_name},</h2>
        <p>We detected a new login to your DalScooter account on <strong>{login_time}</strong>.</p>
        
        <div class="alert">
            <p>If this was you, no action is needed.</p>
            <p>If you did not initiate this login, please contact support immediately.</p>
        </div>
        
      
        
        <p>Thank you for using DalScooter!</p>
        <p>Best regards,<br>The DalScooter Team</p>
    </div>
    <div class="footer">
        &copy; 2025 DalScooter. All rights reserved.
    </div>
</body>
</html>"""

def get_login_email_template(**kwargs):
    """
    Return the login notification email template with placeholders replaced with provided values
    """
    template = LOGIN_NOTIFICATION_TEMPLATE
    
    # Replace placeholders with actual values
    for key, value in kwargs.items():
        template = template.replace(f"{{{key}}}", value)
        
    return template

# Add a function to validate email format
def is_valid_email(email):
    """Check if the string is a valid email address format"""
    email_pattern = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    return bool(email_pattern.match(email))

def lambda_handler(event, context):
    print(f"Verify Auth Challenge: {json.dumps(event, indent=2)}")
    
    request = event['request']
    response = event['response']
    
    user_answer = request['challengeAnswer']
    private_params = request['privateChallengeParameters']
    challenge_type = private_params['challengeType']
    
    try:
        if challenge_type == 'SECURITY_QUESTION':
            is_correct = verify_security_question(user_answer, private_params['answer'])
            response['answerCorrect'] = is_correct
            
            if not is_correct:
                # Add error code to publicChallengeParameters
                if 'publicChallengeParameters' not in response:
                    response['publicChallengeParameters'] = {}
                    
                response['publicChallengeParameters']['errorCode'] = 'SECURITY_QUESTION'
                response['publicChallengeParameters']['errorMessage'] = 'The security question answer is incorrect'
                
        elif challenge_type == 'CAESAR_CIPHER':
            is_correct = verify_caesar_cipher(user_answer, private_params['answer'])
            response['answerCorrect'] = is_correct
            
            # If answer is correct, this is a successful login, send notification
            if is_correct:
                try:
                    # Extract user information
                    username = event['userName']
                    user_attributes = get_user_attributes(username, event)
                    
                    # Send login notification
                    send_login_notification(username, user_attributes)
                except Exception as e:
                    print(f"Error in login notification flow: {str(e)}")
                    # Continue with the login process even if notification fails
            
            if not is_correct:
                # Add error code to publicChallengeParameters
                if 'publicChallengeParameters' not in response:
                    response['publicChallengeParameters'] = {}
                    
                response['publicChallengeParameters']['errorCode'] = 'CAESAR_CIPHER'
                response['publicChallengeParameters']['errorMessage'] = 'The cipher solution is incorrect'
        else:
            response['answerCorrect'] = False
            
            if 'publicChallengeParameters' not in response:
                response['publicChallengeParameters'] = {}
                
            response['publicChallengeParameters']['errorCode'] = 'UNKNOWN_CHALLENGE'
            response['publicChallengeParameters']['errorMessage'] = f'Unknown challenge type: {challenge_type}'
    except Exception as e:
        print(f"Error verifying challenge: {str(e)}")
        response['answerCorrect'] = False
        
        if 'publicChallengeParameters' not in response:
            response['publicChallengeParameters'] = {}
            
        response['publicChallengeParameters']['errorCode'] = 'VERIFICATION_ERROR'
        response['publicChallengeParameters']['errorMessage'] = f'Challenge verification failed'
    
    print(f"Verify Auth Response: {json.dumps(response, indent=2)}")
    return event

def verify_security_question(user_answer, correct_answer_hash):
    # Hash user's answer and compare
    user_answer_hash = hashlib.sha256(
        user_answer.lower().strip().encode()
    ).hexdigest()
    
    return user_answer_hash == correct_answer_hash

def verify_caesar_cipher(user_answer, correct_answer):
    return user_answer.upper().strip() == correct_answer

def get_user_attributes(username, event):
    """Fetches user attributes from Cognito"""
    try:
        # Get the Cognito User Pool ID from the event
        user_pool_id = event.get('userPoolId')
        if not user_pool_id:
            print("userPoolId not found in event")
            # Do not return username as email if it's not a valid email format
            return {'given_name': 'User', 'email': ''}
            
        cognito = boto3.client('cognito-idp')
        response = cognito.admin_get_user(
            UserPoolId=user_pool_id,
            Username=username
        )
        
        # Convert the user attributes to a dictionary
        attributes = {}
        if 'UserAttributes' in response:
            for attr in response['UserAttributes']:
                attributes[attr['Name']] = attr['Value']
        print(f"Retrieved user attributes: {attributes}")
        return attributes
    except Exception as e:
        print(f"Error fetching user attributes: {str(e)}")
        # Do not return username as email if it's not a valid email format
        return {'given_name': 'User', 'email': ''}

def send_login_notification(username, user_attributes):
    """Sends login notification via SNS"""
    try:
        print(f"Starting login notification process for user: {username}")
        # Check if we have the SNS topic ARN
        topic_arn = os.environ.get('SIGNUP_LOGIN_TOPIC_ARN')
        if not topic_arn:
            print("SIGNUP_LOGIN_TOPIC_ARN environment variable not set")
            return
        print(f"Retrieved SNS topic ARN: {topic_arn}")
            
        # Extract user's name from attributes
        first_name = user_attributes.get('given_name', 'User')

        print(f"User first name: {first_name}")
        
        # Get the email and validate it
        email = user_attributes.get('email', '')
        print(f"Retrieved email from user attributes: {email}")
        
        if not email or not is_valid_email(email):
            print(f"No valid email found for user {username}. Skipping login notification.")
            return
            
        # Define email content
        current_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        text_content = f"""
Hello {first_name},

We detected a new login to your DalScooter account on {current_time}.

If this was you, no action is needed. If you did not initiate this login, please contact support immediately.

Thank you,
DalScooter Team
        """

        html_content = get_login_email_template(first_name=first_name, login_time=current_time)

        # Send notification
        sns.publish(
            TopicArn=topic_arn,
            Message=json.dumps({
                "toEmail": email,
                "subject": "DalScooter - Login Notification",
                "bodyText": text_content,
                "bodyHtml": html_content
            })
        )
        print(f"Login notification sent to {email}")
        print("Login notification process completed")
    except Exception as e:
        print(f"Error sending login notification: {str(e)}")