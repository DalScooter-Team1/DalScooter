#-----------------------------------
# Request format: 
# {
#   "email": "anything@demo.com",
#   "feedback_text": "Your feedback here",
#   "booking_reference": "Optional booking reference"
# }
#-----------------------------------
import os
import boto3
import datetime
import json

def lambda_handler(event, context):
    # DynamoDB setup
    dynamodb = boto3.resource('dynamodb')
    
    # Check if the environment variable is set
    feedback_table = os.environ.get('FEEDBACK_TABLE')
    
    # If not, raise an error
    if not feedback_table:
        print("FEEDBACK_TABLE environment variable is not set")
        return {
            'statusCode': 500,
                'body': json.dumps({
                    'error': 'Server configuration error',
                    'message': 'FEEDBACK_TABLE environment variable is not set'
                })
            }


    # Check the feedback text in the event
    body = event.get('body')
    body = json.loads(body)
    feedback_text = body.get('feedback_text')
    #If not found return and error 
    if not feedback_text:
        return {
            'statusCode': 400,
            'body': json.dumps({
                'error': 'Bad Request',
                'message': 'Feedback text is required'
            })
        }
    
    #If found, create and store the feedback in the DynamoDB table
    table = dynamodb.Table(feedback_table)

      #Entry in the table should include:
            # - email (user identifier)
            # - feedback text
            # - timestamp (current time)
            # - booking reference
    try:
        # Prepare the item to be stored
        item = {
           'email': body.get('email', 'anonymous'),  # Use 'anonymous' if email is not provided
            'feedback_text': feedback_text,
            'timestamp': datetime.datetime.utcnow().isoformat(),
            'booking_reference': body.get('booking_reference', 'N/A')  # Use 'N/A' if booking reference is not provided
        }
        
        #TO DO: run the analytics job to process the feedback

        # Store the item in DynamoDB
        table.put_item(Item=item)
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Feedback submitted successfully',
                'feedback_id': item.get('booking_reference')  # Return the booking reference as feedback ID
            })
        }
    except Exception as e:
        print(f"Error storing feedback: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': 'Internal Server Error',
                'message': 'Failed to store feedback'
            })
        }
    
          

