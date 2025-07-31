# ================================
# BOOKING ENDPOINT CONFIGURATION
# ================================

# API Gateway Resource for Booking
resource "aws_api_gateway_resource" "booking" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  parent_id   = aws_api_gateway_rest_api.dalscooter_apis.root_resource_id
  path_part   = "booking"
}


# API Gateway Method for Posting Booking (POST)
resource "aws_api_gateway_method" "booking_post" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.booking.id
  http_method   = "POST"
  authorization = "CUSTOM"
  authorizer_id = aws_api_gateway_authorizer.customer_authorizer.id
}

# API Gateway Integration for Posting Booking
resource "aws_api_gateway_integration" "booking_integration" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.booking.id
  http_method = aws_api_gateway_method.booking_post.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = var.booking_request_lambda_invoke_arn
}

# --- CORS Support for Booking Endpoint ---

# Method response for POST with CORS headers
resource "aws_api_gateway_method_response" "booking_post_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.booking.id
  http_method = aws_api_gateway_method.booking_post.http_method
  status_code = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
  }
}

# Integration response for POST with CORS headers
resource "aws_api_gateway_integration_response" "booking_post_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.booking.id
  http_method = aws_api_gateway_method.booking_post.http_method
  status_code = aws_api_gateway_method_response.booking_post_response.status_code
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'"
  }
  depends_on = [aws_api_gateway_integration.booking_integration]
}

# OPTIONS method for CORS preflight requests (POST)
resource "aws_api_gateway_method" "booking_options" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.booking.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# Integration for OPTIONS method - mock integration (POST)
resource "aws_api_gateway_integration" "booking_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.booking.id
  http_method = aws_api_gateway_method.booking_options.http_method
  type = "MOCK"
  request_templates = {
    "application/json" = jsonencode({ statusCode = 200 })
  }
}

# Method response for OPTIONS with CORS headers (POST)
resource "aws_api_gateway_method_response" "booking_options_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.booking.id
  http_method = aws_api_gateway_method.booking_options.http_method
  status_code = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# Integration response for OPTIONS with CORS headers (POST)
resource "aws_api_gateway_integration_response" "booking_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.booking.id
  http_method = aws_api_gateway_method.booking_options.http_method
  status_code = aws_api_gateway_method_response.booking_options_response.status_code
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
  depends_on = [aws_api_gateway_integration.booking_options_integration]
}

resource "aws_lambda_permission" "api_gateway_invoke_booking_request" {
  statement_id  = "AllowAPIGatewayInvokeBookingRequest"
  action        = "lambda:InvokeFunction"
  function_name = var.booking_request_lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.dalscooter_apis.execution_arn}/*/*"
}

