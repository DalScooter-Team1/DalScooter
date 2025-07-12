# ================================
# API GATEWAY MODULE VARIABLES
# ================================

variable "customer_lambda_arn" {
  description = "ARN of the customer authenticator Lambda function"
  type        = string
}

variable "customer_lambda_invoke_arn" {
  description = "Invoke ARN of the customer authenticator Lambda function"
  type        = string
}

variable "admin_lambda_arn" {
  description = "ARN of the admin authenticator Lambda function"
  type        = string
}

variable "admin_lambda_invoke_arn" {
  description = "Invoke ARN of the admin authenticator Lambda function"
  type        = string
}

variable "user_registration_lambda_arn" {
  description = "ARN of the user registration Lambda function"
  type        = string
}

variable "user_registration_lambda_invoke_arn" {
  description = "Invoke ARN of the user registration Lambda function"
  type        = string
}

variable "user_registration_lambda_function_name" {
  description = "Function name of the user registration Lambda"
  type        = string
}

variable "admin_creation_lambda_arn" {
  description = "ARN of the admin creation Lambda function"
  type        = string
}

variable "admin_creation_lambda_invoke_arn" {
  description = "Invoke ARN of the admin creation Lambda function"
  type        = string
}

variable "admin_creation_lambda_function_name" {
  description = "Function name of the admin creation Lambda"
  type        = string
}
