# ================================
# LAMBDA MODULE
# ================================
# This module contains all Lambda functions for the application

module "lambda" {
  source = "./modules/lambda"
  
  # Cognito references
  cognito_user_pool_id                = aws_cognito_user_pool.pool.id
  cognito_user_pool_arn               = aws_cognito_user_pool.pool.arn
  cognito_client_id                   = aws_cognito_user_pool_client.client.id
  
  # DynamoDB references
  security_questions_table_name       = aws_dynamodb_table.user_security_questions.name
  security_questions_table_arn        = aws_dynamodb_table.user_security_questions.arn
  logged_in_user_directory_table_name = aws_dynamodb_table.logged_in_user_directory.name
  logged_in_user_directory_table_arn  = aws_dynamodb_table.logged_in_user_directory.arn
  
  # SNS references
  signup_login_topic_arn              = aws_sns_topic.user_signup_login.arn
}

# ================================
# APIS MODULE
# ================================
# This module contains all API Gateway related resources
# including endpoints, authorizers, and integrations

module "apis" {
  source = "./modules/apis"
  
  # Lambda function references from Lambda module
  customer_lambda_arn                         = module.lambda.customer_authenticator_lambda_arn
  customer_lambda_invoke_arn                  = module.lambda.customer_authenticator_lambda_invoke_arn
  admin_lambda_arn                           = module.lambda.admin_authenticator_lambda_arn
  admin_lambda_invoke_arn                    = module.lambda.admin_authenticator_lambda_invoke_arn
  user_registration_lambda_arn               = module.lambda.user_registration_lambda_arn
  user_registration_lambda_invoke_arn        = module.lambda.user_registration_lambda_invoke_arn
  user_registration_lambda_function_name     = module.lambda.user_registration_lambda_function_name
  admin_creation_lambda_arn                  = module.lambda.admin_creation_lambda_arn
  admin_creation_lambda_invoke_arn           = module.lambda.admin_creation_lambda_invoke_arn
  admin_creation_lambda_function_name        = module.lambda.admin_creation_lambda_function_name
  get_customers_lambda_arn                   = module.lambda.get_customers_lambda_arn
  get_customers_lambda_invoke_arn            = module.lambda.get_customers_lambda_invoke_arn
  get_customers_lambda_function_name         = module.lambda.get_customers_lambda_function_name
  get_logged_in_users_lambda_arn             = module.lambda.get_logged_in_users_lambda_arn
  get_logged_in_users_lambda_invoke_arn      = module.lambda.get_logged_in_users_lambda_invoke_arn
  get_logged_in_users_lambda_function_name   = module.lambda.get_logged_in_users_lambda_function_name
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