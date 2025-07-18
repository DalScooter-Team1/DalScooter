# API Gateway for DALScooter application
resource "aws_api_gateway_rest_api" "dalscooter_apis" {
  name        = "dalscooter-api"
  description = "DALScooter APIs"
}

# Deploy API Gateway with all endpoints
resource "aws_api_gateway_deployment" "registration_deployment" {
  depends_on = [
    aws_api_gateway_method.register_post,
    aws_api_gateway_integration.register_integration,
    aws_api_gateway_method.admin_post,
    aws_api_gateway_integration.admin_integration,
    aws_api_gateway_method.admin_options,
    aws_api_gateway_integration.admin_options_integration,
    aws_api_gateway_method.customers_get,
    aws_api_gateway_integration.customers_integration,
    aws_api_gateway_method.customers_options,
    aws_api_gateway_integration.customers_options_integration,
    aws_api_gateway_method.heartbeat_post,
    aws_api_gateway_integration.heartbeat_integration,
    aws_api_gateway_method.heartbeat_options,
    aws_api_gateway_integration.heartbeat_options_integration,
    aws_api_gateway_method.admin_active_users_get,
    aws_api_gateway_integration.admin_active_users_integration,
    aws_api_gateway_method.admin_active_users_options,
    aws_api_gateway_integration.admin_active_users_options_integration,
    aws_api_gateway_method.feedback_post,
    aws_api_gateway_integration.feedback_integration,
    aws_api_gateway_method.feedback_options,
    aws_api_gateway_integration.feedback_options_integration
  ]

  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id

  lifecycle {
    create_before_destroy = true
  }
}

# Create a separate stage for the API Gateway deployment
resource "aws_api_gateway_stage" "prod_stage" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  deployment_id = aws_api_gateway_deployment.registration_deployment.id
  stage_name    = "prod"
  description   = "Production stage for API Gateway deployment"
}

# Message Passing Endpoints
resource "aws_api_gateway_resource" "submit_concern" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  parent_id   = aws_api_gateway_rest_api.dalscooter_apis.root_resource_id
  path_part   = "submit-concern"
}

resource "aws_api_gateway_method" "submit_concern_post" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.submit_concern.id
  http_method   = "POST"
  authorization = "CUSTOM"
  authorizer_id = aws_api_gateway_authorizer.customer_authorizer.id
}

resource "aws_api_gateway_integration" "submit_concern_integration" {
  rest_api_id             = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id             = aws_api_gateway_resource.submit_concern.id
  http_method             = aws_api_gateway_method.submit_concern_post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.submit_concern_lambda_invoke_arn
}

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
  authorizer_id = aws_api_gateway_authorizer.customer_authorizer.id
}

resource "aws_api_gateway_integration" "respond_concern_integration" {
  rest_api_id             = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id             = aws_api_gateway_resource.respond_concern.id
  http_method             = aws_api_gateway_method.respond_concern_post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.respond_concern_lambda_invoke_arn
}

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
  authorizer_id = aws_api_gateway_authorizer.customer_authorizer.id
}

resource "aws_api_gateway_integration" "messages_integration" {
  rest_api_id             = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id             = aws_api_gateway_resource.messages.id
  http_method             = aws_api_gateway_method.messages_get.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.get_concerns_lambda_invoke_arn
}

resource "aws_api_gateway_resource" "cors" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  parent_id   = aws_api_gateway_rest_api.dalscooter_apis.root_resource_id
  path_part   = "cors"
}

resource "aws_api_gateway_method" "cors_options" {
  rest_api_id   = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id   = aws_api_gateway_resource.cors.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "cors_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  resource_id = aws_api_gateway_resource.cors.id
  http_method = "OPTIONS"
  type        = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}
