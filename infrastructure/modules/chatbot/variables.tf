variable "bot_name" {
  description = "Lex bot name"
  type        = string
  default     = "DalAssistant"
}

variable "locale_id" {
  description = "Lex locale ID"
  type        = string
  default     = "en_US"
}

variable "booking_table_name" {
  description = "Name of the DynamoDB table holding bookings"
  type        = string
}

variable "aws_region" {
  description = "region"
  type        = string
  default     = "us-east-1"
}

variable "submit_concern_lambda_arn" {
  description = "arn for concern_submit function"
  type        = string
}
