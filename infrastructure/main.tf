# ================================
# APIS MODULE
# ================================
# This module contains all API Gateway related resources
# including endpoints, authorizers, and integrations
module "apis" {
  source = "./modules/apis"
  
  # Lambda function references from Authentication.tf
  customer_lambda_arn                         = aws_lambda_function.customer_authenticator.arn
  customer_lambda_invoke_arn                  = aws_lambda_function.customer_authenticator.invoke_arn
  admin_lambda_arn                           = aws_lambda_function.admin_authenticator.arn
  admin_lambda_invoke_arn                    = aws_lambda_function.admin_authenticator.invoke_arn
  user_registration_lambda_arn               = aws_lambda_function.user_registration.arn
  user_registration_lambda_invoke_arn        = aws_lambda_function.user_registration.invoke_arn
  user_registration_lambda_function_name     = aws_lambda_function.user_registration.function_name
  admin_creation_lambda_arn                  = aws_lambda_function.admin_creation.arn
  admin_creation_lambda_invoke_arn           = aws_lambda_function.admin_creation.invoke_arn
  admin_creation_lambda_function_name        = aws_lambda_function.admin_creation.function_name
}

# ================================
# API GATEWAY OUTPUTS
# ================================

output "api_gateway_url" {
  description = "API Gateway invoke URL"
  value       = module.apis.api_gateway_invoke_url
}

output "api_gateway_id" {
  description = "API Gateway ID"
  value       = module.apis.api_gateway_id
}

output "api_gateway_deployment_invoke_url" {
  description = "API Gateway deployment invoke URL (for Frontend.tf compatibility)"
  value       = module.apis.api_gateway_deployment_invoke_url
}