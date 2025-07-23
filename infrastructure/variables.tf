variable "user_pool_name" {
  description = "Name of the Cognito User Pool"
  type        = string
}

variable "user_pool_client_name" {
  description = "Name of the Cognito User Pool Client"
  type        = string
}

variable "explicit_auth_flows" {
  description = "List of explicit auth flows for the Cognito User Pool Client"
  type        = list(string)
}

variable "customer_group_name" {
  description = "Name of the Customer User Group"
  type        = string
}

variable "customer_group_description" {
  description = "Description of the Customer User Group"
  type        = string
}

variable "customer_group_precedence" {
  description = "Precedence of the Customer User Group"
  type        = number
}

variable "franchise_group_name" {
  description = "Name of the Franchise User Group"
  type        = string
}

variable "franchise_group_description" {
  description = "Description of the Franchise User Group"
  type        = string
}

variable "franchise_group_precedence" {
  description = "Precedence of the Franchise User Group"
  type        = number
}

variable "security_questions_table_name" {
  description = "Name of the DynamoDB table for user security questions"
  type        = string
}

variable "security_questions_table_tags" {
  description = "Tags for the DynamoDB table for user security questions"
  type        = map(string)
}

variable "logged_in_user_directory_table_name" {
  description = "Name of the DynamoDB table for logged-in user directory"
  type        = string
}

variable "logged_in_user_directory_table_tags" {
  description = "Tags for the DynamoDB table for logged-in user directory"
  type        = map(string)
}
