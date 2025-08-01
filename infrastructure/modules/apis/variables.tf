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

variable "process_heartbeat_lambda_arn" {
  description = "ARN of the process heartbeat Lambda function"
  type        = string
}

variable "process_heartbeat_lambda_invoke_arn" {
  description = "Invoke ARN of the process heartbeat Lambda function"
  type        = string
}

variable "process_heartbeat_lambda_function_name" {
  description = "Function name of the process heartbeat Lambda"
  type        = string
}
variable "get_active_users_lambda_arn" {
  description = "ARN of the get logged in users Lambda function"
  type        = string
}

variable "get_active_users_lambda_invoke_arn" {
  description = "Invoke ARN of the get logged in users Lambda function"
  type        = string
}

variable "get_active_users_lambda_function_name" {
  description = "Function name of the get logged in users Lambda"
  type        = string
}

# Messaging Lambda Variables
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

variable "get_customer_messages_lambda_arn" {
  description = "ARN of the get customer messages Lambda function"
  type        = string
}

variable "get_customer_messages_lambda_invoke_arn" {
  description = "Invoke ARN of the get customer messages Lambda function"
  type        = string
}

# Post Feedback Lambda Variables
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

# Get Feedback Lambda Variables
variable "get_feedback_lambda_arn" {
  description = "ARN of the get feedback Lambda function"
  type        = string
}

variable "get_feedback_lambda_invoke_arn" {
  description = "Invoke ARN of the get feedback Lambda function"
  type        = string
}

variable "get_feedback_lambda_function_name" {
  description = "Function name of the get feedback Lambda"
  type        = string
}

# Bike Inventory Lambda Variables
variable "bike_management_lambda_arn" {
  description = "ARN of the bike management Lambda function"
  type        = string
}

variable "booking_request_lambda_invoke_arn" {
  description = "Invoke ARN of the booking request Lambda function"
  type        = string
}

variable "get_my_bookings_lambda_invoke_arn" {
  description = "Invoke ARN of the get my bookings Lambda function"
  type        = string
}

variable "get_my_bookings_lambda_function_name" {
  description = "Function name of the get my bookings Lambda"
  type        = string
}
variable "bike_management_lambda_invoke_arn" {
  description = "Invoke ARN of the bike management Lambda function"
  type        = string
}

variable "bike_management_lambda_function_name" {
  description = "Name of the bike management Lambda function"
  type        = string
}

variable "bike_availability_lambda_arn" {
  description = "ARN of the bike availability Lambda function"
  type        = string
}

variable "bike_availability_lambda_invoke_arn" {
  description = "Invoke ARN of the bike availability Lambda function"
  type        = string
}

variable "bike_availability_lambda_function_name" {
  description = "Name of the bike availability Lambda function"
  type        = string
}

variable "discount_management_lambda_arn" {
  description = "ARN of the discount management Lambda function"
  type        = string
}

variable "discount_management_lambda_invoke_arn" {
  description = "Invoke ARN of the discount management Lambda function"
  type        = string
}

variable "discount_management_lambda_function_name" {
  description = "Name of the discount management Lambda function"
  type        = string
}


variable "booking_request_lambda_function_name" {
  description = "Function name of the booking request Lambda"
  type        = string  
}