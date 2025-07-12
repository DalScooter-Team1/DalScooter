# API Gateway for DALScooter application
resource "aws_api_gateway_rest_api" "registration_api" {
  name        = "dalscooter-registration-api"
  description = "DALScooter User Registration API"
}

# Registration endpoint
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

# Admin endpoint
# API Gateway Resource for Admin Creation
resource "aws_api_gateway_resource" "admin" {
  rest_api_id = aws_api_gateway_rest_api.registration_api.id
  parent_id   = aws_api_gateway_rest_api.registration_api.root_resource_id
  path_part   = "admin"
}

# API Gateway Method for Admin Creation (POST)
resource "aws_api_gateway_method" "admin_post" {
  rest_api_id   = aws_api_gateway_rest_api.registration_api.id
  resource_id   = aws_api_gateway_resource.admin.id
  http_method   = "POST"
  authorization = "NONE"
}

# API Gateway Integration for Admin Creation
resource "aws_api_gateway_integration" "admin_integration" {
  rest_api_id = aws_api_gateway_rest_api.registration_api.id
  resource_id = aws_api_gateway_resource.admin.id
  http_method = aws_api_gateway_method.admin_post.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.admin_creation.invoke_arn
}

# Method response for POST with CORS headers
resource "aws_api_gateway_method_response" "admin_post_response" {
  rest_api_id = aws_api_gateway_rest_api.registration_api.id
  resource_id = aws_api_gateway_resource.admin.id
  http_method = aws_api_gateway_method.admin_post.http_method
  status_code = "200"
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
  }
}

# Integration response for POST with CORS headers
resource "aws_api_gateway_integration_response" "admin_post_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.registration_api.id
  resource_id = aws_api_gateway_resource.admin.id
  http_method = aws_api_gateway_method.admin_post.http_method
  status_code = aws_api_gateway_method_response.admin_post_response.status_code
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST, OPTIONS'"
  }

  depends_on = [aws_api_gateway_integration.admin_integration]
}

# OPTIONS method for CORS preflight requests
resource "aws_api_gateway_method" "admin_options" {
  rest_api_id   = aws_api_gateway_rest_api.registration_api.id
  resource_id   = aws_api_gateway_resource.admin.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# Integration for OPTIONS method - mock integration
resource "aws_api_gateway_integration" "admin_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.registration_api.id
  resource_id = aws_api_gateway_resource.admin.id
  http_method = aws_api_gateway_method.admin_options.http_method
  
  type = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

# Method response for OPTIONS with CORS headers
resource "aws_api_gateway_method_response" "admin_options_response" {
  rest_api_id = aws_api_gateway_rest_api.registration_api.id
  resource_id = aws_api_gateway_resource.admin.id
  http_method = aws_api_gateway_method.admin_options.http_method
  status_code = "200"
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# Integration response for OPTIONS with CORS headers
resource "aws_api_gateway_integration_response" "admin_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.registration_api.id
  resource_id = aws_api_gateway_resource.admin.id
  http_method = aws_api_gateway_method.admin_options.http_method
  status_code = aws_api_gateway_method_response.admin_options_response.status_code
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

# Lambda Permission for API Gateway to invoke Admin Creation Lambda
resource "aws_lambda_permission" "api_gateway_invoke_admin_creation" {
  statement_id  = "AllowAPIGatewayInvokeAdminCreation"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.admin_creation.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.registration_api.execution_arn}/*/*"
}

# Deploy API Gateway with all endpoints
resource "aws_api_gateway_deployment" "registration_deployment" {
  depends_on = [
    aws_api_gateway_method.register_post,
    aws_api_gateway_integration.register_integration,
    aws_api_gateway_method.admin_post,
    aws_api_gateway_integration.admin_integration,
    aws_api_gateway_method.admin_options,
    aws_api_gateway_integration.admin_options_integration,
    aws_api_gateway_method.customer_test_get,
    aws_api_gateway_integration.customer_test_integration,
    aws_api_gateway_method.franchise_test_get,
    aws_api_gateway_integration.franchise_test_integration
  ]

  rest_api_id = aws_api_gateway_rest_api.registration_api.id
  
  stage_name  = "prod"
  lifecycle {
    create_before_destroy = true
  }
}

# ================================
# AUTHORIZERS
# ================================

# Customer Authorizer
resource "aws_api_gateway_authorizer" "customer_authorizer" {
  name                   = "customer-authorizer"
  rest_api_id           = aws_api_gateway_rest_api.registration_api.id
  authorizer_uri        = aws_lambda_function.customer_authenticator.invoke_arn
  authorizer_credentials = aws_iam_role.authorizer_invocation_role.arn
  type                  = "TOKEN"
  identity_source       = "method.request.header.Authorization"
}

# Franchise Authorizer
resource "aws_api_gateway_authorizer" "franchise_authorizer" {
  name                   = "franchise-authorizer"
  rest_api_id           = aws_api_gateway_rest_api.registration_api.id
  authorizer_uri        = aws_lambda_function.admin_authenticator.invoke_arn
  authorizer_credentials = aws_iam_role.authorizer_invocation_role.arn
  type                  = "TOKEN"
  identity_source       = "method.request.header.Authorization"
}

# ================================
# TEST ENDPOINTS
# ================================

# Customer Test Endpoint
resource "aws_api_gateway_resource" "customer_test" {
  rest_api_id = aws_api_gateway_rest_api.registration_api.id
  parent_id   = aws_api_gateway_rest_api.registration_api.root_resource_id
  path_part   = "customer-test"
}

resource "aws_api_gateway_method" "customer_test_get" {
  rest_api_id   = aws_api_gateway_rest_api.registration_api.id
  resource_id   = aws_api_gateway_resource.customer_test.id
  http_method   = "GET"
  authorization = "CUSTOM"
  authorizer_id = aws_api_gateway_authorizer.customer_authorizer.id
}

resource "aws_api_gateway_integration" "customer_test_integration" {
  rest_api_id = aws_api_gateway_rest_api.registration_api.id
  resource_id = aws_api_gateway_resource.customer_test.id
  http_method = aws_api_gateway_method.customer_test_get.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.customer_test.invoke_arn
}

resource "aws_api_gateway_method_response" "customer_test_response" {
  rest_api_id = aws_api_gateway_rest_api.registration_api.id
  resource_id = aws_api_gateway_resource.customer_test.id
  http_method = aws_api_gateway_method.customer_test_get.http_method
  status_code = "200"
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_integration_response" "customer_test_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.registration_api.id
  resource_id = aws_api_gateway_resource.customer_test.id
  http_method = aws_api_gateway_method.customer_test_get.http_method
  status_code = aws_api_gateway_method_response.customer_test_response.status_code
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  depends_on = [aws_api_gateway_integration.customer_test_integration]
}

# Franchise Test Endpoint
resource "aws_api_gateway_resource" "franchise_test" {
  rest_api_id = aws_api_gateway_rest_api.registration_api.id
  parent_id   = aws_api_gateway_rest_api.registration_api.root_resource_id
  path_part   = "franchise-test"
}

resource "aws_api_gateway_method" "franchise_test_get" {
  rest_api_id   = aws_api_gateway_rest_api.registration_api.id
  resource_id   = aws_api_gateway_resource.franchise_test.id
  http_method   = "GET"
  authorization = "CUSTOM"
  authorizer_id = aws_api_gateway_authorizer.franchise_authorizer.id
}

resource "aws_api_gateway_integration" "franchise_test_integration" {
  rest_api_id = aws_api_gateway_rest_api.registration_api.id
  resource_id = aws_api_gateway_resource.franchise_test.id
  http_method = aws_api_gateway_method.franchise_test_get.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.franchise_test.invoke_arn
}

resource "aws_api_gateway_method_response" "franchise_test_response" {
  rest_api_id = aws_api_gateway_rest_api.registration_api.id
  resource_id = aws_api_gateway_resource.franchise_test.id
  http_method = aws_api_gateway_method.franchise_test_get.http_method
  status_code = "200"
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_integration_response" "franchise_test_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.registration_api.id
  resource_id = aws_api_gateway_resource.franchise_test.id
  http_method = aws_api_gateway_method.franchise_test_get.http_method
  status_code = aws_api_gateway_method_response.franchise_test_response.status_code
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  depends_on = [aws_api_gateway_integration.franchise_test_integration]
}

# ================================
# IAM ROLE FOR AUTHORIZERS
# ================================

resource "aws_iam_role" "authorizer_invocation_role" {
  name = "api_gateway_authorizer_invocation_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "apigateway.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "authorizer_invocation_policy" {
  name = "api_gateway_authorizer_invocation_policy"
  role = aws_iam_role.authorizer_invocation_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action   = "lambda:InvokeFunction"
        Effect   = "Allow"
        Resource = [
          aws_lambda_function.customer_authenticator.arn,
          aws_lambda_function.admin_authenticator.arn
        ]
      }
    ]
  })
}

# ================================
# LAMBDA PERMISSIONS
# ================================

resource "aws_lambda_permission" "api_gateway_invoke_customer_test" {
  statement_id  = "AllowAPIGatewayInvokeCustomerTest"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.customer_test.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.registration_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "api_gateway_invoke_franchise_test" {
  statement_id  = "AllowAPIGatewayInvokeFranchiseTest"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.franchise_test.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.registration_api.execution_arn}/*/*"
}


