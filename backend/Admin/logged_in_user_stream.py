import os
import boto3
import json
import logging
import pymysql
from datetime import datetime
from decimal import Decimal

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# MySQL connection parameters from environment variables
MYSQL_HOST = os.environ['MYSQL_HOST']
MYSQL_PORT = int(os.environ['MYSQL_PORT'])
MYSQL_DATABASE = os.environ['MYSQL_DATABASE']
MYSQL_USERNAME = os.environ['MYSQL_USERNAME']
MYSQL_PASSWORD = os.environ['MYSQL_PASSWORD']


# Cognito setup
cognito = boto3.client('cognito-idp')
def get_user_details(email):
    """Get user details from Cognito by email"""
    try:
        user_pool_id = os.environ.get('COGNITO_USER_POOL_ID')
        if not user_pool_id:
            return None
            
        response = cognito.admin_get_user(
            UserPoolId=user_pool_id,
            Username=email
        )
        
        # Extract user attributes
        attributes = {attr['Name']: attr['Value'] for attr in response.get('UserAttributes', [])}
        
        # Get user groups
        try:
            groups_response = cognito.admin_list_groups_for_user(
                UserPoolId=user_pool_id,
                Username=email
            )
            user_groups = [group['GroupName'] for group in groups_response.get('Groups', [])]
        except:
            user_groups = []
        #  Return user details   
      #  print(f"User details for {email}: {attributes}, Groups: {user_groups}")
        return {
            'firstName': attributes.get('given_name', ''),
            'lastName': attributes.get('family_name', ''),
            'userType': 'franchise' if 'franchise' in user_groups else 'customer',
            'email': email,
            'userId': response.get('Username', email),
            'status': 'online'
        }
    except Exception as e:
        print(f"Error getting user details for {email}: {str(e)}")
        return {
            'firstName': email.split('@')[0],
            'lastName': '',
            'userType': 'customer',
            'email': email,
            'userId': email,
            'status': 'online'
        }


def get_mysql_connection():
    """Create and return a MySQL connection"""
    try:
        connection = pymysql.connect(
            host=MYSQL_HOST,
            port=MYSQL_PORT,
            user=MYSQL_USERNAME,
            password=MYSQL_PASSWORD,
            database=MYSQL_DATABASE,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor,
            autocommit=True
        )
        logger.info("Successfully connected to MySQL database")
        return connection
    except Exception as e:
        logger.error(f"Error connecting to MySQL: {str(e)}")
        raise


def create_active_users_table_if_not_exists(connection):
    """Create the active_users_directory table in MySQL if it doesn't exist"""
    try:
        with connection.cursor() as cursor:
            create_table_sql = """
            CREATE TABLE IF NOT EXISTS active_users_directory (
                sub VARCHAR(255) PRIMARY KEY,
                email VARCHAR(255),
                firstName VARCHAR(255),
                lastName VARCHAR(255),
                userType VARCHAR(50),
                userId VARCHAR(255),
                status VARCHAR(50),
                expires_at BIGINT,
                login_time DATETIME,
                last_heartbeat DATETIME,
                dynamodb_event_name VARCHAR(20),
                last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_email (email),
                INDEX idx_userType (userType),
                INDEX idx_status (status),
                INDEX idx_expires_at (expires_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """
            cursor.execute(create_table_sql)
            logger.info("Active users directory table created or already exists")
    except Exception as e:
        logger.error(f"Error creating active users directory table: {str(e)}")
        raise


def convert_dynamodb_to_mysql_value(value):
    """Convert DynamoDB value to MySQL compatible value"""
    if value is None:
        return None
    elif isinstance(value, Decimal):
        return float(value)
    elif isinstance(value, dict) and len(value) == 1:
        # Handle DynamoDB typed values like {'S': 'string_value'} or {'N': '123'}
        data_type, data_value = next(iter(value.items()))
        if data_type == 'S':
            return data_value
        elif data_type == 'N':
            return float(data_value) if '.' in data_value else int(data_value)
        elif data_type == 'BOOL':
            return data_value
        elif data_type == 'NULL':
            return None
        else:
            return str(data_value)
    else:
        return value


def parse_timestamp_to_datetime(timestamp):
    """Parse Unix timestamp to MySQL datetime format"""
    if not timestamp:
        return None
    try:
        if isinstance(timestamp, str):
            timestamp = int(timestamp)
        dt = datetime.fromtimestamp(timestamp)
        return dt.strftime('%Y-%m-%d %H:%M:%S')
    except Exception as e:
        logger.warning(f"Error parsing timestamp {timestamp}: {str(e)}")
        return None


def process_dynamodb_record(record, connection):
    """Process a single DynamoDB stream record and save to MySQL"""
    try:
        event_name = record['eventName']
        logger.info(f"Processing {event_name} event for MySQL")
        
        with connection.cursor() as cursor:
            if event_name in ['INSERT', 'MODIFY']:
                # Extract data from DynamoDB record
                dynamodb_image = record['dynamodb'].get('NewImage', {})
                
                # Convert DynamoDB format to standard format
                user_data = {}
                for key, value in dynamodb_image.items():
                    user_data[key] = convert_dynamodb_to_mysql_value(value)
                
                # Get user details from Cognito
                sub = user_data.get('sub')
                user_details = get_user_details(sub) if sub else {}
                
                # Prepare data for MySQL insertion
                mysql_data = {
                    'sub': user_data.get('sub'),
                    'email': user_data.get('sub'),  # Using sub as email since it's the email
                    'firstName': user_details.get('firstName', ''),
                    'lastName': user_details.get('lastName', ''),
                    'userType': user_details.get('userType', 'customer'),
                    'userId': user_details.get('userId', user_data.get('sub')),
                    'status': user_details.get('status', 'online'),
                    'expires_at': user_data.get('expires_at'),
                    'login_time': parse_timestamp_to_datetime(user_data.get('login_time')),
                    'last_heartbeat': parse_timestamp_to_datetime(user_data.get('last_heartbeat')),
                    'dynamodb_event_name': event_name
                }
                
                # Insert or update record in MySQL
                upsert_sql = """
                INSERT INTO active_users_directory (
                    sub, email, firstName, lastName, userType, userId, status,
                    expires_at, login_time, last_heartbeat, dynamodb_event_name
                ) VALUES (
                    %(sub)s, %(email)s, %(firstName)s, %(lastName)s, %(userType)s, 
                    %(userId)s, %(status)s, %(expires_at)s, %(login_time)s, 
                    %(last_heartbeat)s, %(dynamodb_event_name)s
                ) ON DUPLICATE KEY UPDATE
                    email = VALUES(email),
                    firstName = VALUES(firstName),
                    lastName = VALUES(lastName),
                    userType = VALUES(userType),
                    userId = VALUES(userId),
                    status = VALUES(status),
                    expires_at = VALUES(expires_at),
                    login_time = VALUES(login_time),
                    last_heartbeat = VALUES(last_heartbeat),
                    dynamodb_event_name = VALUES(dynamodb_event_name),
                    last_modified = CURRENT_TIMESTAMP
                """
                
                cursor.execute(upsert_sql, mysql_data)
                logger.info(f"Successfully processed {event_name} for user {mysql_data['sub']}")
                
            elif event_name == 'REMOVE':
                # Handle record deletion
                old_image = record['dynamodb'].get('OldImage', {})
                sub = convert_dynamodb_to_mysql_value(old_image.get('sub'))
                
                if sub:
                    # Instead of deleting, mark as removed
                    update_sql = """
                    UPDATE active_users_directory 
                    SET dynamodb_event_name = 'REMOVE', status = 'offline', last_modified = CURRENT_TIMESTAMP
                    WHERE sub = %s
                    """
                    cursor.execute(update_sql, (sub,))
                    logger.info(f"Marked user {sub} as REMOVED")
                
    except Exception as e:
        logger.error(f"Error processing DynamoDB record to MySQL: {str(e)}")
        logger.error(f"Record: {json.dumps(record, default=str)}")
        raise


def lambda_handler(event, context):
    """Main Lambda handler function"""
    logger.info("Starting logged in user stream processing")
    logger.info(f"Received event: {json.dumps(event, default=str)}")
    
    connection = None
    try:
        # Get MySQL connection
        connection = get_mysql_connection()
        
        # Create table if it doesn't exist
        create_active_users_table_if_not_exists(connection)
        
        # Process each record in the DynamoDB stream
        for record in event['Records']:
            if record['eventSource'] == 'aws:dynamodb':
                process_dynamodb_record(record, connection)
        
        logger.info("Successfully processed all DynamoDB stream records")
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Successfully processed DynamoDB stream records',
                'processed_records': len(event['Records'])
            })
        }
        
    except Exception as e:
        logger.error(f"Error in lambda_handler: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e),
                'message': 'Error processing DynamoDB stream records'
            })
        }
    
    finally:
        if connection:
            connection.close()
            logger.info("MySQL connection closed")
    

