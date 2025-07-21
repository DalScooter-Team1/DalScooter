# ================================
# MESSAGE PASSING ENDPOINT CONFIGURATION
# ================================

# Submit Concern endpoint - uses customer authorizer (customers can submit concerns)
resource "aws_api_gateway_resource" "submit_concern" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  parent_id   = aws_api_gateway_rest_api.dalscooter_apis.root_resource_id
  path_part   = "submit-concern"
}

resource "aws_api_gateway_method" "submit_concern_post" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.submit_concern.id
  http_method   = "POST"
  authorization = "NONE"
  # Temporarily disable authorizer for debugging
  # authorizer_id = aws_api_gateway_authorizer.customer_authorizer.id
}

resource "aws_api_gateway_integration" "submit_concern_integration" {
  rest_api_id             = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id             = aws_api_gateway_resource.submit_concern.id
  http_method             = aws_api_gateway_method.submit_concern_post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.submit_concern_lambda_invoke_arn
}

# Respond Concern endpoint - uses franchise authorizer (only franchise owners can respond)
resource "aws_api_gateway_resource" "respond_concern" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  parent_id   = aws_api_gateway_rest_api.dalscooter_apis.root_resource_id
  path_part   = "respond-concern"
}

resource "aws_api_gateway_method" "respond_concern_post" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.respond_concern.id
  http_method   = "POST"
  authorization = "CUSTOM"
  authorizer_id = aws_api_gateway_authorizer.franchise_authorizer.id
}

resource "aws_api_gateway_integration" "respond_concern_integration" {
  rest_api_id             = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id             = aws_api_gateway_resource.respond_concern.id
  http_method             = aws_api_gateway_method.respond_concern_post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.respond_concern_lambda_invoke_arn
}

# Messages endpoint - uses franchise authorizer (only franchise owners can get messages)
resource "aws_api_gateway_resource" "messages" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  parent_id   = aws_api_gateway_rest_api.dalscooter_apis.root_resource_id
  path_part   = "messages"
}

resource "aws_api_gateway_method" "messages_get" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.messages.id
  http_method   = "GET"
  authorization = "CUSTOM"
  authorizer_id = aws_api_gateway_authorizer.franchise_authorizer.id
}

resource "aws_api_gateway_integration" "messages_integration" {
  rest_api_id             = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id             = aws_api_gateway_resource.messages.id
  http_method             = aws_api_gateway_method.messages_get.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.get_concerns_lambda_invoke_arn
}

# ================================
# CORS SUPPORT FOR MESSAGING ENDPOINTS
# ================================

# Submit Concern - OPTIONS method for CORS
resource "aws_api_gateway_method" "submit_concern_options" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.submit_concern.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "submit_concern_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.submit_concern.id
  http_method = aws_api_gateway_method.submit_concern_options.http_method

  type = "MOCK"
  request_templates = {
    "application/json" = jsonencode({
      statusCode = 200
    })
  }
}

resource "aws_api_gateway_method_response" "submit_concern_options_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.submit_concern.id
  http_method = aws_api_gateway_method.submit_concern_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "submit_concern_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.submit_concern.id
  http_method = aws_api_gateway_method.submit_concern_options.http_method
  status_code = aws_api_gateway_method_response.submit_concern_options_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

# Submit Concern - POST method response for CORS
resource "aws_api_gateway_method_response" "submit_concern_post_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.submit_concern.id
  http_method = aws_api_gateway_method.submit_concern_post.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_integration_response" "submit_concern_post_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.submit_concern.id
  http_method = aws_api_gateway_method.submit_concern_post.http_method
  status_code = aws_api_gateway_method_response.submit_concern_post_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  depends_on = [aws_api_gateway_integration.submit_concern_integration]
}

# Respond Concern - OPTIONS method for CORS
resource "aws_api_gateway_method" "respond_concern_options" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.respond_concern.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "respond_concern_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.respond_concern.id
  http_method = aws_api_gateway_method.respond_concern_options.http_method

  type = "MOCK"
  request_templates = {
    "application/json" = jsonencode({
      statusCode = 200
    })
  }
}

resource "aws_api_gateway_method_response" "respond_concern_options_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.respond_concern.id
  http_method = aws_api_gateway_method.respond_concern_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "respond_concern_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.respond_concern.id
  http_method = aws_api_gateway_method.respond_concern_options.http_method
  status_code = aws_api_gateway_method_response.respond_concern_options_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

# Respond Concern - POST method response for CORS
resource "aws_api_gateway_method_response" "respond_concern_post_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.respond_concern.id
  http_method = aws_api_gateway_method.respond_concern_post.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_integration_response" "respond_concern_post_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.respond_concern.id
  http_method = aws_api_gateway_method.respond_concern_post.http_method
  status_code = aws_api_gateway_method_response.respond_concern_post_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  depends_on = [aws_api_gateway_integration.respond_concern_integration]
}

# Messages - OPTIONS method for CORS
resource "aws_api_gateway_method" "messages_options" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.messages.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "messages_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.messages.id
  http_method = aws_api_gateway_method.messages_options.http_method

  type = "MOCK"
  request_templates = {
    "application/json" = jsonencode({
      statusCode = 200
    })
  }
}

resource "aws_api_gateway_method_response" "messages_options_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.messages.id
  http_method = aws_api_gateway_method.messages_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "messages_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.messages.id
  http_method = aws_api_gateway_method.messages_options.http_method
  status_code = aws_api_gateway_method_response.messages_options_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

# Messages - GET method response for CORS
resource "aws_api_gateway_method_response" "messages_get_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.messages.id
  http_method = aws_api_gateway_method.messages_get.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_integration_response" "messages_get_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.messages.id
  http_method = aws_api_gateway_method.messages_get.http_method
  status_code = aws_api_gateway_method_response.messages_get_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  depends_on = [aws_api_gateway_integration.messages_integration]
}
