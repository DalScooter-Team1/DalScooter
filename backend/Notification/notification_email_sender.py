import os
import json
import logging
import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Environment variables
SES_REGION       = os.getenv("SES_REGION", "us-east-1")
SES_FROM_ADDRESS = os.getenv("SES_FROM_ADDRESS")  # e.g. "no-reply@yourdomain.com"

ses = boto3.client("ses", region_name=SES_REGION)

def lambda_handler(event, context):
    """
    Supports:
      • Direct invoke:     event={"toEmail":..., "subject":..., "bodyText":..., "bodyHtml":...}
      • SQS:               event["Records"] = [ { body: JSON(email spec) }, … ]
      • EventBridge:       event["detail"] = {…email spec…}

    Required keys:
      - toEmail  : [strings]
      - subject  : string
      - bodyText : string

    Optional:
      - bodyHtml : string
    """
    #Aggregate incoming messages
    messages = []
    if "Records" in event:
        for r in event["Records"]:
            try:
                messages.append(json.loads(r["body"]))
            except json.JSONDecodeError:
                logger.error("Invalid JSON in SQS record: %s", r["body"])
    elif "detail" in event:
        messages.append(event["detail"])
    else:
        messages.append(event)

    results = []
    for msg in messages:
        #Normalize recipients
        to_addrs = msg.get("toEmail")
        if isinstance(to_addrs, str):
            to_addrs = [to_addrs]
        if not to_addrs:
            logger.error("Skipping message, no toEmail: %s", msg)
            continue

        #Extract subject/body
        subject   = msg.get("subject", "(No Subject)")
        body_text = msg.get("bodyText", "")
        body_html = msg.get("bodyHtml")

        #Build SES payload
        body = {"Text": {"Data": body_text}}
        if body_html:
            body["Html"] = {"Data": body_html}

        params = {
            "Source": SES_FROM_ADDRESS,
            "Destination": {"ToAddresses": to_addrs},
            "Message": {
                "Subject": {"Data": subject},
                "Body":    body
            }
        }

        #Send email
        try:
            resp = ses.send_email(**params)
            msg_id = resp["MessageId"]
            logger.info("Sent to %s, MessageId=%s", to_addrs, msg_id)
            results.append({"to": to_addrs, "messageId": msg_id})
        except ClientError as err:
            logger.error("Failed to send to %s: %s", to_addrs, err)
            results.append({"to": to_addrs, "error": str(err)})

    return {"statusCode": 200, "results": results}
