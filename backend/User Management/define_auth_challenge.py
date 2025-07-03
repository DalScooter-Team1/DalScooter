import json

def lambda_handler(event, context):
    print(f"Define Auth Challenge: {json.dumps(event, indent=2)}")
    
    request = event['request']
    response = event['response']
    
    # Get challenge history
    session = request.get('session', [])
    
    if len(session) == 0:
        # First challenge: Security Question (Factor 2)
        response['challengeName'] = 'CUSTOM_CHALLENGE'
        response['issueTokens'] = False
        response['failAuthentication'] = False
    elif len(session) == 1:
        # Check if Factor 2 passed
        if session[0]['challengeResult']:
            # Second challenge: Caesar Cipher (Factor 3)
            response['challengeName'] = 'CUSTOM_CHALLENGE'
            response['issueTokens'] = False
            response['failAuthentication'] = False
        else:
            # Factor 2 failed
            response['issueTokens'] = False
            response['failAuthentication'] = True
    elif len(session) == 2:
        # Check if Factor 3 passed
        if session[1]['challengeResult']:
            # All factors passed - issue tokens
            response['issueTokens'] = True
            response['failAuthentication'] = False
        else:
            # Factor 3 failed
            response['issueTokens'] = False
            response['failAuthentication'] = True
    else:
        # Too many attempts
        response['issueTokens'] = False
        response['failAuthentication'] = True
    
    print(f"Define Auth Response: {json.dumps(response, indent=2)}")
    return event