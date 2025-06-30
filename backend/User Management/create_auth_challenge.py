import json
import boto3
import random
import os

dynamodb = boto3.resource('dynamodb')

def lambda_handler(event, context):
    print(f"Create Auth Challenge: {json.dumps(event, indent=2)}")
    
    request = event['request']
    response = event['response']
    
    # Get challenge history to determine which factor
    session = request.get('session', [])
    user_id = request['userAttributes']['sub']
    
    try:
        if len(session) == 0:
            # Factor 2: Security Question Challenge
            create_security_question_challenge(user_id, response)
        elif len(session) == 1:
            # Factor 3: Caesar Cipher Challenge
            create_caesar_cipher_challenge(response)
    except Exception as e:
        print(f"Error creating challenge: {str(e)}")
        response['publicChallengeParameters'] = {
            'error': 'Failed to create challenge'
        }
    
    print(f"Create Auth Response: {json.dumps(response, indent=2)}")
    return event

def create_security_question_challenge(user_id, response):
    # Get user's security questions from DynamoDB
    table = dynamodb.Table(os.environ['SECURITY_QUESTIONS_TABLE'])
    
    result = table.query(
        KeyConditionExpression='userId = :uid',
        ExpressionAttributeValues={':uid': user_id}
    )
    
    if not result['Items']:
        raise Exception('No security questions found for user')
    
    # Pick a random question
    question = random.choice(result['Items'])
    
    # Store correct answer privately
    response['privateChallengeParameters'] = {
        'answer': question['answer'],
        'challengeType': 'SECURITY_QUESTION'
    }
    
    # Send question to user
    response['publicChallengeParameters'] = {
        'question': question['question'],
        'questionId': question['questionId'],
        'challengeType': 'SECURITY_QUESTION',
        'instructions': 'Please answer your security question'
    }
    
    response['challengeMetadata'] = 'SECURITY_QUESTION'

def create_caesar_cipher_challenge(response):
    # Caesar cipher word list
    words = [
        "DALSCOOTER", "BIKERENTAL", "FRANCHISE", "CUSTOMER", 
        "SECURITY", "AUTHENTICATION", "SERVERLESS", "BOOKING"
    ]
    
    original_text = random.choice(words)
    shift = random.randint(1, 25)
    cipher_text = caesar_cipher(original_text, shift)
    
    # Store correct answer privately
    response['privateChallengeParameters'] = {
        'answer': original_text,
        'challengeType': 'CAESAR_CIPHER'
    }
    
    # Send cipher to user
    response['publicChallengeParameters'] = {
        'cipherText': cipher_text,
        'shift': str(shift),
        'challengeType': 'CAESAR_CIPHER',
        'instructions': f'Decode this Caesar cipher (shift: {shift})',
        'hint': 'Enter the original text that was encoded'
    }
    
    response['challengeMetadata'] = 'CAESAR_CIPHER'

def caesar_cipher(text, shift):
    result = ""
    for char in text:
        if char.isalpha():
            ascii_offset = ord('A')
            shifted = (ord(char) - ascii_offset + shift) % 26
            result += chr(shifted + ascii_offset)
        else:
            result += char
    return result