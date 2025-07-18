# ================================
# LAMBDA MODULE VARIABLES
# ================================

# Cognito Variables
variable "cognito_user_pool_id" {
  description = "ID of the Cognito User Pool"
  type        = string
}

variable "cognito_user_pool_arn" {
  description = "ARN of the Cognito User Pool"
  type        = string
}

variable "cognito_client_id" {
  description = "ID of the Cognito User Pool Client"
  type        = string
}

# DynamoDB Variables
variable "security_questions_table_name" {
  description = "Name of the security questions DynamoDB table"
  type        = string
}

variable "security_questions_table_arn" {
  description = "ARN of the security questions DynamoDB table"
  type        = string
}

variable "logged_in_user_directory_table_name" {
  description = "Name of the logged-in user directory DynamoDB table"
  type        = string
}

variable "logged_in_user_directory_table_arn" {
  description = "ARN of the logged-in user directory DynamoDB table"
  type        = string
}

# SNS Variables
variable "signup_login_topic_arn" {
  description = "ARN of the signup/login SNS topic"
  type        = string
}

variable "submit_concern_lambda_arn" {
  description = "ARN of the submit concern Lambda function"
  type        = string
}

variable "submit_concern_lambda_invoke_arn" {
  description = "Invoke ARN of the submit concern Lambda function"
  type        = string
}

variable "respond_concern_lambda_arn" {
  description = "ARN of the respond concern Lambda function"
  type        = string
}

variable "respond_concern_lambda_invoke_arn" {
  description = "Invoke ARN of the respond concern Lambda function"
  type        = string
}

variable "get_concerns_lambda_arn" {
  description = "ARN of the get concerns Lambda function"
  type        = string
}

variable "get_concerns_lambda_invoke_arn" {
  description = "Invoke ARN of the get concerns Lambda function"
  type        = string
}
