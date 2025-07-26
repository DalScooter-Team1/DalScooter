# Admin endpoint
# API Gateway Resource for Admin Creation
resource "aws_api_gateway_resource" "admin" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  parent_id   = aws_api_gateway_rest_api.dalscooter_apis.root_resource_id
  path_part   = "admin"
}

# API Gateway Method for Admin Creation (POST)
# Note: This endpoint is intentionally unprotected to allow creation of the first admin user
resource "aws_api_gateway_method" "admin_post" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.admin.id
  http_method   = "POST"
  authorization = "NONE"
}

# API Gateway Integration for Admin Creation
resource "aws_api_gateway_integration" "admin_integration" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.admin.id
  http_method = aws_api_gateway_method.admin_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.admin_creation_lambda_invoke_arn
}

# Method response for POST with CORS headers
resource "aws_api_gateway_method_response" "admin_post_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.admin.id
  http_method = aws_api_gateway_method.admin_post.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
  }
}

# Integration response for POST with CORS headers
resource "aws_api_gateway_integration_response" "admin_post_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.admin.id
  http_method = aws_api_gateway_method.admin_post.http_method
  status_code = aws_api_gateway_method_response.admin_post_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST, OPTIONS'"
  }

  depends_on = [aws_api_gateway_integration.admin_integration]
}

# OPTIONS method for CORS preflight requests
resource "aws_api_gateway_method" "admin_options" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.admin.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# Integration for OPTIONS method - mock integration
resource "aws_api_gateway_integration" "admin_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.admin.id
  http_method = aws_api_gateway_method.admin_options.http_method

  type = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

# Method response for OPTIONS with CORS headers
resource "aws_api_gateway_method_response" "admin_options_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
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
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
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
  function_name = var.admin_creation_lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.dalscooter_apis.execution_arn}/*/*"
}

# ================================
# ACTIVE USERS ENDPOINT
# ================================

# API Gateway Resource for Active Users under admin
resource "aws_api_gateway_resource" "admin_active_users" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  parent_id   = aws_api_gateway_resource.admin.id
  path_part   = "active-users"
}

# API Gateway Method for Getting Active Users (GET)
resource "aws_api_gateway_method" "admin_active_users_get" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.admin_active_users.id
  http_method   = "GET"
  authorization = "CUSTOM"
  authorizer_id = aws_api_gateway_authorizer.franchise_authorizer.id
}

# API Gateway Integration for Getting Active Users
resource "aws_api_gateway_integration" "admin_active_users_integration" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.admin_active_users.id
  http_method = aws_api_gateway_method.admin_active_users_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.get_active_users_lambda_invoke_arn
}

# Method response for GET with CORS headers
resource "aws_api_gateway_method_response" "admin_active_users_get_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.admin_active_users.id
  http_method = aws_api_gateway_method.admin_active_users_get.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
  }
}

# Integration response for GET with CORS headers
resource "aws_api_gateway_integration_response" "admin_active_users_get_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.admin_active_users.id
  http_method = aws_api_gateway_method.admin_active_users_get.http_method
  status_code = aws_api_gateway_method_response.admin_active_users_get_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET, OPTIONS'"
  }

  depends_on = [aws_api_gateway_integration.admin_active_users_integration]
}

# OPTIONS method for CORS preflight requests
resource "aws_api_gateway_method" "admin_active_users_options" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.admin_active_users.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# Integration for OPTIONS method - mock integration
resource "aws_api_gateway_integration" "admin_active_users_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.admin_active_users.id
  http_method = aws_api_gateway_method.admin_active_users_options.http_method

  type = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

# Method response for OPTIONS with CORS headers
resource "aws_api_gateway_method_response" "admin_active_users_options_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.admin_active_users.id
  http_method = aws_api_gateway_method.admin_active_users_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# Integration response for OPTIONS with CORS headers
resource "aws_api_gateway_integration_response" "admin_active_users_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.admin_active_users.id
  http_method = aws_api_gateway_method.admin_active_users_options.http_method
  status_code = aws_api_gateway_method_response.admin_active_users_options_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

# Lambda Permission for API Gateway to invoke Get Active Users Lambda
resource "aws_lambda_permission" "api_gateway_invoke_get_active_users" {
  statement_id  = "AllowAPIGatewayInvokeGetActiveUsers"
  action        = "lambda:InvokeFunction"
  function_name = var.get_active_users_lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.dalscooter_apis.execution_arn}/*/*"
}
