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

  default = "dalscooter-logged-in-users"


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

# ================================
# RDS VARIABLES
# ================================

variable "rds_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro" # Smallest instance for faster creation
}

variable "rds_allocated_storage" {
  description = "Initial allocated storage for RDS instance (GB)"
  type        = number
  default     = 20 # Minimum for faster creation
}

variable "rds_max_allocated_storage" {
  description = "Maximum allocated storage for RDS instance (GB)"
  type        = number
  default     = 50 # Reduced for faster creation
}

variable "rds_engine" {
  description = "Database engine for RDS instance"
  type        = string
  default     = "mysql"
}

variable "rds_engine_version" {
  description = "Database engine version"
  type        = string
  default     = "8.0"
}

variable "rds_database_name" {
  description = "Name of the database to create"
  type        = string
  default     = "dalscooter"
}

variable "rds_username" {
  description = "Master username for the database"
  type        = string
  default     = "admin"
}

variable "rds_password" {
  description = "Master password for the database"
  type        = string
  default     = "dalscooter123!"
  sensitive   = true
}

