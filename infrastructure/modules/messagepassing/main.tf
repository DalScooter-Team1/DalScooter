# Message Passing Module
# This module contains resources related to message passing

# DynamoDB Table for Messages
resource "aws_dynamodb_table" "messages" {
  name         = "dalscooter-messages"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "messageId"
  range_key    = "timestamp"

  attribute {
    name = "messageId"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "N"
  }

  global_secondary_index {
    name            = "timestamp-index"
    hash_key        = "timestamp"
    projection_type = "ALL"
  }

  tags = {
    Name    = "DALScooter Messages"
    Project = "DALScooter"
  }
}

# IAM Role for Message Passing Lambda Functions
resource "aws_iam_role" "message_lambda_role" {
  name = "dalscooter-message-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_lambda_function" "submit_concern" {
  filename      = "../backend/MessagePassing/submit_concern.py"
  function_name = "dalscooter-submit-concern"
  role          = aws_iam_role.message_lambda_role.arn
  handler       = "submit_concern.lambda_handler"
  runtime       = "python3.9"
  timeout       = 30

  environment {
    variables = {
      MESSAGES_TABLE_NAME = aws_dynamodb_table.messages.name
    }
  }
}

resource "aws_lambda_function" "respond_concern" {
  filename      = "../backend/MessagePassing/respond_concern.py"
  function_name = "dalscooter-respond-concern"
  role          = aws_iam_role.message_lambda_role.arn
  handler       = "respond_concern.lambda_handler"
  runtime       = "python3.9"
  timeout       = 30

  environment {
    variables = {
      MESSAGES_TABLE_NAME = aws_dynamodb_table.messages.name
    }
  }
}

resource "aws_lambda_function" "get_concerns" {
  filename      = "../backend/MessagePassing/get_concerns.py"
  function_name = "dalscooter-get-concerns"
  role          = aws_iam_role.message_lambda_role.arn
  handler       = "get_concerns.lambda_handler"
  runtime       = "python3.9"
  timeout       = 30

  environment {
    variables = {
      MESSAGES_TABLE_NAME = aws_dynamodb_table.messages.name
    }
  }
}

output "messages_table_name" {
  description = "Name of the messages DynamoDB table"
  value       = aws_dynamodb_table.messages.name
}

output "message_lambda_role_arn" {
  description = "ARN of the message lambda role"
  value       = aws_iam_role.message_lambda_role.arn
}

output "submit_concern_lambda_arn" {
  description = "ARN of the submit concern Lambda function"
  value       = aws_lambda_function.submit_concern.arn
}

output "submit_concern_lambda_invoke_arn" {
  description = "Invoke ARN of the submit concern Lambda function"
  value       = aws_lambda_function.submit_concern.invoke_arn
}

output "respond_concern_lambda_arn" {
  description = "ARN of the respond concern Lambda function"
  value       = aws_lambda_function.respond_concern.arn
}

output "respond_concern_lambda_invoke_arn" {
  description = "Invoke ARN of the respond concern Lambda function"
  value       = aws_lambda_function.respond_concern.invoke_arn
}

output "get_concerns_lambda_arn" {
  description = "ARN of the get concerns Lambda function"
  value       = aws_lambda_function.get_concerns.arn
}

output "get_concerns_lambda_invoke_arn" {
  description = "Invoke ARN of the get concerns Lambda function"
  value       = aws_lambda_function.get_concerns.invoke_arn
}
