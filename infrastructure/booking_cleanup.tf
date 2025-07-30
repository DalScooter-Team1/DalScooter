# IAM Role for Lambda 
resource "aws_iam_role" "booking_cleanup_lambda_role" {
  name = "booking-cleanup-lambda-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Principal = {
        Service = "lambda.amazonaws.com"
      },
      Action = "sts:AssumeRole"
    }]
  })
}

# IAM Policy for DynamoDB access
resource "aws_iam_role_policy" "booking_cleanup_policy" {
  name = "booking-cleanup-dynamodb-policy"
  role = aws_iam_role.booking_cleanup_lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "dynamodb:Scan",
          "dynamodb:UpdateItem",
          "dynamodb:GetItem"
        ],
        Resource = "arn:aws:dynamodb:${var.region}:${data.aws_caller_identity.current.account_id}:table/${var.booking_table_name}"
      },
      {
        Effect = "Allow",
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Resource = "*"
      }
    ]
  })
}

# Lambda Function (cleanup)
resource "aws_lambda_function" "booking_cleanup" {
  function_name    = "booking-cleanup-handler"
  filename         = "booking_cleanup.zip" # zipped code
  handler          = "booking_cleanup.lambda_handler"
  runtime          = "python3.9"
  role             = aws_iam_role.booking_cleanup_lambda_role.arn
  source_code_hash = filebase64sha256("booking_cleanup.zip")

  environment {
    variables = {
      BOOKING_TABLE_NAME = var.booking_table_name
    }
  }
}

# EventBridge Rule - triggers every 5 minutes
resource "aws_cloudwatch_event_rule" "booking_cleanup_schedule" {
  name                = "booking-cleanup-schedule"
  schedule_expression = "rate(5 minutes)"
}

# Permission for EventBridge to invoke Lambda
resource "aws_lambda_permission" "allow_eventbridge" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.booking_cleanup.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.booking_cleanup_schedule.arn
}

# Attach Lambda to EventBridge Rule
resource "aws_cloudwatch_event_target" "booking_cleanup_target" {
  rule      = aws_cloudwatch_event_rule.booking_cleanup_schedule.name
  target_id = "booking-cleanup-lambda"
  arn       = aws_lambda_function.booking_cleanup.arn
}
