import os
import logging
import boto3
import json
from botocore.exceptions import ClientError

logger = logging.getLogger()
logger.setLevel(logging.INFO)

BOOKING_TABLE = os.environ["BOOKING_TABLE"]

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(BOOKING_TABLE)
lambda_client      = boto3.client("lambda")
CONCERN_FN_ARN     = os.environ["CONCERNS_SUBMIT_LAMBDA_ARN"]

def build_response(event, message, session_attributes=None):
    """
    Build a Lex V2 Close response.
    """
    return {
        "sessionState": {
            "dialogAction": {"type": "Close"},
            "intent": {
                "name": event["sessionState"]["intent"]["name"],
                "state": "Fulfilled"
            },
            "sessionAttributes": session_attributes or {}
        },
        "messages": [
            {"contentType": "PlainText", "content": message}
        ]
    }

def lambda_handler(event, context):
    logger.info("Event received: %s", event)
    session_state = event.get("sessionState", {})
    session_attrs = session_state.get("sessionAttributes", {}) or {}
    intent_name   = session_state.get("intent", {}).get("name")
    user_type = session_attrs.get("userType")
    user_id = session_attrs.get("userId")

    logger.info("intent: %s", intent_name)

    slots      = session_state["intent"]["slots"]

    if intent_name == "raise_concern_intent":
        ref_value  = slots["booking_reference_concern"]["value"]
        booking_ref = ref_value.get("interpretedValue") if ref_value else None
        # only CUSTOMERS can raise concerns
        if user_type != "customers":
            return build_response(
                event,
                "Only customers can raise booking concerns. Please log in as a customer.",
                session_attrs
            )

        if not booking_ref:
            return build_response(
                event,
                "I am missing your booking reference number. Please provide it to raise a concern.",
                session_attrs
            )

        concern_text = f"I have a concern regarding my booking {booking_ref}."

        payload = {
            "body": json.dumps({"content": concern_text}),
            "requestContext": {
                "authorizer": {
                    "claims": {"sub": user_id}
                }
            }
        }

        try:
            lambda_client.invoke(
                FunctionName   = CONCERN_FN_ARN,
                InvocationType = "Event",
                Payload        = json.dumps(payload).encode("utf-8")
            )
            reply = f"Your concern for booking {booking_ref} has been submitted. We will follow up shortly. Keep checking your message chat."
        except Exception as e:
            logger.error("Concern submission failed: %s", e)
            reply = "Sorry, I could not submit your concern right now. Please try again later."

        return build_response(event, reply, session_attrs)

    if intent_name == "franchise_booking_intent":
        ref_value  = slots["booking_reference_franchise"]["value"]
        booking_ref = ref_value.get("interpretedValue") if ref_value else None

        if not booking_ref:
            return build_response(event, f"I am missing your booking reference number. Please try again by refreshing.", session_attrs)

        if user_id is None or user_type is None:
            return build_response(event, f"I am missing user details. Please contact Technical Support.", session_attrs)

        if user_type != "franchise":
            return build_response(event, f"Only franchise operators can fetch bike details of a booking. Please log in as a franchise.", session_attrs)

        try:
            resp = table.get_item(Key={"bookingId": booking_ref})
            booking = resp.get("Item")
        except ClientError as e:
            logger.error("DynamoDB error: %s", e)
            return build_response(event, f"Sorry, I had trouble looking up your booking. Please try again later.", session_attrs)

        if not booking:
            return build_response(event, f"I could not find any booking with reference {booking_ref}. Please check your booking reference and try again.", session_attrs)

        bike_id = booking.get("bikeId")
        start_time = booking.get("startTime")[11:16]
        end_time = booking.get("endTime")[11:16]

        return build_response(event, f"With booking reference you provided, here is the bike number {bike_id}. This booking starts at {start_time} and ends at {end_time}.", session_attrs)


    if intent_name == "fetch_booking_intent":
        ref_value  = slots["booking_reference_customer"]["value"]
        booking_ref = ref_value.get("interpretedValue") if ref_value else None

        if not booking_ref:
            return build_response(event, f"I am missing your booking reference number. Please try again by refreshing.", session_attrs)

        if user_id is None or user_type is None:
            return build_response(event, f"I am missing user details. Please contact Technical Support.", session_attrs)

        if user_type != "customers":
            return build_response(event, f"Only customers can fetch access code of a booking. Please log in as a customer.", session_attrs)

        try:
            resp = table.get_item(Key={"bookingId": booking_ref})
            booking = resp.get("Item")
        except ClientError as e:
            logger.error("DynamoDB error: %s", e)
            return build_response(event, f"Sorry, I had trouble looking up your booking. Please try again later.", session_attrs)

        if not booking:
            return build_response(event, f"I could not find any booking with reference {booking_ref}. Please check your booking reference and try again.", session_attrs)

        if booking.get("userId") != user_id:
            return build_response(event, f"That booking reference is not linked to your account. Please provide one you made.", session_attrs)

        if booking.get("isUsed") == True:
            return build_response(event, f"You have used the Access Code. Book a new bike!", session_attrs)

        access_code = booking.get("accessCode")
        start_time = booking.get("startTime")[11:16]
        end_time = booking.get("endTime")[11:16]

        if not access_code or access_code == "":
            return build_response(event, f"Your booking was found, but there is no access code available. Please contact support.", session_attrs)

        return build_response(event, f"Your access code for booking {booking_ref} is {access_code}. Your booking starts at {start_time} and ends at {end_time}. Enjoy your ride!", session_attrs)
