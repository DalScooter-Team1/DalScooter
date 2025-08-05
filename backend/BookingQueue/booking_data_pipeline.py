import json
import os
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

def create_booking_table_if_not_exists(connection):
    """Create the bookings table in MySQL if it doesn't exist"""
    try:
        with connection.cursor() as cursor:
            create_table_sql = """
            CREATE TABLE IF NOT EXISTS bookings (
                bookingId VARCHAR(255) PRIMARY KEY,
                bikeId VARCHAR(255),
                userId VARCHAR(255),
                startTime DATETIME,
                endTime DATETIME,
                price DECIMAL(10, 2),
                status VARCHAR(50),
                createdAt DATETIME,
                updatedAt DATETIME,
                approvalStatus VARCHAR(50),
                rejectionReason TEXT,
                dynamodb_event_name VARCHAR(20),
                last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_userId (userId),
                INDEX idx_bikeId (bikeId),
                INDEX idx_status (status),
                INDEX idx_createdAt (createdAt)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """
            cursor.execute(create_table_sql)
            logger.info("Bookings table created or already exists")
    except Exception as e:
        logger.error(f"Error creating bookings table: {str(e)}")
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

def parse_iso_datetime(iso_string):
    """Parse ISO datetime string to MySQL datetime format"""
    if not iso_string:
        return None
    try:
        # Handle both with and without microseconds
        if '.' in iso_string:
            dt = datetime.fromisoformat(iso_string.replace('Z', '+00:00'))
        else:
            dt = datetime.fromisoformat(iso_string.replace('Z', '+00:00'))
        return dt.strftime('%Y-%m-%d %H:%M:%S')
    except Exception as e:
        logger.warning(f"Error parsing datetime {iso_string}: {str(e)}")
        return None

def process_dynamodb_record(record, connection):
    """Process a single DynamoDB stream record"""
    try:
        event_name = record['eventName']
        logger.info(f"Processing {event_name} event")
        
        with connection.cursor() as cursor:
            if event_name in ['INSERT', 'MODIFY']:
                # Extract data from DynamoDB record
                dynamodb_image = record['dynamodb'].get('NewImage', {})
                
                # Convert DynamoDB format to standard format
                booking_data = {}
                for key, value in dynamodb_image.items():
                    booking_data[key] = convert_dynamodb_to_mysql_value(value)
                
                # Prepare data for MySQL insertion
                mysql_data = {
                    'bookingId': booking_data.get('bookingId'),
                    'bikeId': booking_data.get('bikeId'),
                    'userId': booking_data.get('userId'),
                    'startTime': parse_iso_datetime(booking_data.get('startTime')),
                    'endTime': parse_iso_datetime(booking_data.get('endTime')),
                    'price': booking_data.get('price'),
                    'status': booking_data.get('status'),
                    'createdAt': parse_iso_datetime(booking_data.get('createdAt')),
                    'updatedAt': parse_iso_datetime(booking_data.get('updatedAt')),
                    'approvalStatus': booking_data.get('approvalStatus'),
                    'rejectionReason': booking_data.get('rejectionReason'),
                    'dynamodb_event_name': event_name
                }
                
                # Insert or update record in MySQL
                upsert_sql = """
                INSERT INTO bookings (
                    bookingId, bikeId, userId, startTime, endTime, price, status,
                    createdAt, updatedAt, approvalStatus, rejectionReason, dynamodb_event_name
                ) VALUES (
                    %(bookingId)s, %(bikeId)s, %(userId)s, %(startTime)s, %(endTime)s, 
                    %(price)s, %(status)s, %(createdAt)s, %(updatedAt)s, %(approvalStatus)s, 
                    %(rejectionReason)s, %(dynamodb_event_name)s
                ) ON DUPLICATE KEY UPDATE
                    bikeId = VALUES(bikeId),
                    userId = VALUES(userId),
                    startTime = VALUES(startTime),
                    endTime = VALUES(endTime),
                    price = VALUES(price),
                    status = VALUES(status),
                    createdAt = VALUES(createdAt),
                    updatedAt = VALUES(updatedAt),
                    approvalStatus = VALUES(approvalStatus),
                    rejectionReason = VALUES(rejectionReason),
                    dynamodb_event_name = VALUES(dynamodb_event_name),
                    last_modified = CURRENT_TIMESTAMP
                """
                
                cursor.execute(upsert_sql, mysql_data)
                logger.info(f"Successfully processed {event_name} for booking {mysql_data['bookingId']}")
                
            elif event_name == 'REMOVE':
                # Handle record deletion
                old_image = record['dynamodb'].get('OldImage', {})
                booking_id = convert_dynamodb_to_mysql_value(old_image.get('bookingId'))
                
                if booking_id:
                    # Instead of deleting, mark as deleted or keep a record of the deletion
                    update_sql = """
                    UPDATE bookings 
                    SET dynamodb_event_name = 'REMOVE', last_modified = CURRENT_TIMESTAMP
                    WHERE bookingId = %s
                    """
                    cursor.execute(update_sql, (booking_id,))
                    logger.info(f"Marked booking {booking_id} as REMOVED")
                
    except Exception as e:
        logger.error(f"Error processing DynamoDB record: {str(e)}")
        logger.error(f"Record: {json.dumps(record, default=str)}")
        raise

def lambda_handler(event, context):
    """Main Lambda handler function"""
    logger.info("Starting booking data pipeline processing")
    logger.info(f"Received event: {json.dumps(event, default=str)}")
    
    connection = None
    try:
        # Get MySQL connection
        connection = get_mysql_connection()
        
        # Create table if it doesn't exist
        create_booking_table_if_not_exists(connection)
        
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
