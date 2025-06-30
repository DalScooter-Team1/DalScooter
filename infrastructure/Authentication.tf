# Factor 1: Username/Password Authentication
resource "aws_cognito_user_pool" "pool" {
  name = "DalScooterUserPool"

  # Configure required user attributes
  schema {
    attribute_data_type = "String"
    name                = "email"
    required            = true
    mutable             = true
  }

  schema {
    attribute_data_type = "String" 
    name                = "given_name"
    required            = true
    mutable             = true
  }

  schema {
    attribute_data_type = "String"
    name                = "family_name" 
    required            = true
    mutable             = true
  }

  # Email as username
  username_attributes = ["email"]
  
  # Auto-verify email
  auto_verified_attributes = ["email"]

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }
  
  # Add this lifecycle block
  lifecycle {
    ignore_changes = [schema]
  }
}

# App client for the user pool

resource "aws_cognito_user_pool_client" "client" {
  name = "DalScooterAppClient"

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",  # For Factor 1 (username/password)
    "ALLOW_CUSTOM_AUTH",         # For your 3-factor custom flow
    "ALLOW_REFRESH_TOKEN_AUTH"   # For refreshing tokens
  ]

 
  user_pool_id = aws_cognito_user_pool.pool.id

  depends_on = [ aws_cognito_user_pool.pool ]
}

# Customer User Group
resource "aws_cognito_user_group" "customers" {
  name         = "customers"
  user_pool_id = aws_cognito_user_pool.pool.id
  description  = "Regular customers who can reserve bikes"
  precedence   = 2  # Lower number = higher priority
}

# Franchise User Group  
resource "aws_cognito_user_group" "franchise" {
  name         = "franchise" 
  user_pool_id = aws_cognito_user_pool.pool.id
  description  = "Franchise operators with admin privileges"
  precedence   = 1  # Higher priority than customers
}

# Factor 2: Question and Answer Authentication

# DynamoDB table for user security questions
resource "aws_dynamodb_table" "user_security_questions" {
  name           = "dalscooter-user-security-questions"
  billing_mode   = "PAY_PER_REQUEST"  # On-demand pricing
  hash_key       = "userId"           # Partition key
  range_key      = "questionId"       # Sort key

  attribute {
    name = "userId"
    type = "S"  # String
  }

  attribute {
    name = "questionId" 
    type = "S"  # String
  }



  # Tags for resource management
  tags = {
    Name        = "DALScooter User Security Questions"
    Project     = "DALScooter"
  }
}


# Registration

resource "aws_iam_role" "registration_lambda_role" {
  name = "dalscooter-registration-lambda-role"

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

resource "aws_iam_role_policy" "registration_lambda_policy" {
  name = "dalscooter-registration-lambda-policy"
  role = aws_iam_role.registration_lambda_role.id

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
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "cognito-idp:AdminAddUserToGroup",
          "cognito-idp:SignUp"
        ]
        Resource = aws_cognito_user_pool.pool.arn
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem"
        ]
        Resource = aws_dynamodb_table.user_security_questions.arn
      }
    ]
  })
}

# Create a directory for the package if it doesn't exist
resource "local_file" "create_packages_dir" {
  content     = ""
  filename    = "${path.module}/packages/.keep"
  
  provisioner "local-exec" {
    command = "mkdir -p ${path.module}/packages"
  }
}

# Create a zip file for the Lambda function from the Registration.py file
data "archive_file" "user_registration_zip" {
  type        = "zip"
  source_file = "${path.module}/../backend/User Management/Registration.py"
  output_path = "${path.module}/packages/user_registration.zip"
  depends_on  = [local_file.create_packages_dir]
}

resource "aws_lambda_function" "user_registration" {
  filename         = data.archive_file.user_registration_zip.output_path
  function_name    = "dalscooter-user-registration"
  role            = aws_iam_role.registration_lambda_role.arn
  handler         = "Registration.lambda_handler"  # Corrected handler name
  runtime         = "python3.9"
  timeout         = 30
  
  # This ensures the function is updated when the zip file changes
  source_code_hash = data.archive_file.user_registration_zip.output_base64sha256

  environment {
    variables = {
      COGNITO_USER_POOL_ID = aws_cognito_user_pool.pool.id
      COGNITO_CLIENT_ID    = aws_cognito_user_pool_client.client.id
      SECURITY_QUESTIONS_TABLE = aws_dynamodb_table.user_security_questions.name
    }
  }
}


resource "aws_api_gateway_rest_api" "registration_api" {
  name        = "dalscooter-registration-api"
  description = "DALScooter User Registration API"
}

resource "aws_api_gateway_resource" "register" {
  rest_api_id = aws_api_gateway_rest_api.registration_api.id
  parent_id   = aws_api_gateway_rest_api.registration_api.root_resource_id
  path_part   = "register"
}

resource "aws_api_gateway_method" "register_post" {
  rest_api_id   = aws_api_gateway_rest_api.registration_api.id
  resource_id   = aws_api_gateway_resource.register.id
  http_method   = "POST"
  authorization = "NONE"
}

# Add OPTIONS method for CORS preflight requests
resource "aws_api_gateway_method" "register_options" {
  rest_api_id   = aws_api_gateway_rest_api.registration_api.id
  resource_id   = aws_api_gateway_resource.register.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# Integration for OPTIONS method - mock integration
resource "aws_api_gateway_integration" "register_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.registration_api.id
  resource_id = aws_api_gateway_resource.register.id
  http_method = aws_api_gateway_method.register_options.http_method
  
  type = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

# Method response for OPTIONS
resource "aws_api_gateway_method_response" "register_options_response" {
  rest_api_id = aws_api_gateway_rest_api.registration_api.id
  resource_id = aws_api_gateway_resource.register.id
  http_method = aws_api_gateway_method.register_options.http_method
  status_code = "200"
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# Integration response for OPTIONS
resource "aws_api_gateway_integration_response" "register_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.registration_api.id
  resource_id = aws_api_gateway_resource.register.id
  http_method = aws_api_gateway_method.register_options.http_method
  status_code = aws_api_gateway_method_response.register_options_response.status_code
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

# Add CORS headers to POST method response
resource "aws_api_gateway_method_response" "register_post_response" {
  rest_api_id = aws_api_gateway_rest_api.registration_api.id
  resource_id = aws_api_gateway_resource.register.id
  http_method = aws_api_gateway_method.register_post.http_method
  status_code = "200"
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# Update the POST integration response to include CORS headers
resource "aws_api_gateway_integration_response" "register_post_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.registration_api.id
  resource_id = aws_api_gateway_resource.register.id
  http_method = aws_api_gateway_method.register_post.http_method
  status_code = aws_api_gateway_method_response.register_post_response.status_code
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  depends_on = [aws_api_gateway_integration.register_integration]
}

resource "aws_api_gateway_integration" "register_integration" {
  rest_api_id = aws_api_gateway_rest_api.registration_api.id
  resource_id = aws_api_gateway_resource.register.id
  http_method = aws_api_gateway_method.register_post.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.user_registration.invoke_arn
}

resource "aws_lambda_permission" "api_gateway_invoke_registration" {
  statement_id  = "AllowAPIGatewayInvokeRegistration"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.user_registration.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.registration_api.execution_arn}/*/*"
}

# Deploy API Gateway
resource "aws_api_gateway_deployment" "registration_deployment" {
  depends_on = [
    aws_api_gateway_method.register_post,
    aws_api_gateway_integration.register_integration
  ]

  rest_api_id = aws_api_gateway_rest_api.registration_api.id
  stage_name  = "prod"
}

# Output
output "registration_endpoint" {
  description = "Registration API endpoint"
  value       = "${aws_api_gateway_deployment.registration_deployment.invoke_url}/register"
}