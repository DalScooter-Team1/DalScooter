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
  authorization = "CUSTOM"
  authorizer_id = aws_api_gateway_authorizer.customer_authorizer.id

  request_parameters = {
    "method.request.header.Authorization" = true
  }
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

# Method response for POST - Not needed for Lambda proxy integration
# The Lambda function handles all response format including status codes and headers

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

# Integration response for POST - Not needed for Lambda proxy integration
# The Lambda function handles all response headers including CORS

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

# ================================
# MY BOOKINGS ENDPOINTS
# ================================

# My bookings resource under /booking/my-bookings
resource "aws_api_gateway_resource" "my_bookings" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  parent_id   = aws_api_gateway_resource.booking.id
  path_part   = "my-bookings"
}

# GET method for my bookings
resource "aws_api_gateway_method" "my_bookings_get" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.my_bookings.id
  http_method   = "GET"
  authorization = "CUSTOM"
  authorizer_id = aws_api_gateway_authorizer.customer_authorizer.id

  request_parameters = {
    "method.request.header.Authorization" = true
  }
}

# OPTIONS method for CORS
resource "aws_api_gateway_method" "my_bookings_options" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.my_bookings.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# Integration for GET method
resource "aws_api_gateway_integration" "my_bookings_integration" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.my_bookings.id
  http_method = aws_api_gateway_method.my_bookings_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.get_my_bookings_lambda_invoke_arn
}

# Integration for OPTIONS method (CORS)
resource "aws_api_gateway_integration" "my_bookings_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.my_bookings.id
  http_method = aws_api_gateway_method.my_bookings_options.http_method

  type = "MOCK"
  request_templates = {
    "application/json" = jsonencode({
      statusCode = 200
    })
  }
}

# Method response for OPTIONS (CORS)
resource "aws_api_gateway_method_response" "my_bookings_options_200" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.my_bookings.id
  http_method = aws_api_gateway_method.my_bookings_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# Integration response for OPTIONS (CORS)
resource "aws_api_gateway_integration_response" "my_bookings_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.my_bookings.id
  http_method = aws_api_gateway_method.my_bookings_options.http_method
  status_code = aws_api_gateway_method_response.my_bookings_options_200.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

# Lambda permission for API Gateway to invoke the get my bookings function
resource "aws_lambda_permission" "api_gw_get_my_bookings" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = var.get_my_bookings_lambda_function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_api_gateway_rest_api.dalscooter_apis.execution_arn}/*/*"
}

# ================================
# ADMIN BOOKING ENDPOINTS
# ================================

# Admin bookings resource under /booking/admin
resource "aws_api_gateway_resource" "admin_bookings" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  parent_id   = aws_api_gateway_resource.booking.id
  path_part   = "admin"
}

# GET method for admin to get all bookings
resource "aws_api_gateway_method" "admin_bookings_get" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.admin_bookings.id
  http_method   = "GET"
  authorization = "CUSTOM"
  authorizer_id = aws_api_gateway_authorizer.franchise_authorizer.id

  request_parameters = {
    "method.request.header.Authorization" = true
  }
}

# OPTIONS method for CORS
resource "aws_api_gateway_method" "admin_bookings_options" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.admin_bookings.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# Integration for GET method
resource "aws_api_gateway_integration" "admin_bookings_integration" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.admin_bookings.id
  http_method = aws_api_gateway_method.admin_bookings_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.get_all_bookings_lambda_invoke_arn
}

# Integration for OPTIONS method (CORS)
resource "aws_api_gateway_integration" "admin_bookings_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.admin_bookings.id
  http_method = aws_api_gateway_method.admin_bookings_options.http_method

  type = "MOCK"
  request_templates = {
    "application/json" = jsonencode({
      statusCode = 200
    })
  }
}

# Method response for OPTIONS (CORS)
resource "aws_api_gateway_method_response" "admin_bookings_options_200" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.admin_bookings.id
  http_method = aws_api_gateway_method.admin_bookings_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# Integration response for OPTIONS (CORS)
resource "aws_api_gateway_integration_response" "admin_bookings_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.admin_bookings.id
  http_method = aws_api_gateway_method.admin_bookings_options.http_method
  status_code = aws_api_gateway_method_response.admin_bookings_options_200.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

# Lambda permission for API Gateway to invoke the get all bookings function
resource "aws_lambda_permission" "api_gw_get_all_bookings" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = var.get_all_bookings_lambda_function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_api_gateway_rest_api.dalscooter_apis.execution_arn}/*/*"
}
