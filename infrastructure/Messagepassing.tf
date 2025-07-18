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

  attribute {
    name = "franchiseId"
    type = "S"
  }

  global_secondary_index {
    name            = "franchiseId-index"
    hash_key        = "franchiseId"
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

resource "aws_iam_role_policy" "message_lambda_policy" {
  name = "dalscooter-message-lambda-policy"
  role = aws_iam_role.message_lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:Query"
        ]
        Resource = [
          aws_dynamodb_table.messages.arn,
          "${aws_dynamodb_table.messages.arn}/index/franchiseId-index"
        ]
      }
    ]
  })
}

# Submit Concern Lambda
data "archive_file" "submit_concern_zip" {
  type        = "zip"
  source_file = "${path.module}/../backend/MessagePassing/submit_concern.py"
  output_path = "${path.module}/packages/submit_concern.zip"
}

resource "aws_lambda_function" "submit_concern" {
  filename         = data.archive_file.submit_concern_zip.output_path
  function_name    = "dalscooter-submit-concern"
  role             = aws_iam_role.message_lambda_role.arn
  handler          = "submit_concern.lambda_handler"
  runtime          = "python3.9"
  timeout          = 30
  source_code_hash = data.archive_file.submit_concern_zip.output_base64sha256

  environment {
    variables = {
      MESSAGES_TABLE_NAME = aws_dynamodb_table.messages.name
    }
  }
}

# Respond Concern Lambda
data "archive_file" "respond_concern_zip" {
  type        = "zip"
  source_file = "${path.module}/../backend/MessagePassing/respond_concern.py"
  output_path = "${path.module}/packages/respond_concern.zip"
}

resource "aws_lambda_function" "respond_concern" {
  filename         = data.archive_file.respond_concern_zip.output_path
  function_name    = "dalscooter-respond-concern"
  role             = aws_iam_role.message_lambda_role.arn
  handler          = "respond_concern.lambda_handler"
  runtime          = "python3.9"
  timeout          = 30
  source_code_hash = data.archive_file.respond_concern_zip.output_base64sha256

  environment {
    variables = {
      MESSAGES_TABLE_NAME = aws_dynamodb_table.messages.name
    }
  }
}

# Get Concerns Lambda
data "archive_file" "get_concerns_zip" {
  type        = "zip"
  source_file = "${path.module}/../backend/MessagePassing/get_concerns.py"
  output_path = "${path.module}/packages/get_concerns.zip"
}

resource "aws_lambda_function" "get_concerns" {
  filename         = data.archive_file.get_concerns_zip.output_path
  function_name    = "dalscooter-get-concerns"
  role             = aws_iam_role.message_lambda_role.arn
  handler          = "get_concerns.lambda_handler"
  runtime          = "python3.9"
  timeout          = 30
  source_code_hash = data.archive_file.get_concerns_zip.output_base64sha256

  environment {
    variables = {
      MESSAGES_TABLE_NAME = aws_dynamodb_table.messages.name
    }
  }
}

# Output Lambda ARNs for message passing so they can be referenced in other modules
output "submit_concern_lambda_arn" {
  value = aws_lambda_function.submit_concern.arn
}

output "respond_concern_lambda_arn" {
  value = aws_lambda_function.respond_concern.arn
}

output "get_concerns_lambda_arn" {
  value = aws_lambda_function.get_concerns.arn
}

# Note: API Gateway resources for messagepassing are already defined in the apis module
