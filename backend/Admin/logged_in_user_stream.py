import os
import boto3
import csv
import io
import base64
from datetime import datetime


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


def lambda_handler(event, context):

    import logging
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    logger.info('Lambda function started.')

    s3 = boto3.client('s3')

    records = event.get('Records', [])

    logger.info(f'Received {(records)}')

    bucket = os.environ['S3_BUCKET']
    folder = os.environ.get('S3_FOLDER', 'logged_in_user_directory/')
    logger.info(f'Using S3 bucket: {bucket}, folder: {folder}')
    csv_rows = []
    headers = set()

    # Collect all fields for CSV header and add user details fields
    user_details_map = {}
    for idx, record in enumerate(records):
        ddb = record.get('dynamodb', {})
        new_image = ddb.get('NewImage', {})
        if new_image:
            logger.info(f'Record {idx}: Found NewImage with keys: {list(new_image.keys())}')
            headers.update(new_image.keys())
            sub = new_image.get('sub', {}).get('S')
            if sub:
                user_details = get_user_details(sub)
                user_details_map[idx] = user_details
                # Add user details fields to headers
                headers.add('family_name')
                headers.add('given_name')
             
        else:
            logger.info(f'Record {idx}: No NewImage found.')
    headers = sorted(headers)
    logger.info(f'CSV headers determined: {headers}')

    # Prepare CSV rows with user details
    for idx, record in enumerate(records):
        ddb = record.get('dynamodb', {})
        new_image = ddb.get('NewImage', {})
        if new_image:
            row = []
            for h in headers:
                if h == 'family_name':
                    val = user_details_map.get(idx, {}).get('lastName', '')
                elif h == 'given_name':
                    val = user_details_map.get(idx, {}).get('firstName', '')
                else:
                    val = new_image.get(h, {}).get('S') or new_image.get(h, {}).get('N') or ''
                row.append(val)
            # Check if sub already exists in csv_rows, update if found, else append
            sub_value = new_image.get('sub', {}).get('S')
            updated = False
            for i, existing_row in enumerate(csv_rows):
                try:
                    sub_idx = headers.index('sub')
                except ValueError:
                    sub_idx = -1
                if sub_idx != -1 and existing_row[sub_idx] == sub_value:
                    csv_rows[i] = row  # Update existing
                    updated = True
                    logger.info(f'Record {idx}: Updated existing row for sub: {sub_value}')
                    break
            if not updated:
                csv_rows.append(row)
                logger.info(f'Record {idx}: Added new row for sub: {sub_value}')
        else:
            logger.info(f'Record {idx}: Skipped, no NewImage.')

    if not csv_rows:
        logger.info("No new records to process.")
        return {'statusCode': 200, 'body': 'No new records.'}

    # Prepare CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(headers)
    writer.writerows(csv_rows)
    csv_data = output.getvalue()
    logger.info(f'Prepared CSV data for {len(csv_rows)} new rows.')

    # Save to S3 with a fixed filename (append mode)
    key = f"{folder}logged_in_users.csv"
    logger.info(f'S3 object key for CSV: {key}')


    # Try to get the existing CSV from S3 and deduplicate by 'sub'
    try:
        existing_obj = s3.get_object(Bucket=bucket, Key=key)
        existing_data = existing_obj['Body'].read().decode('utf-8')
        existing_lines = existing_data.splitlines()
        reader = csv.reader(existing_lines)
        existing_rows = list(reader)
        logger.info(f'Existing CSV found with {len(existing_rows)-1 if existing_rows else 0} rows.')
        # Build a dict of sub -> row for existing rows (skip header)
        sub_idx = None
        if existing_rows:
            try:
                sub_idx = existing_rows[0].index('sub')
            except ValueError:
                sub_idx = None
        existing_map = {}
        if sub_idx is not None:
            for row in existing_rows[1:]:
                if len(row) > sub_idx:
                    existing_map[row[sub_idx]] = row
        # Add/update with new rows
        try:
            new_sub_idx = headers.index('sub')
        except ValueError:
            new_sub_idx = None
        if new_sub_idx is not None:
            for row in csv_rows:
                if len(row) > new_sub_idx:
                    existing_map[row[new_sub_idx]] = row
            # Compose all rows: header + deduped rows
            all_rows = [headers] + list(existing_map.values())
            logger.info('Deduplicated rows by sub. Writing updated CSV.')
        else:
            all_rows = [headers] + csv_rows
            logger.info('No sub column found. Writing new rows only.')
    except s3.exceptions.NoSuchKey:
        # File does not exist, create new
        all_rows = [headers] + csv_rows
        logger.info('No existing CSV found. Creating new file.')
    except Exception as e:
        logger.error(f'Error reading existing CSV: {str(e)}')
        return {'statusCode': 500, 'body': f'Error reading existing CSV: {str(e)}'}

    # Write all rows back to S3
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerows(all_rows)
    s3.put_object(Bucket=bucket, Key=key, Body=output.getvalue().encode('utf-8'))
    logger.info(f"Wrote {len(all_rows)-1} records to {key}")

    # User details already fetched and included in CSV rows above

    return {'statusCode': 200, 'body': f'Appended {len(csv_rows)} records to {key}'}
