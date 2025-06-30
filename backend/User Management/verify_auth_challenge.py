import json
import hashlib

def lambda_handler(event, context):
    print(f"Verify Auth Challenge: {json.dumps(event, indent=2)}")
    
    request = event['request']
    response = event['response']
    
    user_answer = request['challengeAnswer']
    private_params = request['privateChallengeParameters']
    challenge_type = private_params['challengeType']
    
    try:
        if challenge_type == 'SECURITY_QUESTION':
            response['answerCorrect'] = verify_security_question(user_answer, private_params['answer'])
        elif challenge_type == 'CAESAR_CIPHER':
            response['answerCorrect'] = verify_caesar_cipher(user_answer, private_params['answer'])
        else:
            response['answerCorrect'] = False
    except Exception as e:
        print(f"Error verifying challenge: {str(e)}")
        response['answerCorrect'] = False
    
    print(f"Verify Auth Response: {json.dumps(response, indent=2)}")
    return event

def verify_security_question(user_answer, correct_answer_hash):
    # Hash user's answer and compare
    user_answer_hash = hashlib.sha256(
        user_answer.lower().strip().encode()
    ).hexdigest()
    
    return user_answer_hash == correct_answer_hash

def verify_caesar_cipher(user_answer, correct_answer):
    return user_answer.upper().strip() == correct_answer