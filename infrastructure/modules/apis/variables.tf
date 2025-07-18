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

variable "get_customers_lambda_arn" {
  description = "ARN of the get customers Lambda function"
  type        = string
}

variable "get_customers_lambda_invoke_arn" {
  description = "Invoke ARN of the get customers Lambda function"
  type        = string
}

variable "get_customers_lambda_function_name" {
  description = "Function name of the get customers Lambda"
  type        = string
}

variable "get_logged_in_users_lambda_arn" {
  description = "ARN of the get logged in users Lambda function"
  type        = string
}

variable "get_logged_in_users_lambda_invoke_arn" {
  description = "Invoke ARN of the get logged in users Lambda function"
  type        = string
}

variable "get_logged_in_users_lambda_function_name" {
  description = "Function name of the get logged in users Lambda"
  type        = string
}

variable "get_active_users_lambda_arn" {
  description = "ARN of the get active users Lambda function"
  type        = string
}

variable "get_active_users_lambda_invoke_arn" {
  description = "Invoke ARN of the get active users Lambda function"
  type        = string
}

variable "get_active_users_lambda_function_name" {
  description = "Function name of the get active users Lambda"
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

variable "post_feedback_lambda_arn" {
  description = "ARN of the post feedback Lambda function"
  type        = string
}

variable "post_feedback_lambda_invoke_arn" {
  description = "Invoke ARN of the post feedback Lambda function"
  type        = string
}

variable "post_feedback_lambda_function_name" {
  description = "Function name of the post feedback Lambda"
  type        = string
}
