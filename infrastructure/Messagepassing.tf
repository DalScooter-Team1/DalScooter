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
          "dynamodb:Query",
          "dynamodb:Scan"
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

# Get My Messages Lambda (for customers)
data "archive_file" "get_my_messages_zip" {
  type        = "zip"
  source_file = "${path.module}/../backend/MessagePassing/get_my_messages.py"
  output_path = "${path.module}/packages/get_my_messages.zip"
}

resource "aws_lambda_function" "get_my_messages" {
  filename         = data.archive_file.get_my_messages_zip.output_path
  function_name    = "dalscooter-get-my-messages"
  role             = aws_iam_role.message_lambda_role.arn
  handler          = "get_my_messages.lambda_handler"
  runtime          = "python3.9"
  timeout          = 30
  source_code_hash = data.archive_file.get_my_messages_zip.output_base64sha256

  environment {
    variables = {
      MESSAGES_TABLE_NAME = aws_dynamodb_table.messages.name
    }
  }
}

# Get Customer Messages Lambda (for customers to get their own messages and responses)
data "archive_file" "get_customer_messages_zip" {
  type        = "zip"
  source_file = "${path.module}/../backend/MessagePassing/get_customer_messages.py"
  output_path = "${path.module}/packages/get_customer_messages.zip"
}

resource "aws_lambda_function" "get_customer_messages" {
  filename         = data.archive_file.get_customer_messages_zip.output_path
  function_name    = "dalscooter-get-customer-messages"
  role             = aws_iam_role.message_lambda_role.arn
  handler          = "get_customer_messages.lambda_handler"
  runtime          = "python3.9"
  timeout          = 30
  source_code_hash = data.archive_file.get_customer_messages_zip.output_base64sha256

  environment {
    variables = {
      MESSAGES_TABLE_NAME = aws_dynamodb_table.messages.name
    }
  }
}

# NOTE: API Gateway resources are managed by the modules/apis module
# No API Gateway resources needed here

resource "aws_lambda_permission" "api_gateway_invoke_submit_concern" {
  statement_id  = "AllowAPIGatewayInvokeSubmitConcern"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.submit_concern.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${module.apis.api_gateway_execution_arn}/*/POST/submit-concern"
}

resource "aws_lambda_permission" "api_gateway_invoke_respond_concern" {
  statement_id  = "AllowAPIGatewayInvokeRespondConcern"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.respond_concern.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${module.apis.api_gateway_execution_arn}/*/POST/respond-concern"
}

resource "aws_lambda_permission" "api_gateway_invoke_get_concerns" {
  statement_id  = "AllowAPIGatewayInvokeGetConcerns"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_concerns.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${module.apis.api_gateway_execution_arn}/*/GET/messages"
}

resource "aws_lambda_permission" "api_gateway_invoke_get_my_messages" {
  statement_id  = "AllowAPIGatewayInvokeGetMyMessages"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_my_messages.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${module.apis.api_gateway_execution_arn}/*/GET/my-messages"
}

resource "aws_lambda_permission" "api_gateway_invoke_get_customer_messages" {
  statement_id  = "AllowAPIGatewayInvokeGetCustomerMessages"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_customer_messages.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${module.apis.api_gateway_execution_arn}/*/GET/customer-messages"
}


