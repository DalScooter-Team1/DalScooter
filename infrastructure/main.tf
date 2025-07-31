# ================================
# DATA SOURCES
# ================================
# Get current AWS account information
data "aws_caller_identity" "current" {}

# ================================
# LAMBDA MODULE
# ================================
# This module contains all Lambda functions for the application

module "lambda" {
  source = "./modules/lambda"

  # Cognito references
  cognito_user_pool_id  = aws_cognito_user_pool.pool.id
  cognito_user_pool_arn = aws_cognito_user_pool.pool.arn
  cognito_client_id     = aws_cognito_user_pool_client.client.id

  # DynamoDB references
  security_questions_table_name       = aws_dynamodb_table.user_security_questions.name
  security_questions_table_arn        = aws_dynamodb_table.user_security_questions.arn
  logged_in_user_directory_table_name = aws_dynamodb_table.logged_in_user_directory.name
  logged_in_user_directory_table_arn  = aws_dynamodb_table.logged_in_user_directory.arn
  logged_in_user_directory_stream_arn = aws_dynamodb_table.logged_in_user_directory.stream_arn

  # S3 references
  s3_bucket_name = var.s3_bucket_name
  s3_folder      = var.s3_folder

  # SNS references
  signup_login_topic_arn = aws_sns_topic.user_signup_login.arn

  # SQS references (for feedback processing)
  feedback_queue_url = aws_sqs_queue.feedback_queue.url
  feedback_queue_arn = aws_sqs_queue.feedback_queue.arn

  concerns_queue_url = aws_sqs_queue.concerns_queue.id
  concerns_queue_arn = aws_sqs_queue.concerns_queue.arn

  # Messages table references (for concerns processing)
  dynamodb_table_name = aws_dynamodb_table.messages.name
  dynamodb_table_arn  = aws_dynamodb_table.messages.arn
  user_pool_id        = aws_cognito_user_pool.pool.id
  user_pool_arn       = aws_cognito_user_pool.pool.arn

  # Bike Inventory references
  bikes_table_name               = aws_dynamodb_table.bikes.name
  bikes_table_arn                = aws_dynamodb_table.bikes.arn
  discount_codes_table_name      = aws_dynamodb_table.discount_codes.name
  discount_codes_table_arn       = aws_dynamodb_table.discount_codes.arn
  user_discount_usage_table_name = aws_dynamodb_table.user_discount_usage.name
  user_discount_usage_table_arn  = aws_dynamodb_table.user_discount_usage.arn
}


# ================================
# S3 BUCKET FOR LOGGED IN USER DIRECTORY STREAM
# ================================

resource "aws_s3_bucket" "logged_in_user_directory" {
  bucket        = var.s3_bucket_name
  force_destroy = true
  tags = {
    Name    = "DALScooter Logged In User Directory Stream Bucket"
    Project = "DALScooter"
  }


}

# ================================
# APIS MODULE
# ================================
# This module contains all API Gateway related resources
# including endpoints, authorizers, and integrations

module "apis" {
  source = "./modules/apis"

  # Lambda function references from Lambda module
  customer_lambda_arn                    = module.lambda.customer_authenticator_lambda_arn
  customer_lambda_invoke_arn             = module.lambda.customer_authenticator_lambda_invoke_arn
  admin_lambda_arn                       = module.lambda.admin_authenticator_lambda_arn
  admin_lambda_invoke_arn                = module.lambda.admin_authenticator_lambda_invoke_arn
  user_registration_lambda_arn           = module.lambda.user_registration_lambda_arn
  user_registration_lambda_invoke_arn    = module.lambda.user_registration_lambda_invoke_arn
  user_registration_lambda_function_name = module.lambda.user_registration_lambda_function_name
  admin_creation_lambda_arn              = module.lambda.admin_creation_lambda_arn
  admin_creation_lambda_invoke_arn       = module.lambda.admin_creation_lambda_invoke_arn
  admin_creation_lambda_function_name    = module.lambda.admin_creation_lambda_function_name
  get_customers_lambda_arn               = module.lambda.get_customers_lambda_arn
  get_customers_lambda_invoke_arn        = module.lambda.get_customers_lambda_invoke_arn
  get_customers_lambda_function_name     = module.lambda.get_customers_lambda_function_name
  process_heartbeat_lambda_arn           = module.lambda.process_heartbeat_lambda_arn
  process_heartbeat_lambda_invoke_arn    = module.lambda.process_heartbeat_lambda_invoke_arn
  process_heartbeat_lambda_function_name = module.lambda.process_heartbeat_lambda_function_name
  get_active_users_lambda_arn            = module.lambda.get_active_users_lambda_arn
  get_active_users_lambda_invoke_arn     = module.lambda.get_active_users_lambda_invoke_arn
  get_active_users_lambda_function_name  = module.lambda.get_active_users_lambda_function_name

  # Messaging Lambda references
  submit_concern_lambda_arn               = aws_lambda_function.submit_concern.arn
  submit_concern_lambda_invoke_arn        = aws_lambda_function.submit_concern.invoke_arn
  respond_concern_lambda_arn              = aws_lambda_function.respond_concern.arn
  respond_concern_lambda_invoke_arn       = aws_lambda_function.respond_concern.invoke_arn
  get_concerns_lambda_arn                 = aws_lambda_function.get_concerns.arn
  get_concerns_lambda_invoke_arn          = aws_lambda_function.get_concerns.invoke_arn
  get_customer_messages_lambda_arn        = aws_lambda_function.get_customer_messages.arn
  get_customer_messages_lambda_invoke_arn = aws_lambda_function.get_customer_messages.invoke_arn

  # Post Feedback Lambda references
  post_feedback_lambda_arn           = module.lambda.post_feedback_lambda_arn
  post_feedback_lambda_invoke_arn    = module.lambda.post_feedback_lambda_invoke_arn
  post_feedback_lambda_function_name = module.lambda.post_feedback_lambda_function_name

  # Get Feedback Lambda references
  get_feedback_lambda_arn           = module.lambda.get_feedback_lambda_arn
  get_feedback_lambda_invoke_arn    = module.lambda.get_feedback_lambda_invoke_arn
  get_feedback_lambda_function_name = module.lambda.get_feedback_lambda_function_name

  # Bike Inventory Lambda references
  bike_management_lambda_arn               = module.lambda.bike_management_lambda_arn
  bike_management_lambda_invoke_arn        = module.lambda.bike_management_lambda_invoke_arn
  bike_management_lambda_function_name     = module.lambda.bike_management_lambda_function_name
  bike_availability_lambda_arn             = module.lambda.bike_availability_lambda_arn
  bike_availability_lambda_invoke_arn      = module.lambda.bike_availability_lambda_invoke_arn
  bike_availability_lambda_function_name   = module.lambda.bike_availability_lambda_function_name
  discount_management_lambda_arn           = module.lambda.discount_management_lambda_arn
  discount_management_lambda_invoke_arn    = module.lambda.discount_management_lambda_invoke_arn
  discount_management_lambda_function_name = module.lambda.discount_management_lambda_function_name
}


# ================================
# CHATBOT MODULE (COMMENTED OUT - REQUIRES NEWER AWS PROVIDER)
# ================================
# module "chatbot" {
#   source = "./modules/chatbot"
# }

# ================================
# API GATEWAY OUTPUTS
# ================================

 
 output "cognito_user_pool_id" {
   description = "value of Cognito client ID"
   value       = aws_cognito_user_pool.pool.id
 }
 
output "cognito_client_id" {
  description = "value of Cognito user pool ID"
  value       = aws_cognito_user_pool_client.client.id
}
output "api_gateway_deployment_invoke_url" {
  description = "API Gateway deployment invoke URL (for Frontend.tf compatibility)"
  value       = module.apis.api_gateway_deployment_invoke_url
}
