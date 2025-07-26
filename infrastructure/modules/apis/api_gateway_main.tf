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
    # Messaging endpoints
    aws_api_gateway_method.submit_concern_post,
    aws_api_gateway_integration.submit_concern_integration,
    aws_api_gateway_method.submit_concern_options,
    aws_api_gateway_integration.submit_concern_options_integration,
    aws_api_gateway_method.respond_concern_post,
    aws_api_gateway_integration.respond_concern_integration,
    aws_api_gateway_method.respond_concern_options,
    aws_api_gateway_integration.respond_concern_options_integration,
    aws_api_gateway_method.messages_get,
    aws_api_gateway_integration.messages_integration,
    aws_api_gateway_method.messages_options,
    aws_api_gateway_integration.messages_options_integration,
    # Customer messages endpoints
    aws_api_gateway_method.customer_messages_get,
    aws_api_gateway_integration.customer_messages_integration,
    aws_api_gateway_method.customer_messages_options,
    aws_api_gateway_integration.customer_messages_options_integration,
    # Bike inventory endpoints
    aws_api_gateway_method.bikes_get,
    aws_api_gateway_integration.bikes_get_integration,
    aws_api_gateway_method.bikes_post,
    aws_api_gateway_integration.bikes_post_integration,
    aws_api_gateway_method.bike_put,
    aws_api_gateway_integration.bike_put_integration,
    aws_api_gateway_method.bike_delete,
    aws_api_gateway_integration.bike_delete_integration,
    aws_api_gateway_method.bike_availability_get,
    aws_api_gateway_integration.bike_availability_integration,
    aws_api_gateway_method.discount_codes_get,
    aws_api_gateway_integration.discount_codes_get_integration,
    aws_api_gateway_method.discount_codes_post,
    aws_api_gateway_integration.discount_codes_post_integration,
    aws_api_gateway_method.discount_code_put,
    aws_api_gateway_integration.discount_code_put_integration,
    aws_api_gateway_method.discount_code_delete,
    aws_api_gateway_integration.discount_code_delete_integration,
    aws_api_gateway_method.bikes_options,
    aws_api_gateway_integration.bikes_options_integration,
    aws_api_gateway_method.bike_availability_options,
    aws_api_gateway_integration.bike_availability_options_integration,
    aws_api_gateway_method.discount_codes_options,
    aws_api_gateway_integration.discount_codes_options_integration
  ]

  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id

  stage_name = "prod"

  # Force new deployment when authorization changes
  triggers = {
    redeployment = timestamp()
    auth_changes = "v2"
  }

  lifecycle {
    create_before_destroy = true
  }
}
