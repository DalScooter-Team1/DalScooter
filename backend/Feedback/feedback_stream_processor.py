"""
DynamoDB Stream Processor for Feedback
======================================
This Lambda function processes DynamoDB stream events and sends feedback UUIDs to SQS queue
"""
import json
import boto3
import os

def lambda_handler(event, context):
    """
    Process DynamoDB Stream events and send feedback UUIDs to SQS queue
    """
    sqs = boto3.client('sqs')
    queue_url = os.environ.get('FEEDBACK_QUEUE_URL')
    
    if not queue_url:
        print("FEEDBACK_QUEUE_URL environment variable not set")
        return {
            'statusCode': 500,
            'body': 'Configuration error'
        }
    
    processed_records = 0
    failed_records = 0
    
    print(f"Processing {len(event['Records'])} DynamoDB stream records")
    
    for record in event['Records']:
        try:
            # Only process INSERT events (new feedback created)
            if record['eventName'] == 'INSERT':
                # Extract the new image (new record data)
                dynamodb_record = record['dynamodb']['NewImage']
                
                # Get the UUID from the DynamoDB record
                uuid = dynamodb_record.get('uuid', {}).get('S')
                email = dynamodb_record.get('email', {}).get('S', 'unknown')
                timestamp = dynamodb_record.get('timestamp', {}).get('S', 'unknown')
                booking_reference = dynamodb_record.get('booking_reference', {}).get('S', 'N/A')
                
                if not uuid:
                    print(f"No UUID found in record: {record}")
                    failed_records += 1
                    continue
                
                # Create message for SQS with UUID and metadata
                message_body = {
                    'action': 'process_feedback',
                    'feedback_uuid': uuid,
                    'email': email,
                    'timestamp': timestamp,
                    'booking_reference': booking_reference,
                    'event_type': 'feedback_created',
                    'source': 'dynamodb_stream',
                    'stream_event_time': record['dynamodb'].get('ApproximateCreationDateTime')
                }
                
                # Send message to SQS
                response = sqs.send_message(
                    QueueUrl=queue_url,
                    MessageBody=json.dumps(message_body),
                    MessageAttributes={
                        'action': {
                            'StringValue': 'process_feedback',
                            'DataType': 'String'
                        },
                        'feedback_uuid': {
                            'StringValue': uuid,
                            'DataType': 'String'
                        },
                        'source': {
                            'StringValue': 'dynamodb_stream',
                            'DataType': 'String'
                        }
                    }
                )
                
                print(f"Sent feedback UUID {uuid} to SQS: {response['MessageId']}")
                processed_records += 1
                
            else:
                print(f"Skipping non-INSERT event: {record['eventName']}")
                
        except Exception as e:
            print(f"Error processing record: {str(e)}")
            print(f"Record: {json.dumps(record, default=str)}")
            failed_records += 1
    
    print(f"Stream processing complete: {processed_records} processed, {failed_records} failed")
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'processed': processed_records,
            'failed': failed_records,
            'message': 'Stream processing completed'
        })
    }
