# ================================
# LAMBDA MODULE OUTPUTS
# ================================

# User Registration Lambda
output "user_registration_lambda_arn" {
  description = "ARN of the user registration Lambda function"
  value       = aws_lambda_function.user_registration.arn
}

output "user_registration_lambda_invoke_arn" {
  description = "Invoke ARN of the user registration Lambda function"
  value       = aws_lambda_function.user_registration.invoke_arn
}

output "user_registration_lambda_function_name" {
  description = "Function name of the user registration Lambda"
  value       = aws_lambda_function.user_registration.function_name
}

# Auth Challenge Lambdas
output "define_auth_challenge_lambda_arn" {
  description = "ARN of the define auth challenge Lambda function"
  value       = aws_lambda_function.define_auth_challenge.arn
}

output "define_auth_challenge_lambda_function_name" {
  description = "Function name of the define auth challenge Lambda"
  value       = aws_lambda_function.define_auth_challenge.function_name
}

output "create_auth_challenge_lambda_arn" {
  description = "ARN of the create auth challenge Lambda function"
  value       = aws_lambda_function.create_auth_challenge.arn
}

output "create_auth_challenge_lambda_function_name" {
  description = "Function name of the create auth challenge Lambda"
  value       = aws_lambda_function.create_auth_challenge.function_name
}

output "verify_auth_challenge_lambda_arn" {
  description = "ARN of the verify auth challenge Lambda function"
  value       = aws_lambda_function.verify_auth_challenge.arn
}

output "verify_auth_challenge_lambda_id" {
  description = "ID of the verify auth challenge Lambda function"
  value       = aws_lambda_function.verify_auth_challenge.id
}

output "verify_auth_challenge_lambda_function_name" {
  description = "Function name of the verify auth challenge Lambda"
  value       = aws_lambda_function.verify_auth_challenge.function_name
}

# Admin Creation Lambda
output "admin_creation_lambda_arn" {
  description = "ARN of the admin creation Lambda function"
  value       = aws_lambda_function.admin_creation.arn
}

output "admin_creation_lambda_invoke_arn" {
  description = "Invoke ARN of the admin creation Lambda function"
  value       = aws_lambda_function.admin_creation.invoke_arn
}

output "admin_creation_lambda_function_name" {
  description = "Function name of the admin creation Lambda"
  value       = aws_lambda_function.admin_creation.function_name
}

# Authenticator Lambdas
output "customer_authenticator_lambda_arn" {
  description = "ARN of the customer authenticator Lambda function"
  value       = aws_lambda_function.customer_authenticator.arn
}

output "customer_authenticator_lambda_invoke_arn" {
  description = "Invoke ARN of the customer authenticator Lambda function"
  value       = aws_lambda_function.customer_authenticator.invoke_arn
}

output "admin_authenticator_lambda_arn" {
  description = "ARN of the admin authenticator Lambda function"
  value       = aws_lambda_function.admin_authenticator.arn
}

output "admin_authenticator_lambda_invoke_arn" {
  description = "Invoke ARN of the admin authenticator Lambda function"
  value       = aws_lambda_function.admin_authenticator.invoke_arn
}

# Notification Lambda
output "notification_lambda_arn" {
  description = "ARN of the notification Lambda function"
  value       = aws_lambda_function.notification.arn
}

output "notification_lambda_function_name" {
  description = "Function name of the notification Lambda"
  value       = aws_lambda_function.notification.function_name
}

# Get Customers Lambda
output "get_customers_lambda_arn" {
  description = "ARN of the get customers Lambda function"
  value       = aws_lambda_function.get_customers.arn
}

output "get_customers_lambda_invoke_arn" {
  description = "Invoke ARN of the get customers Lambda function"
  value       = aws_lambda_function.get_customers.invoke_arn
}

output "get_customers_lambda_function_name" {
  description = "Function name of the get customers Lambda"
  value       = aws_lambda_function.get_customers.function_name
}
