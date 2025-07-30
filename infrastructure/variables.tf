# variable "user_pool_name" {
#   description = "Name of the Cognito User Pool"
#   type        = string
# }

# variable "user_pool_client_name" {
#   description = "Name of the Cognito User Pool Client"
#   type        = string
# }

# variable "explicit_auth_flows" {
#   description = "List of explicit auth flows for the Cognito User Pool Client"
#   type        = list(string)

# }

# variable "customer_group_name" {
#   description = "Name of the Customer User Group"
#   type        = string
# }

# variable "customer_group_description" {
#   description = "Description of the Customer User Group"
#   type        = string
# }

# variable "customer_group_precedence" {
#   description = "Precedence of the Customer User Group"
#   type        = number
# }

# variable "franchise_group_name" {
#   description = "Name of the Franchise User Group"
#   type        = string
# }

# variable "franchise_group_description" {
#   description = "Description of the Franchise User Group"
#   type        = string
# }

# variable "franchise_group_precedence" {
#   description = "Precedence of the Franchise User Group"
#   type        = number
# }

# variable "security_questions_table_name" {
#   description = "Name of the DynamoDB table for user security questions"
#   type        = string
# }

# variable "security_questions_table_tags" {
#   description = "Tags for the DynamoDB table for user security questions"
#   type        = map(string)
# }

# variable "logged_in_user_directory_table_name" {
#   description = "Name of the DynamoDB table for logged-in user directory"
#   type        = string
# }

# variable "logged_in_user_directory_table_tags" {
#   description = "Tags for the DynamoDB table for logged-in user directory"
#   type        = map(string)
# }

# S3 bucket for logged in user directory stream
variable "s3_bucket_name" {
  description = "Name of the S3 bucket to store CSV logs for logged in user directory stream"
  type        = string
  default = "dalscooter-logged-in-user-directory12-123123"
 
}

variable "s3_folder" {
  description = "S3 folder for CSV logs (optional)"
  type        = string
  default     = "logged_in_user_directory/"
}

# Booking table name var from booking_cleanup 
variable "booking_table_name" {
  description = "Name of the DynamoDB bookings table"
  type        = string
  default     = "dalscooter-bookings"
}

# AWS region variable
variable "region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}
