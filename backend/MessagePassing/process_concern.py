import json
import boto3
import os
import random
from datetime import datetime

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
cognito = boto3.client('cognito-idp')

# Environment variables
DYNAMODB_TABLE = os.environ['DYNAMODB_TABLE']
COGNITO_USER_POOL_ID = os.environ['COGNITO_USER_POOL_ID']

# Initialize DynamoDB table
table = dynamodb.Table(DYNAMODB_TABLE)

def lambda_handler(event, context):
    """
    Lambda function triggered by SQS to process customer concerns.
    Randomly assigns concerns to franchise owners and stores in DynamoDB.
    """
    successful_records = []
    failed_records = []
    
    try:
        print(f"Processing {len(event.get('Records', []))} SQS records")
        
        # Process each SQS record
        for record in event['Records']:
            message_id = record.get('messageId', 'unknown')
            receipt_handle = record.get('receiptHandle', '')
            
            try:
                message_body = json.loads(record['body'])
                
                print(f"Processing concern: {message_body.get('messageId')}")
                
                # Extract concern details
                concern_message_id = message_body['messageId']
                timestamp = message_body['timestamp']
                user_id = message_body['userId']
                content = message_body['content']
                
                # Get customer's franchise ID if available (for future franchise-specific assignment)
                customer_franchise_id = message_body.get('franchiseId')
                
                # Validate required fields
                if not all([concern_message_id, timestamp, user_id, content]):
                    print(f"Missing required fields in message: {message_body}")
                    failed_records.append({
                        'itemIdentifier': message_id,
                        'errorCode': 'InvalidMessage',
                        'errorMessage': 'Missing required fields'
                    })
                    continue
                
                # Get random franchise owner (preferably from same franchise if specified)
                franchise_owner = get_random_franchise_owner(customer_franchise_id)
                
                if not franchise_owner:
                    print("Warning: No franchise owners found, assigning to admin")
                    franchise_owner = {'sub': 'admin', 'email': 'admin@dalscooter.com', 'franchiseId': 'admin'}

                # Store concern in DynamoDB
                concern_item = {
                    'messageId': concern_message_id,
                    'timestamp': timestamp,
                    'userId': user_id,
                    'content': content,
                    'messageType': 'concern',
                    'status': 'assigned',
                    'assignedTo': franchise_owner['sub'],
                    'assignedEmail': franchise_owner.get('email', 'unknown'),
                    'franchiseId': franchise_owner.get('franchiseId', customer_franchise_id or 'unassigned'),
                    'assignedAt': int(datetime.utcnow().timestamp()),
                    'submittedAt': message_body.get('submittedAt', datetime.utcnow().isoformat()),
                    'responses': []  # Array to store responses from franchise owner
                }
                
                # Save to DynamoDB
                table.put_item(Item=concern_item)
                
                print(f"Concern {concern_message_id} assigned to franchise owner: {franchise_owner['sub']} ({franchise_owner.get('email', 'unknown')})")
                
                # Mark as successfully processed
                successful_records.append(message_id)
                
            except json.JSONDecodeError as e:
                print(f"Invalid JSON in SQS message {message_id}: {str(e)}")
                failed_records.append({
                    'itemIdentifier': message_id,
                    'errorCode': 'InvalidJSON',
                    'errorMessage': f'Failed to parse JSON: {str(e)}'
                })
            except KeyError as e:
                print(f"Missing required field in message {message_id}: {str(e)}")
                failed_records.append({
                    'itemIdentifier': message_id,
                    'errorCode': 'MissingField',
                    'errorMessage': f'Missing required field: {str(e)}'
                })
            except Exception as e:
                print(f"Error processing concern {message_id}: {str(e)}")
                failed_records.append({
                    'itemIdentifier': message_id,
                    'errorCode': 'ProcessingError',
                    'errorMessage': str(e)
                })
        
        # Prepare response for SQS
        response = {
            'statusCode': 200,
            'body': json.dumps({
                'message': f'Processed {len(successful_records)} concerns successfully, {len(failed_records)} failed',
                'successful': len(successful_records),
                'failed': len(failed_records)
            })
        }
        
        # If there are failed records, include them in the response for SQS to retry
        if failed_records:
            response['batchItemFailures'] = failed_records
            print(f"Failed to process {len(failed_records)} records: {failed_records}")
        
        return response
        
    except Exception as e:
        print(f"Error processing concerns batch: {str(e)}")
        # Return error but don't fail the Lambda so SQS can retry
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': f'Failed to process concerns: {str(e)}'
            })
        }

def get_random_franchise_owner(preferred_franchise_id=None):
    """
    Get a random franchise owner from Cognito User Pool.
    If preferred_franchise_id is provided, try to find owners from that franchise first.
    Returns user with 'sub', 'email', and 'franchiseId' fields.
    """
    try:
        # Get all users from Cognito User Pool
        response = cognito.list_users(
            UserPoolId=COGNITO_USER_POOL_ID,
            Limit=60  # Adjust based on expected number of franchise owners
        )
        
        # Filter for franchise owners (users in the 'franchise' group)
        franchise_owners = []
        preferred_franchise_owners = []
        
        print(f"Found {len(response.get('Users', []))} users in Cognito User Pool")
        
        for user in response['Users']:
            try:
                # Check if user is a franchise owner by checking their groups
                user_attributes = {attr['Name']: attr['Value'] for attr in user.get('Attributes', [])}
                
                # Get basic user info
                email = user_attributes.get('email', '')
                sub = user_attributes.get('sub', '')
                username = user.get('Username', '')
                
                if not email or not sub:
                    print(f"Skipping user {username}: missing email or sub")
                    continue
                
                # Initialize franchise owner info
                is_franchise_owner = False
                user_franchise_id = None
                
                # Check if this user is in the franchise group
                try:
                    user_groups_response = cognito.admin_list_groups_for_user(
                        UserPoolId=COGNITO_USER_POOL_ID,
                        Username=username
                    )
                    user_groups = [group['GroupName'] for group in user_groups_response.get('Groups', [])]
                    print(f"User {email} is in groups: {user_groups}")
                    
                    if 'franchise' in user_groups:
                        is_franchise_owner = True
                        # Try to get franchise ID from user attributes first
                        user_franchise_id = user_attributes.get('custom:franchise_id', user_attributes.get('franchiseId', sub))
                        print(f"Found franchise owner: {email} (franchise: {user_franchise_id})")
                        
                except Exception as e:
                    print(f"Error checking groups for user {username}: {str(e)}")
                    # As a fallback, check if user has franchise-related attributes
                    if 'franchise' in email.lower() or user_attributes.get('custom:franchise_id'):
                        print(f"Assuming {email} is franchise owner based on attributes")
                        is_franchise_owner = True
                        user_franchise_id = user_attributes.get('custom:franchise_id', sub)
                
                if is_franchise_owner:
                    owner_info = {
                        'sub': sub,
                        'email': email,
                        'franchiseId': user_franchise_id,
                        'username': username
                    }
                    franchise_owners.append(owner_info)
                    
                    # If this owner matches the preferred franchise, add to preferred list
                    if preferred_franchise_id and user_franchise_id == preferred_franchise_id:
                        preferred_franchise_owners.append(owner_info)
                        
            except Exception as e:
                print(f"Error processing user {user.get('Username', 'unknown')}: {str(e)}")
                continue
        
        print(f"Found {len(franchise_owners)} franchise owners, {len(preferred_franchise_owners)} from preferred franchise")
        
        # Return preferred franchise owner if available
        if preferred_franchise_owners:
            selected_owner = random.choice(preferred_franchise_owners)
            print(f"Selected preferred franchise owner: {selected_owner['email']} (franchise: {selected_owner['franchiseId']})")
            return selected_owner
        
        # Otherwise return any franchise owner
        if franchise_owners:
            selected_owner = random.choice(franchise_owners)
            print(f"Selected random franchise owner: {selected_owner['email']} (franchise: {selected_owner['franchiseId']})")
            return selected_owner
        else:
            print("No franchise owners found in Cognito User Pool")
            return None
            
    except Exception as e:
        print(f"Error getting franchise owners: {str(e)}")
        return None