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
    aws_api_gateway_integration.customers_options_integration
  ]

  rest_api_id = aws_api_gateway_rest_api.dalscooter_apis.id
  
  stage_name  = "prod"
  lifecycle {
    create_before_destroy = true
  }
}
