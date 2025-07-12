# Admin endpoint
# API Gateway Resource for Admin Creation
resource "aws_api_gateway_resource" "admin" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  parent_id   = aws_api_gateway_rest_api.dalscooter_apis.root_resource_id
  path_part   = "admin"
}

# API Gateway Method for Admin Creation (POST)
resource "aws_api_gateway_method" "admin_post" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.admin.id
  http_method   = "POST"
  authorization = "CUSTOM"
  authorizer_id = aws_api_gateway_authorizer.franchise_authorizer.id
}

# API Gateway Integration for Admin Creation
resource "aws_api_gateway_integration" "admin_integration" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.admin.id
  http_method = aws_api_gateway_method.admin_post.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.admin_creation.invoke_arn
}

# Method response for POST with CORS headers
resource "aws_api_gateway_method_response" "admin_post_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
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
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
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
  function_name = aws_lambda_function.admin_creation.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.dalscooter_apis.execution_arn}/*/*"
}
