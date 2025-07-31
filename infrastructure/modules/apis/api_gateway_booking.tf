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
  
