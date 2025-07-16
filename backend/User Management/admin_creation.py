import json
import boto3
import os
import datetime
 
cognito = boto3.client('cognito-idp')
dynamodb = boto3.resource('dynamodb')
sns = boto3.client('sns')

# Franchise promotion email template
FRANCHISE_PROMOTION_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Congratulations - You're Now a Franchise Operator!</title>
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
        .promotion-badge {
            background-color: #FFCC00; /* Dalhousie gold */
            color: #002D72;
            padding: 10px 20px;
            border-radius: 25px;
            font-weight: bold;
            font-size: 18px;
            text-align: center;
            margin: 20px 0;
        }
        .privileges {
            background-color: #e8f4fd;
            border-left: 4px solid #002D72;
            padding: 15px;
            margin: 20px 0;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
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
        <h1>🎉 Congratulations!</h1>
        <p>You've been promoted to Franchise Operator</p>
    </div>
    <div class="content">
        <div class="promotion-badge">
            ⭐ FRANCHISE OPERATOR ⭐
        </div>
        
        <h2>Hello {first_name},</h2>
        <p>We're excited to inform you that your DalScooter account has been upgraded to <strong>Franchise Operator</strong> status!</p>
        
        <div class="privileges">
            <h3>🚀 Your New Administrative Privileges:</h3>
            <ul>
                <li><strong>User Management:</strong> View and manage customer accounts</li>
                <li><strong>Analytics Dashboard:</strong> Access detailed usage statistics and reports</li>
                <li><strong>Booking Oversight:</strong> Monitor and approve scooter bookings</li>
                <li><strong>System Administration:</strong> Configure franchise settings and preferences</li>
                <li><strong>Real-time Monitoring:</strong> Track active users and system health</li>
            </ul>
        </div>
        
        <p>As a franchise operator, you now have the tools and authority to help manage the DalScooter experience for our campus community.</p>
        
        <div style="text-align: center;">
            <a href="#" class="button">Access Admin Dashboard</a>
        </div>
        
        <p>If you have any questions about your new role or need assistance with the administrative features, please don't hesitate to contact our support team.</p>
        
        <p>Thank you for your commitment to DalScooter!</p>
        <p>Best regards,<br>The DalScooter Team</p>
    </div>
    <div class="footer">
        &copy; 2025 DalScooter. All rights reserved.
    </div>
</body>
</html>"""

def get_franchise_promotion_email_template(**kwargs):
    """
    Return the franchise promotion email template with placeholders replaced with provided values
    """
    template = FRANCHISE_PROMOTION_TEMPLATE
    
    # Replace placeholders with actual values
    for key, value in kwargs.items():
        template = template.replace(f"{{{key}}}", value)
        
    return template

def get_user_attributes(email):
    """Fetches user attributes from Cognito"""
    try:
        response = cognito.admin_get_user(
            UserPoolId=os.environ['COGNITO_USER_POOL_ID'],
            Username=email
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
        return {'given_name': 'User', 'email': email}

def send_franchise_promotion_notification(email, user_attributes):
    """Sends franchise promotion notification via SNS"""
    try:
        print(f"Starting franchise promotion notification process for user: {email}")
        # Check if we have the SNS topic ARN
        topic_arn = os.environ.get('SIGNUP_LOGIN_TOPIC_ARN')
        if not topic_arn:
            print("SIGNUP_LOGIN_TOPIC_ARN environment variable not set")
            return
        print(f"Retrieved SNS topic ARN: {topic_arn}")
            
        # Extract user's name from attributes
        first_name = user_attributes.get('given_name', 'User')
        print(f"User first name: {first_name}")
        
        # Define email content
        current_time = datetime.datetime.now().strftime("%Y-%m-%d")
        text_content = f"""
Hello {first_name},

Congratulations! Your DalScooter account has been upgraded to Franchise Operator status.

You now have administrative privileges including:
- User Management
- Analytics Dashboard
- Booking Oversight
- System Administration
- Real-time Monitoring

Thank you for your commitment to DalScooter!

Best regards,
DalScooter Team
        """

        html_content = get_franchise_promotion_email_template(first_name=first_name, promotion_date=current_time)

        # Send notification
        sns.publish(
            TopicArn=topic_arn,
            Message=json.dumps({
                "toEmail": email,
                "subject": "🎉 Congratulations! You're Now a DalScooter Franchise Operator",
                "bodyText": text_content,
                "bodyHtml": html_content
            })
        )
        print(f"Franchise promotion notification sent to {email}")
        print("Franchise promotion notification process completed")
    except Exception as e:
        print(f"Error sending franchise promotion notification: {str(e)}")

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

    # Send franchise promotion notification email
    try:
        user_attributes = get_user_attributes(email)
        send_franchise_promotion_notification(email, user_attributes)
    except Exception as e:
        print(f"Error sending franchise promotion notification: {str(e)}")
        # Don't fail the entire operation if email fails

   
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


