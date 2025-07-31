# ================================
# FEEDBACK ENDPOINT CONFIGURATION
# ================================

# API Gateway Resource for Feedback
resource "aws_api_gateway_resource" "feedback" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  parent_id   = aws_api_gateway_rest_api.dalscooter_apis.root_resource_id
  path_part   = "feedback"
}

# API Gateway Resource for Feedback by Bike ID
resource "aws_api_gateway_resource" "feedback_by_bike" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  parent_id   = aws_api_gateway_resource.feedback.id
  path_part   = "{bike_id}"
}

# API Gateway Method for Posting Feedback (POST)
resource "aws_api_gateway_method" "feedback_post" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.feedback.id
  http_method   = "POST"
  authorization = "CUSTOM"
  authorizer_id = aws_api_gateway_authorizer.customer_authorizer.id
}

# API Gateway Method for Getting Feedback by Bike ID (GET) - PUBLIC ACCESS
resource "aws_api_gateway_method" "feedback_get_by_bike" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.feedback_by_bike.id
  http_method   = "GET"
  authorization = "NONE"
}

# API Gateway Integration for Posting Feedback
resource "aws_api_gateway_integration" "feedback_integration" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.feedback.id
  http_method = aws_api_gateway_method.feedback_post.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = var.post_feedback_lambda_invoke_arn
}

# API Gateway Integration for Getting Feedback by Bike ID
resource "aws_api_gateway_integration" "feedback_get_by_bike_integration" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.feedback_by_bike.id
  http_method = aws_api_gateway_method.feedback_get_by_bike.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = var.get_feedback_lambda_invoke_arn
}

# Method response for POST with CORS headers
resource "aws_api_gateway_method_response" "feedback_post_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.feedback.id
  http_method = aws_api_gateway_method.feedback_post.http_method
  status_code = "200"
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
  }
}

# Method response for GET with CORS headers
resource "aws_api_gateway_method_response" "feedback_get_by_bike_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.feedback_by_bike.id
  http_method = aws_api_gateway_method.feedback_get_by_bike.http_method
  status_code = "200"
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
  }
}

# Integration response for POST with CORS headers
resource "aws_api_gateway_integration_response" "feedback_post_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.feedback.id
  http_method = aws_api_gateway_method.feedback_post.http_method
  status_code = aws_api_gateway_method_response.feedback_post_response.status_code
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'"
  }

  depends_on = [aws_api_gateway_integration.feedback_integration]
}

# Integration response for GET with CORS headers
resource "aws_api_gateway_integration_response" "feedback_get_by_bike_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.feedback_by_bike.id
  http_method = aws_api_gateway_method.feedback_get_by_bike.http_method
  status_code = aws_api_gateway_method_response.feedback_get_by_bike_response.status_code
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'"
  }

  depends_on = [aws_api_gateway_integration.feedback_get_by_bike_integration]
}

# OPTIONS method for CORS preflight requests (POST)
resource "aws_api_gateway_method" "feedback_options" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.feedback.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# OPTIONS method for CORS preflight requests (GET)
resource "aws_api_gateway_method" "feedback_get_by_bike_options" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.feedback_by_bike.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# Integration for OPTIONS method - mock integration (POST)
resource "aws_api_gateway_integration" "feedback_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.feedback.id
  http_method = aws_api_gateway_method.feedback_options.http_method
  
  type = "MOCK"
  request_templates = {
    "application/json" = jsonencode({
      statusCode = 200
    })
  }
}

# Integration for OPTIONS method - mock integration (GET)
resource "aws_api_gateway_integration" "feedback_get_by_bike_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.feedback_by_bike.id
  http_method = aws_api_gateway_method.feedback_get_by_bike_options.http_method
  
  type = "MOCK"
  request_templates = {
    "application/json" = jsonencode({
      statusCode = 200
    })
  }
}

# Method response for OPTIONS with CORS headers (POST)
resource "aws_api_gateway_method_response" "feedback_options_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.feedback.id
  http_method = aws_api_gateway_method.feedback_options.http_method
  status_code = "200"
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# Method response for OPTIONS with CORS headers (GET)
resource "aws_api_gateway_method_response" "feedback_get_by_bike_options_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.feedback_by_bike.id
  http_method = aws_api_gateway_method.feedback_get_by_bike_options.http_method
  status_code = "200"
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# Integration response for OPTIONS with CORS headers (POST)
resource "aws_api_gateway_integration_response" "feedback_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.feedback.id
  http_method = aws_api_gateway_method.feedback_options.http_method
  status_code = aws_api_gateway_method_response.feedback_options_response.status_code
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  depends_on = [aws_api_gateway_integration.feedback_options_integration]
}

# Integration response for OPTIONS with CORS headers (GET)
resource "aws_api_gateway_integration_response" "feedback_get_by_bike_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.feedback_by_bike.id
  http_method = aws_api_gateway_method.feedback_get_by_bike_options.http_method
  status_code = aws_api_gateway_method_response.feedback_get_by_bike_options_response.status_code
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  depends_on = [aws_api_gateway_integration.feedback_get_by_bike_options_integration]
}

# Lambda Permission for API Gateway to invoke Post Feedback Lambda
resource "aws_lambda_permission" "api_gateway_invoke_post_feedback" {
  statement_id  = "AllowAPIGatewayInvokePostFeedback"
  action        = "lambda:InvokeFunction"
  function_name = var.post_feedback_lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.dalscooter_apis.execution_arn}/*/*"
}

# Lambda Permission for API Gateway to invoke Get Feedback Lambda
resource "aws_lambda_permission" "api_gateway_invoke_get_feedback" {
  statement_id  = "AllowAPIGatewayInvokeGetFeedback"
  action        = "lambda:InvokeFunction"
  function_name = var.get_feedback_lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.dalscooter_apis.execution_arn}/*/*"
}
