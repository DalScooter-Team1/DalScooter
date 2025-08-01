# ================================
# BOOKING ENDPOINTS
# ================================

# Booking resource under /booking
resource "aws_api_gateway_resource" "booking" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  parent_id   = aws_api_gateway_rest_api.dalscooter_apis.root_resource_id
  path_part   = "booking"
}

# Booking request resource under /booking/request
resource "aws_api_gateway_resource" "booking_request" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  parent_id   = aws_api_gateway_resource.booking.id
  path_part   = "request"
}

# POST method for booking request
resource "aws_api_gateway_method" "booking_request_post" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.booking_request.id
  http_method   = "POST"
  authorization = "NONE"
}

# OPTIONS method for CORS
resource "aws_api_gateway_method" "booking_request_options" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.booking_request.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# Integration for POST method
resource "aws_api_gateway_integration" "booking_request_integration" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.booking_request.id
  http_method = aws_api_gateway_method.booking_request_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.booking_request_lambda_invoke_arn
}

# Integration for OPTIONS method (CORS)
resource "aws_api_gateway_integration" "booking_request_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.booking_request.id
  http_method = aws_api_gateway_method.booking_request_options.http_method

  type = "MOCK"
  request_templates = {
    "application/json" = jsonencode({
      statusCode = 200
    })
  }
}

# Method response for POST
resource "aws_api_gateway_method_response" "booking_request_post_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.booking_request.id
  http_method = aws_api_gateway_method.booking_request_post.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# Method response for OPTIONS
resource "aws_api_gateway_method_response" "booking_request_options_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.booking_request.id
  http_method = aws_api_gateway_method.booking_request_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
  }
}

# Integration response for POST
resource "aws_api_gateway_integration_response" "booking_request_post_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.booking_request.id
  http_method = aws_api_gateway_method.booking_request_post.http_method
  status_code = aws_api_gateway_method_response.booking_request_post_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  depends_on = [aws_api_gateway_integration.booking_request_integration]
}

# Integration response for OPTIONS
resource "aws_api_gateway_integration_response" "booking_request_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.booking_request.id
  http_method = aws_api_gateway_method.booking_request_options.http_method
  status_code = aws_api_gateway_method_response.booking_request_options_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'"
  }

  depends_on = [aws_api_gateway_integration.booking_request_options_integration]
}

# Lambda permission for API Gateway to invoke the function
resource "aws_lambda_permission" "api_gw_booking_request" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = var.booking_request_lambda_function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_api_gateway_rest_api.dalscooter_apis.execution_arn}/*/*"
}
