import json
import boto3
import os

dynamodb = boto3.resource('dynamodb')

MESSAGES_TABLE = os.environ['MESSAGES_TABLE_NAME']

def lambda_handler(event, context):
    try:
        # Get franchise ID from Cognito token
        franchise_id = event['requestContext']['authorizer']['claims']['sub']

        messages_table = dynamodb.Table(MESSAGES_TABLE)
        response = messages_table.query(
            IndexName='franchiseId-index',
            KeyConditionExpression='franchiseId = :fid',
            ExpressionAttributeValues={':fid': franchise_id}
        )

        messages = response.get('Items', [])
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, OPTIONS'
            },
            'body': json.dumps({
                'messages': messages,
                'count': len(messages)
            })
        }

    except Exception as e:
        print(f"Error fetching concerns: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, OPTIONS'
            },
            'body': json.dumps({'error': 'Failed to fetch concerns'})
        }