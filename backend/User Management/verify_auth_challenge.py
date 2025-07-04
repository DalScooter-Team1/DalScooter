import json
import hashlib
import os
import boto3

sns = boto3.client('sns')

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
                    user_attributes = get_user_attributes(username)
                    
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

def get_user_attributes(username):
    """Fetches user attributes from Cognito"""
    try:
        # Check if we have the Cognito User Pool ID
        user_pool_id = os.environ.get('COGNITO_USER_POOL_ID')
        if not user_pool_id:
            print("COGNITO_USER_POOL_ID environment variable not set")
            return {'given_name': 'User', 'email': username}
            
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
        return attributes
    except Exception as e:
        print(f"Error fetching user attributes: {str(e)}")
        return {'given_name': 'User', 'email': username}

def send_login_notification(username, user_attributes):
    """Sends login notification via SNS"""
    try:
        # Check if we have the SNS topic ARN
        topic_arn = os.environ.get('SIGNUP_LOGIN_TOPIC_ARN')
        if not topic_arn:
            print("SIGNUP_LOGIN_TOPIC_ARN environment variable not set")
            return
            
        # Extract user's name from attributes
        first_name = user_attributes.get('given_name', 'User')
        email = user_attributes.get('email', username)
        
        # Send notification
        sns.publish(
            TopicArn=topic_arn,
            Message=json.dumps({
                "toEmail": email,
                "subject": "DalScooter - Login Notification",
                "bodyText": f"Hi {first_name}, we noticed a new login to your DalScooter account. If this was you, no action is needed. If you didn't login recently, please contact support."
            })
        )
        print(f"Login notification sent to {email}")
    except Exception as e:
        print(f"Error sending login notification: {str(e)}")