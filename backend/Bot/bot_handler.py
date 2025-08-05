import os
import json
import logging
import uuid
from datetime import datetime
import boto3
from botocore.exceptions import BotoCoreError, ClientError

logger = logging.getLogger()
logger.setLevel(logging.INFO)

PUBLIC_INTENTS = {
    "welcome_intent",
    "login_navigation_intent",
    "register_navigation_intent",
    "bike_navigation_intent",
    "booking_navigation_intent",
    "help_intent"
}

lex = boto3.client("lexv2-runtime", region_name=os.environ.get("AWS_REGION","us-east-1"))

def lambda_handler(event, context):
    try:
        body = json.loads(event.get("body") or "{}")
    except json.JSONDecodeError:
        return _api_response(400, {"error": "Invalid JSON body"})

    session_id = body.get("sessionId")
    text       = body.get("text")
    user_type  = body.get("userType")
    user_id    = body.get("userId")

    if not text:
        return _api_response(400, {"error": "Missing text"})

    is_guest = user_type is None or user_type == "" or user_type == "guest"

    if not session_id:
        if not is_guest:
            session_id = user_id + user_type + str(uuid.uuid4()) + str(datetime.utcnow().timestamp())
        else:
            session_id = "guest" + str(uuid.uuid4()) + str(datetime.utcnow().timestamp())

    lex_params = {
        "botId":       os.environ["LEX_BOT_ID"],
        "botAliasId":  os.environ["LEX_BOT_ALIAS_ID"],
        "localeId":    os.environ.get("LEX_LOCALE", "en_US"),
        "sessionId":   session_id,
        "text":        text,
        "sessionState": {
            "sessionAttributes": {
                **({"userType": user_type} if user_type else {}),
                **({"userId": user_id}     if user_id   else {}),
            }
        }
    }

    try:
        lex_res = lex.recognize_text(**lex_params)
    except (BotoCoreError, ClientError) as err:
        logger.error("Lex error: %s", err)
        return _api_response(500, {"error": "Bot service unavailable"})

    intent_name = (
        lex_res.get("sessionState", {})
        .get("intent", {})
        .get("name")
    )
    if is_guest and intent_name and intent_name not in PUBLIC_INTENTS:
        return _api_response(200, {
            "authorized": False,
            "message":    "Sorry, you need to log in before using that feature."
        })

    messages = lex_res.get("messages", [])
    user_message = "\n".join(m.get("content", "") for m in messages)

    return _api_response(200, {
        "authorized": True,
        "intent":     intent_name,
        "message":    user_message,
        "session":    lex_res.get("sessionState", {}).get("sessionAttributes", {}),
        "sessionId":  lex_res.get("sessionId", "")
    })


def _api_response(status_code: int, body: dict):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS"
        },
        "body": json.dumps(body)
    }
