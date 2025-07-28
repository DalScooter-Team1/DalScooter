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

variable "logged_in_user_directory_stream_arn" {
  description = "Stream ARN of the logged-in user directory DynamoDB table"
  type        = string
}

# SNS Variables
variable "signup_login_topic_arn" {
  description = "ARN of the signup/login SNS topic"
  type        = string
}

# Messages Table Variables (for process_concern Lambda)
variable "dynamodb_table_name" {
  description = "Name of the messages DynamoDB table"
  type        = string
}

variable "dynamodb_table_arn" {
  description = "ARN of the messages DynamoDB table"
  type        = string
}

# User Pool Variables (alternative naming for process_concern Lambda)
variable "user_pool_id" {
  description = "ID of the Cognito User Pool (alias for cognito_user_pool_id)"
  type        = string
}

variable "user_pool_arn" {
  description = "ARN of the Cognito User Pool (alias for cognito_user_pool_arn)"
  type        = string
}

# SQS Variables
variable "concerns_queue_arn" {
  description = "ARN of the concerns SQS queue"
  type        = string
}

variable "concerns_queue_url" {
  description = "URL of the concerns SQS queue"
  type        = string
}

# Bike Inventory Variables
variable "bikes_table_name" {
  description = "Name of the bikes DynamoDB table"
  type        = string
}

variable "bikes_table_arn" {
  description = "ARN of the bikes DynamoDB table"
  type        = string
}

variable "discount_codes_table_name" {
  description = "Name of the discount codes DynamoDB table"
  type        = string
}

variable "discount_codes_table_arn" {
  description = "ARN of the discount codes DynamoDB table"
  type        = string
}

variable "user_discount_usage_table_name" {
  description = "Name of the user discount usage DynamoDB table"
  type        = string
}

variable "user_discount_usage_table_arn" {
  description = "ARN of the user discount usage DynamoDB table"
  type        = string
}
