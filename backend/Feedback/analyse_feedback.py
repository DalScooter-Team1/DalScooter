import os
import boto3
import datetime
import json

def lambda_handler(event, context):
    """
    Analyse feedback sentiment using AWS Comprehend and update DynamoDB
    This function is triggered by SQS messages from the feedback stream processor
    """
    # DynamoDB setup
    dynamodb = boto3.resource('dynamodb')
    feedback_table = os.environ.get('FEEDBACK_TABLE')
    
    if not feedback_table:
        print("FEEDBACK_TABLE environment variable is not set")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': 'Server configuration error',
                'message': 'FEEDBACK_TABLE environment variable is not set'
            })
        }
    
    table = dynamodb.Table(feedback_table)
    
    # Process SQS records
    processed_records = 0
    failed_records = 0
    
    print(f"Processing {len(event['Records'])} SQS records")
    
    for record in event['Records']:
        try:
            # Parse the SQS message body
            message_body = json.loads(record['body'])
            
            # Extract feedback information from the message
            feedback_uuid = message_body.get('feedback_uuid')
            email = message_body.get('email')
            timestamp = message_body.get('timestamp')
            
            print(f"Processing feedback analysis for UUID: {feedback_uuid}")
            
            if not email or not timestamp:
                print(f"Missing email or timestamp in message: {message_body}")
                failed_records += 1
                continue
            
            # Fetch the feedback item from DynamoDB using composite key
            response = table.get_item(Key={
                'email': email,
                'timestamp': timestamp
            })
            
            if 'Item' not in response:
                print(f"Feedback not found for email: {email}, timestamp: {timestamp}")
                failed_records += 1
                continue
            
            feedback_item = response['Item']
            feedback_text = feedback_item.get('feedback_text')
            
            if not feedback_text:
                print(f"No feedback text found for UUID: {feedback_uuid}")
                failed_records += 1
                continue            
            # Analyze sentiment using AWS Comprehend
            analyzer = boto3.client('comprehend')
            sentiment = analyzer.detect_sentiment(
                Text=feedback_text,
                LanguageCode='en'
            )
            polarity = sentiment['Sentiment']
            confidence = sentiment['SentimentScore']
            
            print(f"Feedback UUID {feedback_uuid} - Polarity: {polarity} with confidence: {confidence}")
            
            # Update the feedback item with sentiment analysis results (only store polarity, not confidence scores)
            feedback_item['polarity'] = polarity
            feedback_item['analyzed_at'] = datetime.datetime.utcnow().isoformat()
            
            # Save the updated feedback item back to DynamoDB
            table.put_item(Item=feedback_item)
            
            print(f"✅ Successfully analyzed feedback UUID: {feedback_uuid}")
            processed_records += 1
            
        except Exception as e:
            print(f"❌ Error processing feedback record: {str(e)}")
            print(f"Record details: {json.dumps(record, default=str)}")
            failed_records += 1
    
    result = {
        'processed': processed_records,
        'failed': failed_records,
        'total_records': len(event['Records'])
    }
    
    print(f"✅ Feedback analysis complete: {json.dumps(result)}")
    
    return {
        'statusCode': 200,
        'body': json.dumps(result)
    }
    

    
    #get the feedback from the table based on the UUID

#process the feedback polarity.
#save the feedback item in the DynamoDB table