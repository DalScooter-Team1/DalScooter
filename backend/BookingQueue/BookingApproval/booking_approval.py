import json
import boto3
import os
import secrets

dynamodb = boto3.resource('dynamodb')
cognito = boto3.client('cognito-idp')
sns = boto3.client('sns')

BOOKING_TABLE = os.environ['BOOKING_TABLE_NAME']
BIKE_TABLE = os.environ['BIKE_TABLE_NAME']

# Booking confirmation email template
BOOKING_CONFIRMATION_EMAIL_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmed - DalScooter</title>
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
        .access-code {
            background-color: #FFCC00; /* Dalhousie gold */
            color: #002D72;
            padding: 20px;
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 3px;
            border-radius: 8px;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
        }
        .booking-details {
            background-color: #fff;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
            border-left: 4px solid #FFCC00;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🛴 Booking Confirmed!</h1>
    </div>
    <div class="content">
        <h2>Hi {first_name},</h2>
        <p>Great news! Your DalScooter booking has been confirmed and is ready for use.</p>
        
        <div class="booking-details">
            <h3>Booking Details:</h3>
            <p><strong>Bike ID:</strong> {bike_id}</p>
            <p><strong>Booking ID:</strong> {booking_id}</p>
            <p><strong>Start Time:</strong> {start_time}</p>
            <p><strong>End Time:</strong> {end_time}</p>
        </div>

        <p>Your bike access code is:</p>
        
        <div class="access-code">
            {access_code}
        </div>
        
        <p><strong>Important:</strong> Please keep this access code safe. You'll need it to unlock your bike.</p>
        
        <p>Enjoy your ride and stay safe!</p>
        <p>Best regards,<br>The DalScooter Team</p>
    </div>
    <div class="footer">
        &copy; 2025 DalScooter. All rights reserved.
    </div>
</body>
</html>"""

def get_booking_confirmation_email_template(**kwargs):
    """
    Return the booking confirmation email template with placeholders replaced with provided values
    """
    template = BOOKING_CONFIRMATION_EMAIL_TEMPLATE
    
    # Replace placeholders with actual values
    for key, value in kwargs.items():
        template = template.replace(f"{{{key}}}", value)
        
    return template

def get_user_attributes(user_id):
    """Fetches user attributes from Cognito using user ID"""
    try:
        # Try to get user by user ID (sub) first
        response = cognito.list_users(
            UserPoolId=os.environ['COGNITO_USER_POOL_ID'],
            Filter=f'sub = "{user_id}"'
        )
        
        if response['Users']:
            user = response['Users'][0]
            attributes = {}
            for attr in user['Attributes']:
                attributes[attr['Name']] = attr['Value']
            print(f"Retrieved user attributes for {user_id}: {attributes}")
            return attributes
        else:
            print(f"No user found with sub: {user_id}")
            return {'given_name': 'User', 'email': ''}
            
    except Exception as e:
        print(f"Error fetching user attributes for {user_id}: {str(e)}")
        return {'given_name': 'User', 'email': ''}

def send_booking_confirmation_email(booking, access_code):
    """Sends booking confirmation email with access code via SNS"""
    try:
        print(f"Starting booking confirmation email process for booking: {booking['bookingId']}")
        
        # Check if we have the SNS topic ARN
        topic_arn = os.environ.get('SIGNUP_LOGIN_TOPIC_ARN')
        if not topic_arn:
            print("SIGNUP_LOGIN_TOPIC_ARN environment variable not set")
            return
        print(f"Retrieved SNS topic ARN: {topic_arn}")
        
        # Get user details from Cognito
        user_id = booking.get('userId')
        if not user_id:
            print("No userId found in booking")
            return
            
        user_attributes = get_user_attributes(user_id)
        first_name = user_attributes.get('given_name', 'User')
        email = user_attributes.get('email', '')
        
        if not email:
            print(f"No email found for user {user_id}")
            return
            
        print(f"Sending booking confirmation to: {email}")
        
        # Format booking times for display
        start_time = booking.get('startTime', 'N/A')
        end_time = booking.get('endTime', 'N/A')
        
        # Create email content
        text_content = f"""
Hi {first_name},

Your DalScooter booking has been confirmed!

Booking Details:
- Bike ID: {booking.get('bikeId', 'N/A')}
- Booking ID: {booking.get('bookingId', 'N/A')}
- Start Time: {start_time}
- End Time: {end_time}

Your bike access code is: {access_code}

Please keep this access code safe. You'll need it to unlock your bike.

Enjoy your ride and stay safe!

Best regards,
DalScooter Team
        """

        html_content = get_booking_confirmation_email_template(
            first_name=first_name,
            bike_id=booking.get('bikeId', 'N/A'),
            booking_id=booking.get('bookingId', 'N/A'),
            start_time=start_time,
            end_time=end_time,
            access_code=access_code
        )

        # Send notification via SNS
        sns.publish(
            TopicArn=topic_arn,
            Message=json.dumps({
                "toEmail": email,
                "subject": "🛴 DalScooter Booking Confirmed - Your Access Code",
                "bodyText": text_content,
                "bodyHtml": html_content
            })
        )
        print(f"Booking confirmation email sent to {email} for booking {booking['bookingId']}")
        
    except Exception as e:
        print(f"Error sending booking confirmation email: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
def handler(event, context):
    booking_table = dynamodb.Table(BOOKING_TABLE)
    bike_table = dynamodb.Table(BIKE_TABLE)

    for record in event['Records']:
        booking_id = None
        try:
            # Extract booking ID from SQS message body
            body = json.loads(record['body'])
            booking_id = body['bookingId']
            print(f"Processing booking approval for: {booking_id}")

            # Step 1: Get booking from booking table
            booking_result = booking_table.get_item(Key={'bookingId': booking_id})
            print(f"Booking lookup result: {booking_result}")
            
            if 'Item' not in booking_result:
                print(f"Booking ID {booking_id} not found in booking table.")
                continue
            
            booking = booking_result['Item']
            print(f"Found booking: {booking}")

            # Step 2: Get bike ID from the booking
            bike_id = booking.get('bikeId')
            print(f"Retrieved bike_id: {bike_id} from booking: {booking_id}")
            
            if not bike_id:
                print(f"No bikeId found in booking {booking_id}")
                continue

            # Step 3: Generate access code
            access_code = secrets.token_hex(3).upper()
            print(f"Generated access code: {access_code}")

            # Step 4: Update booking with access code
            booking_table.update_item(
                Key={'bookingId': booking_id},
                UpdateExpression='SET accessCode = :ac, isUsed = :used',
                ExpressionAttributeValues={
                    ':ac': access_code,
                    ':used': False
                }
            )
            print(f"Updated booking {booking_id} with access code: {access_code}")

            # Step 5: Update bike table - make bike unavailable and assign access code
            bike_table.update_item(
                Key={'bikeId': bike_id},
                UpdateExpression='SET isActive = :inactive, accessCode = :ac',
                ExpressionAttributeValues={
                    ':inactive': False,
                    ':ac': access_code
                }
            )
            print(f"Updated bike {bike_id} - set inactive and assigned access code: {access_code}")

            # Step 6: Send booking confirmation email with access code
            try:
                send_booking_confirmation_email(booking, access_code)
                print(f"Email notification sent for booking {booking_id}")
            except Exception as email_error:
                print(f"Failed to send email for booking {booking_id}: {email_error}")
                # Don't fail the entire process if email fails
                pass

        except Exception as e:
            booking_id_str = booking_id if booking_id else "unknown"
            print(f"Failed to process booking {booking_id_str}: {e}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            
    return {
        'statusCode': 200,
        'body': json.dumps({'message': 'Processed all booking approvals.'})
    }