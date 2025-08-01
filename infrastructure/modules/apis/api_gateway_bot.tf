# ================================
# Bot “/bot” Endpoint Configuration
# ================================

# “bot” resource under the API’s root
resource "aws_api_gateway_resource" "bot" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  parent_id   = aws_api_gateway_rest_api.dalscooter_apis.root_resource_id
  path_part   = "bot"
}

# POST /bot with no authorizer
resource "aws_api_gateway_method" "bot_post" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.bot.id
  http_method   = "POST"
  authorization = "NONE"
}

# POST /bot → BotHandler Lambda
resource "aws_api_gateway_integration" "bot_integration" {
  rest_api_id             = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id             = aws_api_gateway_resource.bot.id
  http_method             = aws_api_gateway_method.bot_post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.bot_handler_lambda_invoke_arn
}

# 1) OPTIONS /bot
resource "aws_api_gateway_method" "bot_options" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.bot.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "bot_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.bot.id
  http_method = aws_api_gateway_method.bot_options.http_method

  type = "MOCK"
  request_templates = {
    "application/json" = jsonencode({ statusCode = 200 })
  }
}

resource "aws_api_gateway_method_response" "bot_options_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.bot.id
  http_method = aws_api_gateway_method.bot_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "bot_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.bot.id
  http_method = aws_api_gateway_method.bot_options.http_method
  status_code = aws_api_gateway_method_response.bot_options_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

# CORS header on POST /bot responses
resource "aws_api_gateway_method_response" "bot_post_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.bot.id
  http_method = aws_api_gateway_method.bot_post.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_integration_response" "bot_post_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.bot.id
  http_method = aws_api_gateway_method.bot_post.http_method
  status_code = aws_api_gateway_method_response.bot_post_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  depends_on = [ aws_api_gateway_integration.bot_integration ]
}
