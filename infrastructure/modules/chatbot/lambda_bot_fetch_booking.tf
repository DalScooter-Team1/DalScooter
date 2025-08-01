############################
# Bot Fetch Booking Lambda
############################

# IAM Role
resource "aws_iam_role" "bot_fetch_booking_role" {
  name = "dalscooter-bot-fetch-booking-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

# IAM Policy
resource "aws_iam_role_policy" "bot_fetch_booking_policy" {
  name = "dalscooter-bot-fetch-booking-policy"
  role = aws_iam_role.bot_fetch_booking_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect   = "Allow"
        Action   = ["dynamodb:GetItem"]
        Resource = "arn:aws:dynamodb:us-east-1:${data.aws_caller_identity.current.account_id}:*"
      },
      {
        Effect   = "Allow"
        Action   = ["lambda:InvokeFunction"]
        Resource = var.submit_concern_lambda_arn
      }
    ]
  })
}

# Package the code
data "archive_file" "bot_fetch_booking_zip" {
  type        = "zip"
  source_file = "${path.module}/../../../backend/Bot/bot_fetch_booking.py"
  output_path = "${path.module}/../../packages/bot_fetch_booking.zip"

  # depends_on = [ local_file.create_packages_dir ]
}

# resource "local_file" "create_packages_dir" {
#   content  = ""
#   # Use backslashes here so Windows CMD can handle it
#   filename = "${path.module}\\..\\..\\packages\\.keep"
#
#   provisioner "local-exec" {
#     # Use Windows cmd to make the directory (it auto‑creates any missing parents)
#     command = "cmd /C mkdir \"${path.module}\\..\\..\\packages\""
#   }
# }

# Lambda Function
resource "aws_lambda_function" "bot_fetch_booking" {
  function_name = "dalscooter-bot-fetch-booking"
  filename      = data.archive_file.bot_fetch_booking_zip.output_path
  handler       = "bot_fetch_booking.lambda_handler"
  runtime       = "python3.9"
  role          = aws_iam_role.bot_fetch_booking_role.arn
  timeout       = 30

  environment {
    variables = {
      BOOKING_TABLE = var.booking_table_name,
      CONCERNS_SUBMIT_LAMBDA_ARN = var.submit_concern_lambda_arn
    }
  }

  source_code_hash = data.archive_file.bot_fetch_booking_zip.output_base64sha256

  depends_on = [
    aws_iam_role_policy.bot_fetch_booking_policy
  ]
}

# Log Group
resource "aws_cloudwatch_log_group" "bot_fetch_booking_log_group" {
  name              = "/aws/lambda/dalscooter-bot-fetch-booking"
  retention_in_days = 14
}

# Allow Lex to invoke
resource "aws_lambda_permission" "allow_lex_v2_invoke_bot_fetch_booking" {
  statement_id  = "AllowLexInvokeFetchBooking"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.bot_fetch_booking.function_name
  principal     = "lexv2.amazonaws.com"
  source_arn    = "arn:aws:lex:us-east-1:${data.aws_caller_identity.current.account_id}:bot-alias/${aws_lexv2models_bot.chatbot.id}/TSTALIASID"
}

data "aws_caller_identity" "me" {}


