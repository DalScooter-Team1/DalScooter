############################
# BotHandler Lambda
############################

# IAM Role
resource "aws_iam_role" "bot_handler_role" {
  name = "dalscooter-bot-handler-role"

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
resource "aws_iam_role_policy" "bot_handler_policy" {
  name = "dalscooter-bot-handler-policy"
  role = aws_iam_role.bot_handler_role.id

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
        Action   = [
          "lex:*"
        ]
        Resource = "*"
      }
    ]
  })
}

# Package the code
data "archive_file" "bot_handler_zip" {
  type        = "zip"
  source_file = "${path.module}/../../../backend/Bot/bot_handler.py"
  output_path = "${path.module}/../../packages/bot_handler.zip"
}

# Lambda Function
resource "aws_lambda_function" "bot_handler" {
  function_name = "dalscooter-bot-handler"
  filename      = data.archive_file.bot_handler_zip.output_path
  handler       = "bot_handler.lambda_handler"
  runtime       = "python3.9"
  role          = aws_iam_role.bot_handler_role.arn
  timeout       = 30

  environment {
    variables = {
      LEX_BOT_ID       = aws_lexv2models_bot.chatbot.id
      LEX_BOT_ALIAS_ID = "TSTALIASID"
      LEX_LOCALE       = aws_lexv2models_bot_locale.chatbot_locale.locale_id
    }
  }

  source_code_hash = data.archive_file.bot_handler_zip.output_base64sha256

  depends_on = [
    aws_iam_role_policy.bot_handler_policy
  ]
}

# Log Group
resource "aws_cloudwatch_log_group" "bot_handler_log_group" {
  name              = "/aws/lambda/dalscooter-bot-handler"
  retention_in_days = 14
}

# Allow API Gateway to invoke BotHandler
resource "aws_lambda_permission" "allow_apigw_invoke_bot_handler" {
  statement_id  = "AllowAPIGatewayInvokeBotHandler"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.bot_handler.function_name
  principal     = "apigateway.amazonaws.com"
}
