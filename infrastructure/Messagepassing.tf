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

# API Gateway CORS Resource
resource "aws_api_gateway_resource" "cors" {
  rest_api_id = module.apis.api_gateway_id
  parent_id   = module.apis.api_gateway_root_resource_id
  path_part   = "cors"
}

resource "aws_api_gateway_method" "cors_options" {
  rest_api_id   = module.apis.api_gateway_id
  resource_id   = aws_api_gateway_resource.cors.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "cors_options_integration" {
  rest_api_id = module.apis.api_gateway_id
  resource_id = aws_api_gateway_resource.cors.id
  http_method = aws_api_gateway_method.cors_options.http_method
  type        = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "cors_options_response" {
  rest_api_id = module.apis.api_gateway_id
  resource_id = aws_api_gateway_resource.cors.id
  http_method = aws_api_gateway_method.cors_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "cors_options_integration_response" {
  rest_api_id = module.apis.api_gateway_id
  resource_id = aws_api_gateway_resource.cors.id
  http_method = aws_api_gateway_method.cors_options.http_method
  status_code = aws_api_gateway_method_response.cors_options_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

# API Gateway Endpoints
resource "aws_api_gateway_resource" "submit_concern" {
  rest_api_id = module.apis.api_gateway_id
  parent_id   = module.apis.api_gateway_root_resource_id
  path_part   = "submit-concern"
}

resource "aws_api_gateway_method" "submit_concern_post" {
  rest_api_id   = module.apis.api_gateway_id
  resource_id   = aws_api_gateway_resource.submit_concern.id
  http_method   = "POST"
  authorization = "CUSTOM"
  authorizer_id = module.apis.customer_authorizer_id
}

resource "aws_api_gateway_integration" "submit_concern_integration" {
  rest_api_id             = module.apis.api_gateway_id
  resource_id             = aws_api_gateway_resource.submit_concern.id
  http_method             = aws_api_gateway_method.submit_concern_post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.submit_concern.invoke_arn
}

resource "aws_api_gateway_method_response" "submit_concern_response" {
  rest_api_id = module.apis.api_gateway_id
  resource_id = aws_api_gateway_resource.submit_concern.id
  http_method = aws_api_gateway_method.submit_concern_post.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_integration_response" "submit_concern_integration_response" {
  rest_api_id = module.apis.api_gateway_id
  resource_id = aws_api_gateway_resource.submit_concern.id
  http_method = aws_api_gateway_method.submit_concern_post.http_method
  status_code = aws_api_gateway_method_response.submit_concern_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  depends_on = [aws_api_gateway_integration.submit_concern_integration]
}

resource "aws_api_gateway_resource" "respond_concern" {
  rest_api_id = module.apis.api_gateway_id
  parent_id   = module.apis.api_gateway_root_resource_id
  path_part   = "respond-concern"
}

resource "aws_api_gateway_method" "respond_concern_post" {
  rest_api_id   = module.apis.api_gateway_id
  resource_id   = aws_api_gateway_resource.respond_concern.id
  http_method   = "POST"
  authorization = "CUSTOM"
  authorizer_id = module.apis.customer_authorizer_id
}

resource "aws_api_gateway_integration" "respond_concern_integration" {
  rest_api_id             = module.apis.api_gateway_id
  resource_id             = aws_api_gateway_resource.respond_concern.id
  http_method             = aws_api_gateway_method.respond_concern_post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.respond_concern.invoke_arn
}

resource "aws_api_gateway_method_response" "respond_concern_response" {
  rest_api_id = module.apis.api_gateway_id
  resource_id = aws_api_gateway_resource.respond_concern.id
  http_method = aws_api_gateway_method.respond_concern_post.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_integration_response" "respond_concern_integration_response" {
  rest_api_id = module.apis.api_gateway_id
  resource_id = aws_api_gateway_resource.respond_concern.id
  http_method = aws_api_gateway_method.respond_concern_post.http_method
  status_code = aws_api_gateway_method_response.respond_concern_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  depends_on = [aws_api_gateway_integration.respond_concern_integration]
}

resource "aws_api_gateway_resource" "messages" {
  rest_api_id = module.apis.api_gateway_id
  parent_id   = module.apis.api_gateway_root_resource_id
  path_part   = "messages"
}

resource "aws_api_gateway_method" "messages_get" {
  rest_api_id   = module.apis.api_gateway_id
  resource_id   = aws_api_gateway_resource.messages.id
  http_method   = "GET"
  authorization = "CUSTOM"
  authorizer_id = module.apis.customer_authorizer_id
}

resource "aws_api_gateway_integration" "messages_integration" {
  rest_api_id             = module.apis.api_gateway_id
  resource_id             = aws_api_gateway_resource.messages.id
  http_method             = aws_api_gateway_method.messages_get.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.get_concerns.invoke_arn
}

resource "aws_api_gateway_method_response" "messages_response" {
  rest_api_id = module.apis.api_gateway_id
  resource_id = aws_api_gateway_resource.messages.id
  http_method = aws_api_gateway_method.messages_get.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_integration_response" "messages_integration_response" {
  rest_api_id = module.apis.api_gateway_id
  resource_id = aws_api_gateway_resource.messages.id
  http_method = aws_api_gateway_method.messages_get.http_method
  status_code = aws_api_gateway_method_response.messages_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  depends_on = [aws_api_gateway_integration.messages_integration]
}

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

resource "aws_api_gateway_deployment" "registration_deployment" {
  rest_api_id = module.apis.api_gateway_id
  stage_name  = "prod"

  depends_on = [
    aws_api_gateway_method.submit_concern_post,
    aws_api_gateway_integration.submit_concern_integration,
    aws_api_gateway_method.respond_concern_post,
    aws_api_gateway_integration.respond_concern_integration,
    aws_api_gateway_method.messages_get,
    aws_api_gateway_integration.messages_integration,
    aws_api_gateway_method.cors_options,
    aws_api_gateway_integration.cors_options_integration
  ]

  lifecycle {
    create_before_destroy = true
  }
}
