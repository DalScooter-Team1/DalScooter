# Registration endpoint
resource "aws_api_gateway_resource" "register" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  parent_id   = aws_api_gateway_rest_api.dalscooter_apis.root_resource_id
  path_part   = "register"
}

resource "aws_api_gateway_method" "register_post" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.register.id
  http_method   = "POST"
  authorization = "NONE"
}

# Add OPTIONS method for CORS preflight requests
resource "aws_api_gateway_method" "register_options" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.register.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# Integration for OPTIONS method - mock integration
resource "aws_api_gateway_integration" "register_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.register.id
  http_method = aws_api_gateway_method.register_options.http_method
  
  type = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

# Method response for OPTIONS
resource "aws_api_gateway_method_response" "register_options_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
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
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
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
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.register.id
  http_method = aws_api_gateway_method.register_post.http_method
  status_code = "200"
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# Update the POST integration response to include CORS headers
resource "aws_api_gateway_integration_response" "register_post_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.register.id
  http_method = aws_api_gateway_method.register_post.http_method
  status_code = aws_api_gateway_method_response.register_post_response.status_code
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  depends_on = [aws_api_gateway_integration.register_integration]
}

resource "aws_api_gateway_integration" "register_integration" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
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
  source_arn    = "${aws_api_gateway_rest_api.dalscooter_apis.execution_arn}/*/*"
}
