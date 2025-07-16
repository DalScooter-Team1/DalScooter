# ================================
# ACTIVE USERS API GATEWAY ENDPOINTS
# ================================

# API Gateway Resource for Active Users
resource "aws_api_gateway_resource" "active_users" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  parent_id   = aws_api_gateway_rest_api.dalscooter_apis.root_resource_id
  path_part   = "active-users"
}

# GET method for retrieving active users (Admin only)
resource "aws_api_gateway_method" "active_users_get" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.active_users.id
  http_method   = "GET"
  authorization = "CUSTOM"
  authorizer_id = aws_api_gateway_authorizer.franchise_authorizer.id
}

# Integration for GET method
resource "aws_api_gateway_integration" "active_users_integration" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.active_users.id
  http_method = aws_api_gateway_method.active_users_get.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = var.get_active_users_lambda_invoke_arn
}

# Method response for GET with CORS headers
resource "aws_api_gateway_method_response" "active_users_get_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.active_users.id
  http_method = aws_api_gateway_method.active_users_get.http_method
  status_code = "200"
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
  }
}

# Integration response for GET with CORS headers
resource "aws_api_gateway_integration_response" "active_users_get_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.active_users.id
  http_method = aws_api_gateway_method.active_users_get.http_method
  status_code = aws_api_gateway_method_response.active_users_get_response.status_code
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'"
  }

  depends_on = [aws_api_gateway_integration.active_users_integration]
}

# OPTIONS method for CORS preflight requests
resource "aws_api_gateway_method" "active_users_options" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.active_users.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# Integration for OPTIONS method - mock integration
resource "aws_api_gateway_integration" "active_users_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.active_users.id
  http_method = aws_api_gateway_method.active_users_options.http_method
  
  type = "MOCK"
  request_templates = {
    "application/json" = jsonencode({
      statusCode = 200
    })
  }
}

# Method response for OPTIONS with CORS headers
resource "aws_api_gateway_method_response" "active_users_options_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.active_users.id
  http_method = aws_api_gateway_method.active_users_options.http_method
  status_code = "200"
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# Integration response for OPTIONS with CORS headers
resource "aws_api_gateway_integration_response" "active_users_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.active_users.id
  http_method = aws_api_gateway_method.active_users_options.http_method
  status_code = aws_api_gateway_method_response.active_users_options_response.status_code
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}
